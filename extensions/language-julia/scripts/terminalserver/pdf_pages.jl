# Pollis: the pages of a PDF for the Select Area pane of PDF Files, drawn by Poppler. Run by the Julia extension in a
# hidden process (pollisHiddenJulia.ts), in its own environment, ~/.pollis/pdf/julia/vX.Y, which it makes with
# Poppler_jll, JSON3 and PollisDatasets the first time; the user's environments are never touched. It reads a request
# in JSON per line on stdin and writes the answer, with the request's id, as a line on stdout. `file` is a path,
# relative to `cwd` unless absolute, or sample.pdf, the sample of PollisDatasets, as in the panel's Example Code; an
# area is `x`, `y`, `W` and `H`, in points from the top left corner of page `page`:
#   {"id", "op": "page", "file", "cwd", "page", "dpi"} -> {"id", "pages", "page", "width", "height", "png"}
#   {"id", "op": "crop", "file", "cwd", "page", "x", "y", "W", "H", "dpi"} -> {"id", "png"}
#   {"id", "op": "text", "file", "cwd", "page", "x", "y", "W", "H"} -> {"id", "text"}
#   {"id", "op": "table", "file", "cwd", "page", "x", "y", "W", "H", "gap", "rowtol"} -> {"id", "csv", "rows", "columns"}
# `width` and `height` are the page's size in points, `png` an image as a data URL, `csv` the cells separated by
# semicolons. A request that fails is answered {"id", "error"}, the error being notFound, noPassword or the message of
# the tool. While it installs the packages it writes {"status": "installing"}, then {"status": "ready"}.
import Pkg

const ENVIRONMENT = joinpath(homedir(), ".pollis", "pdf", "julia", "v$(VERSION.major).$(VERSION.minor)")
const DATASETS_URL = "https://github.com/Trumpingtons/PollisDatasets.jl"
Pkg.activate(ENVIRONMENT; io = devnull)
installed = Set(info.name for info in values(Pkg.dependencies()) if info.is_direct_dep)
if !all(name -> name in installed, ("Poppler_jll", "JSON3", "PollisDatasets"))
    println("{\"status\":\"installing\"}")
    flush(stdout)
    "PollisDatasets" in installed || Pkg.add(url = DATASETS_URL; io = devnull)
    Pkg.add([name for name in ("Poppler_jll", "JSON3") if !(name in installed)]; io = devnull)
end

using Poppler_jll, JSON3, PollisDatasets, Base64

println("{\"status\":\"ready\"}")
flush(stdout)

"""The path of the PDF of a request: sample.pdf is the sample of PollisDatasets, as in Example Code."""
function pdfpath(request)
    file = String(request.file)
    file == "sample.pdf" && return samplefile("sample.pdf")
    path = isabspath(file) ? file : joinpath(String(get(request, :cwd, pwd())), file)
    isfile(path) || throw(ArgumentError("notFound"))
    return path
end

"""What a Poppler tool writes to stdout, or an error with what it writes to stderr."""
function tool(cmd::Cmd)
    out, err = IOBuffer(), IOBuffer()
    ok = success(pipeline(cmd; stdout = out, stderr = err))
    ok || throw(ErrorException(occursin("Incorrect password", String(take!(copy(err)))) ? "noPassword" : strip(String(take!(err)))))
    return take!(out)
end

"""The size in points of page `page`, from pdfinfo, and the number of pages."""
function pagesize(pdf, page)
    info = String(tool(`$(pdfinfo()) -f $page -l $page $pdf`))
    pages = parse(Int, match(r"Pages:\s+(?<n>\d+)", info)[:n])
    m = match(r"Page\s+\d+\s+size:\s+(?<w>[\d.]+) x (?<h>[\d.]+)", info)
    return pages, parse(Float64, m[:w]), parse(Float64, m[:h])
end

"""An image of a page, or of an area of it in points, as a PNG data URL."""
function png(pdf, page, dpi; area = nothing)
    # pdftoppm takes the area in pixels at the resolution
    args = area === nothing ? String[] : collect(Iterators.flatten(zip(["-x", "-y", "-W", "-H"], string.(round.(Int, area .* dpi ./ 72)))))
    bytes = tool(`$(pdftoppm()) -png -r $dpi -f $page -l $page -singlefile $args $pdf`)
    return "data:image/png;base64," * base64encode(bytes)
end

area(request) = (Float64(request.x), Float64(request.y), Float64(request.W), Float64(request.H))

"""The cells of the words in an area: rows by the tops of the words, columns by the gaps between them, as in the Tables tab."""
function cells(pdf, page, (ax, ay, aw, ah), gap, rowtol)
    tsv = String(tool(`$(pdftotext()) -tsv -f $page -l $page $pdf -`))
    words = @NamedTuple{x::Float64, y::Float64, w::Float64, text::String}[]
    for line in split(tsv, '\n')[2:end]
        f = split(line, '\t')
        (length(f) == 12 && f[1] == "5") || continue
        x, y, w, h = parse.(Float64, f[7:10])
        ax <= x + w / 2 <= ax + aw && ay <= y + h / 2 <= ay + ah && push!(words, (x = x, y = y, w = w, text = String(f[12])))
    end
    isempty(words) && return fill("", 0, 0)
    sort!(words, by = w -> (w.y, w.x))
    rows = [[words[1]]]
    for w in words[2:end]
        w.y - rows[end][1].y <= rowtol ? push!(rows[end], w) : push!(rows, [w])
    end
    spans = sort([(w.x, w.x + w.w) for w in words])
    cols = [spans[1]]
    for (a, b) in spans[2:end]
        a - cols[end][2] < gap ? (cols[end] = (cols[end][1], max(cols[end][2], b))) : push!(cols, (a, b))
    end
    table = fill("", length(rows), length(cols))
    for (i, row) in enumerate(rows), w in sort(row, by = w -> w.x)
        j = findlast(c -> c[1] <= w.x + w.w / 2, cols)
        table[i, j] = isempty(table[i, j]) ? w.text : table[i, j] * " " * w.text
    end
    return table
end

"""A cell of the CSV: quoted when it has a semicolon, a quote or a line break."""
csvcell(s) = occursin(r"[;\"\n]", s) ? "\"" * replace(s, "\"" => "\"\"") * "\"" : s

function answer(request)
    op = String(request.op)
    pdf = pdfpath(request)
    page = Int(get(request, :page, 1))
    if op == "page"
        pages, width, height = pagesize(pdf, page)
        return Dict(:pages => pages, :page => page, :width => width, :height => height, :png => png(pdf, page, Int(get(request, :dpi, 144))))
    elseif op == "crop"
        return Dict(:png => png(pdf, page, Int(get(request, :dpi, 144)); area = area(request)))
    elseif op == "text"
        x, y, w, h = round.(Int, area(request))
        text = String(tool(`$(pdftotext()) -layout -f $page -l $page -x $x -y $y -W $w -H $h $pdf -`))
        # Without the form feed and the empty lines around the text, but with the spaces of its first line
        return Dict(:text => rstrip(replace(text, '\f' => "", r"^(\s*\n)+" => "")))
    elseif op == "table"
        table = cells(pdf, page, area(request), Float64(get(request, :gap, 8)), Float64(get(request, :rowtol, 3)))
        csv = join([join(csvcell.(table[i, :]), ';') for i in axes(table, 1)], '\n')
        return Dict(:csv => csv, :rows => size(table, 1), :columns => size(table, 2))
    end
    throw(ArgumentError("unknown op $op"))
end

while !eof(stdin)
    line = readline(stdin)
    isempty(strip(line)) && continue
    request = nothing
    reply = try
        request = JSON3.read(line)
        Dict{Symbol, Any}(answer(request))
    catch err
        Dict{Symbol, Any}(:error => err isa ArgumentError || err isa ErrorException ? err.msg : sprint(showerror, err))
    end
    reply[:id] = request === nothing ? nothing : get(request, :id, nothing)
    println(JSON3.write(reply))
    flush(stdout)
end
