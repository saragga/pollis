# Compose > New Methods > Package and Publish: turns each method folder into a Julia package whose
# tests are the method's target tables, computed from its input tables, and runs them. With --push
# OWNER, a package whose tests all pass is pushed to github.com/OWNER/NAME.jl (GitHub CLI, gh).
#
#   julia package.jl PACKAGES_FOLDER METHOD_FOLDER... [--push OWNER]
#
# A method folder holds method.toml (name, title, author, description, citation, packages, and a
# [targets.NAME] table for each target: source, call, tolerance, and an [inputs.NAME] table for each input:
# url, source, delim, columns), src/NAME.jl (module NAME) and targets/*.csv. The inputs are only links: the
# tests download them into memory, writing nothing to disk. A target table's first column holds the row
# labels and its other cells the published values as printed; the call is the Julia expression that
# computes them from the inputs, each input a variable named after its table and holding a Tables.jl
# column table. A value passes when the
# result, rounded to the digits printed, equals it, within `tolerance` units of the last printed digit.

using Pkg, TOML, UUIDs

function arguments(args)
	push = findfirst(==("--push"), args)
	owner = push === nothing ? nothing : args[push + 1]
	rest = push === nothing ? args : [args[1:push - 1]; args[push + 2:end]]
	return rest[1], rest[2:end], owner
end

"The test file: one testset per target, one test per printed value."
function runtests(name, method)
	targets = get(method, "targets", Dict{String, Any}())
	lines = [
		"# Made by Pollis (Compose > New Methods > Package and Publish) from method.toml: change the method, not this file.",
		"using Test, CSV, Downloads, Tables, $name",
		"",
		"const DATA = joinpath(@__DIR__, \"data\")",
		"",
		"\"An input table, downloaded from its link into memory.\"",
		"function input(url; delim = ',', columns = nothing)",
		"\tbytes = take!(Downloads.download(url, IOBuffer()))",
		"\theader = columns === nothing ? 1 : Symbol.(columns)",
		"\tfile = delim == \"whitespace\" ? CSV.File(bytes; header, delim = ' ', ignorerepeated = true, stripwhitespace = true) : CSV.File(bytes; header, delim = delim == \"tab\" ? '\\t' : only(delim))",
		"\treturn Tables.columntable(file)",
		"end",
		"",
		"\"The published table: its row labels and its values as printed, `nothing` where a cell is empty.\"",
		"function target(file)",
		"\ttable = CSV.File(joinpath(DATA, \"targets\", file * \".csv\"); types = String)",
		"\tcolumns = Tables.columnnames(table)",
		"\trows = [string(coalesce(row[columns[1]], \"\")) for row in table]",
		"\tvalues = [let cell = row[column]; cell === missing ? nothing : strip(cell) end for row in table, column in columns[2:end]]",
		"\treturn rows, string.(columns[2:end]), values",
		"end",
		"",
		"\"Tests each printed value against the result rounded to the digits printed.\"",
		"function check(result, file, tolerance)",
		"\trows, columns, values = target(file)",
		"\tresult = result isa AbstractVecOrMat ? result : Tables.matrix(result)",
		"\tresult = reshape(result, size(result, 1), :)",
		"\t@test size(result) == size(values)",
		"\tfor i in axes(values, 1), j in axes(values, 2)",
		"\t\tprinted = values[i, j]",
		"\t\t(printed === nothing || isempty(printed)) && continue",
		"\t\tdigits = occursin('.', printed) ? length(split(printed, '.')[2]) : 0",
		"\t\tpublished = parse(Float64, printed)",
		"\t\tcomputed = round(result[i, j]; digits)",
		"\t\t@testset \"\$(rows[i]), \$(columns[j])\" begin",
		"\t\t\t@test isapprox(computed, published; atol = (tolerance + 1e-6) * 10.0^-digits)",
		"\t\tend",
		"\tend",
		"end",
		"",
		"@testset \"$name\" begin",
	]
	inputs = get(method, "inputs", Dict{String, Any}())
	for file in sort([splitext(file)[1] for file in readdir(joinpath(method["folder"], "targets")) if endswith(file, ".csv")])
		spec = get(targets, file, Dict{String, Any}())
		call = get(spec, "call", "")
		isempty(call) && error("targets/$file.csv has no call in method.toml ([targets.$file] call = \"...\")")
		push!(lines, "\t@testset $(repr(get(spec, "source", file))) begin")
		for (input, link) in sort(collect(inputs); by = first)
			occursin(Regex("\\b$input\\b"), call) || continue
			options = haskey(link, "delim") ? "; delim = $(repr(link["delim"]))" : ""
			haskey(link, "columns") && (options *= (isempty(options) ? "; " : ", ") * "columns = $(repr(string.(link["columns"])))")
			push!(lines, "\t\t$input = input($(repr(link["url"]))$options)")
		end
		push!(lines, "\t\tcheck($call, $(repr(file)), $(get(spec, "tolerance", 0)))", "\tend")
	end
	push!(lines, "end", "")
	return join(lines, "\n")
end

function readme(name, method)
	targets = get(method, "targets", Dict{String, Any}())
	lines = [
		"# $name.jl",
		"",
		get(method, "title", name) * ".",
		"",
		get(method, "description", ""),
		"",
	]
	citation = get(method, "citation", "")
	if !isempty(citation)
		doi = get(method, "doi", "")
		push!(lines, "Article: $citation" * (isempty(doi) ? "" : " [doi:$doi](https://doi.org/$doi)"), "")
	end
	push!(lines, "## Tests", "", "The tests compute the published tables below from their data and check every printed value, rounded to the digits printed:", "")
	for (file, spec) in sort(collect(targets); by = first)
		push!(lines, "- $(get(spec, "source", file)) (`test/data/targets/$file.csv`)")
	end
	inputs = get(method, "inputs", Dict{String, Any}())
	if !isempty(inputs)
		push!(lines, "", "The data is downloaded from its links when the tests run:", "")
		for (input, link) in sort(collect(inputs); by = first)
			source = get(link, "source", "")
			push!(lines, "- `$input`: <$(link["url"])>" * (isempty(source) ? "" : ", $source"))
		end
	end
	push!(lines, "", "Run them with `using Pkg; Pkg.test(\"$name\")`.", "", "Made with [Pollis](https://pollis.org).", "")
	return join(lines, "\n")
end

"Makes or refreshes the package of a method in the packages folder; returns its folder."
function package(packages, folder)
	method = TOML.parsefile(joinpath(folder, "method.toml"))
	method["folder"] = folder
	name = method["name"]
	occursin(r"^[A-Z][A-Za-z0-9]*$", name) || error("method.toml: name = \"$name\" is not a package name (a capital letter, then letters and digits)")
	isfile(joinpath(folder, "src", "$name.jl")) || error("$(joinpath(folder, "src", "$name.jl")) is missing")
	root = joinpath(packages, "$name.jl")
	println("\nPackaging $name in $root")

	mkpath(root)
	project = joinpath(root, "Project.toml")
	uuid = isfile(project) ? TOML.parsefile(project)["uuid"] : string(uuid4())
	author = get(method, "author", "")
	open(project, "w") do io
		TOML.print(io, Dict("name" => name, "uuid" => uuid, "version" => "0.1.0", "authors" => isempty(author) ? String[] : [author]); sorted = true)
	end
	for sub in ("src", joinpath("test", "data"))
		rm(joinpath(root, sub); force = true, recursive = true)
	end
	cp(joinpath(folder, "src"), joinpath(root, "src"))
	mkpath(joinpath(root, "test", "data"))
	cp(joinpath(folder, "targets"), joinpath(root, "test", "data", "targets"))
	write(joinpath(root, "test", "runtests.jl"), runtests(name, method))
	write(joinpath(root, "README.md"), readme(name, method))
	write(joinpath(root, ".gitignore"), "Manifest.toml\n")

	Pkg.activate(root)
	dependencies = get(method, "packages", String[])
	isempty(dependencies) || Pkg.add(dependencies)
	Pkg.activate(joinpath(root, "test"))
	Pkg.add(["Test", "CSV", "Downloads", "Tables"])
	Pkg.activate(root)
	return root, name
end

function publish(root, name, owner)
	cd(root) do
		isdir(".git") || run(`git init -b main`)
		run(`git add -A`)
		success(`git diff --cached --quiet`) || run(`git commit -m "Package $name, tested on its published tables"`)
		if success(pipeline(`git remote get-url origin`; stdout = devnull, stderr = devnull))
			run(`git push`)
		elseif Sys.which("gh") === nothing
			println("GitHub CLI (gh) not found: create github.com/$owner/$name.jl and push $root by hand.")
		else
			run(`gh repo create $owner/$name.jl --public --source . --remote origin --push`)
		end
	end
end

function main(args)
	packages, folders, owner = arguments(args)
	failed = String[]
	for folder in folders
		try
			root, name = package(packages, folder)
			Pkg.test()
			println("\n$name: all tests pass.")
			owner === nothing || publish(root, name, owner)
		catch error
			showerror(stdout, error)
			println("\n\n$(basename(folder)): not published.")
			push!(failed, basename(folder))
		end
	end
	isempty(failed) || println("\nFailed: ", join(failed, ", "))
end

main(ARGS)
