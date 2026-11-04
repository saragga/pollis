# Pollis: the Poppler tools of the PDF Viewer, and the path of the sample PDF of PollisDatasets for its Test PDF. Run
# by the Julia extension in a hidden process (pollisHiddenJulia.ts), in its own environment, ~/.pollis/pdf/julia/vX.Y,
# which it makes with JSON3, PollisDatasets and Poppler_jll the first time; the user's environments are never touched.
# It reads a request in JSON per line on stdin and writes the answer, with the request's id, as a line on stdout:
#   {"id", "op": "sample", "file": "sample.pdf"} -> {"id", "path"}
#   {"id", "op": "run", "tool": "pdftotext", "args": [...], "dir"?, "pages"?, "replace"?}
#     -> {"id", "code", "stdout", "stderr", "truncated", "files"}
#     runs one Poppler tool with the arguments given, or once for each of `pages`, with {page} in the arguments
#     replaced by the page; `replace` is a file removed first, for a tool that does not overwrite one; `files` are the
#     files written in `dir` while it ran.
#   {"id", "op": "pages", "file", "parts": [{"pages": [...], "out"}, ...]} -> {"id", "code", "stderr", "files"}
#     writes each part's pages of `file`, in its order, into one PDF, its `out`, with pdfseparate and pdfunite.
# A request that fails is answered {"id", "error"}. While it installs the packages it writes {"status": "installing"},
# then {"status": "ready"}.
import Pkg

const ENVIRONMENT = joinpath(homedir(), ".pollis", "pdf", "julia", "v$(VERSION.major).$(VERSION.minor)")
const DATASETS_URL = "https://github.com/Trumpingtons/PollisDatasets.jl"
Pkg.activate(ENVIRONMENT; io = devnull)
installed = Set(info.name for info in values(Pkg.dependencies()) if info.is_direct_dep)
if !all(name -> name in installed, ("JSON3", "PollisDatasets", "Poppler_jll"))
    println("{\"status\":\"installing\"}")
    flush(stdout)
    "PollisDatasets" in installed || Pkg.add(url = DATASETS_URL; io = devnull)
    "JSON3" in installed || Pkg.add("JSON3"; io = devnull)
    "Poppler_jll" in installed || Pkg.add("Poppler_jll"; io = devnull)
end

using JSON3, PollisDatasets, Poppler_jll

println("{\"status\":\"ready\"}")
flush(stdout)

# The tools a request may run, and nothing else
const TOOLS = Dict(
    "pdftotext" => pdftotext, "pdfinfo" => pdfinfo, "pdffonts" => pdffonts, "pdfimages" => pdfimages,
    "pdftoppm" => pdftoppm, "pdftocairo" => pdftocairo, "pdftops" => pdftops, "pdftohtml" => pdftohtml,
    "pdfseparate" => pdfseparate, "pdfunite" => pdfunite, "pdfdetach" => pdfdetach, "pdfattach" => pdfattach,
)

# The most of a tool's output that is sent back, in bytes
const MAX_OUTPUT = 4_000_000

"""The exit code, standard output and standard error of `tool` run with `args`; a failure is a code, not an error."""
function poppler(tool::String, args::Vector{String})
    out = IOBuffer()
    err = IOBuffer()
    process = run(pipeline(ignorestatus(`$(TOOLS[tool]()) $args`); stdout = out, stderr = err))
    return process.exitcode, String(take!(out)), String(take!(err))
end

"""The files of `dir` written at or after `since`, a time from `time()`."""
written(dir::String, since::Float64) = sort([file for file in readdir(dir; join = true) if isfile(file) && mtime(file) >= since - 1])

function answer(request)
    op = String(request.op)
    if op == "sample"
        path = samplefile(String(request.file))
        isfile(path) || throw(ArgumentError("notFound"))
        return Dict(:path => path)
    elseif op == "run"
        tool = String(request.tool)
        haskey(TOOLS, tool) || throw(ArgumentError("unknown tool $tool"))
        args = String[String(arg) for arg in request.args]
        dir = haskey(request, :dir) && request.dir !== nothing ? String(request.dir) : nothing
        dir === nothing || mkpath(dir)
        haskey(request, :replace) && request.replace !== nothing && rm(String(request.replace); force = true)
        since = time()
        if haskey(request, :pages) && request.pages !== nothing
            code, out, err = 0, "", ""
            for page in request.pages
                code, pageout, pageerr = poppler(tool, replace.(args, "{page}" => string(Int(page))))
                out *= pageout
                err *= pageerr
                code == 0 || break
            end
        else
            code, out, err = poppler(tool, args)
        end
        truncated = sizeof(out) > MAX_OUTPUT
        truncated && (out = out[1:prevind(out, MAX_OUTPUT)])
        files = dir === nothing ? String[] : written(dir, since)
        return Dict(:code => code, :stdout => out, :stderr => err, :truncated => truncated, :files => files)
    elseif op == "pages"
        file = String(request.file)
        parts = [(pages = Int[Int(p) for p in part.pages], out = String(part.out)) for part in request.parts]
        all(part -> !isempty(part.pages), parts) || throw(ArgumentError("a part has no pages"))
        first_page = minimum(minimum(part.pages) for part in parts)
        last_page = maximum(maximum(part.pages) for part in parts)
        separate = mktempdir()
        files = String[]
        try
            code, _, err = poppler("pdfseparate", ["-f", string(first_page), "-l", string(last_page), file, joinpath(separate, "%d.pdf")])
            code == 0 || return Dict(:code => code, :stderr => err, :files => files)
            for part in parts
                pages = [joinpath(separate, "$p.pdf") for p in part.pages]
                if length(pages) == 1
                    cp(pages[1], part.out; force = true)
                else
                    code, _, err = poppler("pdfunite", [pages; part.out])
                    code == 0 || return Dict(:code => code, :stderr => err, :files => files)
                end
                push!(files, part.out)
            end
        finally
            rm(separate; recursive = true, force = true)
        end
        return Dict(:code => 0, :stderr => "", :files => files)
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
