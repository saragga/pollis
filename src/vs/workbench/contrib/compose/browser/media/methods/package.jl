# Compose > New Methods > Package and Publish: turns each method folder into a Julia package whose
# tests are the method's target tables, computed from its input tables, and runs them. With --push
# OWNER, a package whose tests all pass is pushed to github.com/OWNER/NAME.jl (GitHub CLI, gh). With
# --register URL as well, a pushed package that also meets the Pollis registry rules (a name of at least
# 5 characters, a usage example, a docstring for every exported name) is registered in the registry at URL
# (LocalRegistry.jl). The rules are checked, and reported, every time. A registered package with a vignette
# (vignette/NAME.pdf) also gets an entry in Vignettes.toml at the registry's root, the list that
# Help > Documentation > Package Vignettes shows. With --no-tests, the tests are written but not run, to push or
# register packages already tested and unchanged since. A package with a vignette also carries
# vignette/Vignette.toml, its entry, which Help > Documentation > Package Vignettes reads once the package is installed.
#
#   julia package.jl PACKAGES_FOLDER METHOD_FOLDER... [--no-tests] [--push OWNER [--register REGISTRY_URL]]
#
# A method folder holds method.toml (name, title, author, description, topic, license (optional: MIT, written as
# the package's LICENSE, or another whose text is the method folder's LICENSE; none when empty), citation, version, usage (Julia code
# that shows how to call the method, for the README), packages, and a
# [targets.NAME] table for each target: source, call, tolerance, and an [inputs.NAME] table for each input:
# url or file, source, delim, columns, header (false for a file without a header line, its columns then
# Column1, Column2, ...), skipto, limit), src/NAME.jl (module NAME), targets/*.csv and inputs/*.csv. An input is
# a link, which the tests download into memory, writing nothing to disk, or a file of the method
# (file = "inputs/NAME.csv", typed in from the article), copied into the package's tests. A target table's first column holds the row
# labels and its other cells the published values as printed; the call is the Julia expression that
# computes them from the inputs, each input a variable named after its table and holding a Tables.jl
# column table. A value passes when the
# result, rounded to the digits printed, equals it, within `tolerance` units of the last printed digit
# (in scientific notation, as 1.64e-09, the last digit of the mantissa). A target with run = "named" is
# tested only when its name is passed to the tests, as Pkg.test("NAME"; test_args = ["TARGET"]), for targets
# too slow for every run. An optional [tests] table adds hand-written tests: file, a Julia file of the method
# folder that the tests include; copy, the other files and folders of the method folder it needs, copied into the
# package's tests at the same paths; packages, the packages it loads beyond the method's and the tests' own.

using Dates, Pkg, TOML, UUIDs

"The value of an option and the arguments without it."
function option(args, flag)
	at = findfirst(==(flag), args)
	at === nothing && return nothing, args
	return args[at + 1], [args[1:at - 1]; args[at + 2:end]]
end

function arguments(args)
	owner, args = option(args, "--push")
	registry, args = option(args, "--register")
	skip = "--no-tests" in args
	args = filter(!=("--no-tests"), args)
	return args[1], args[2:end], owner, registry, skip
end

const MINIMUM_NAME = 5

"The test file: one testset per target, one test per printed value."
function runtests(name, method)
	targets = get(method, "targets", Dict{String, Any}())
	lines = [
		"# Made by Pollis (Compose > New Methods > Package and Publish) from method.toml: change the method, not this file.",
		"using Test, CSV, Downloads, Tables, $name",
		"",
		"const DATA = joinpath(@__DIR__, \"data\")",
		"",
		"\"An input table: a file of the tests, or downloaded from its link into memory.\"",
		"function input(source; delim = ',', columns = nothing, header = true, skipto = nothing, limit = nothing)",
		"\tbytes = startswith(source, r\"https?://\") ? take!(Downloads.download(source, IOBuffer())) : read(joinpath(DATA, source))",
		"\tnamed = columns === nothing && header",
		"\theader = columns !== nothing ? Symbol.(columns) : named ? 1 : false",
		"\trows = (; skipto = something(skipto, named ? 2 : 1), limit)",
		"\tfile = delim == \"whitespace\" ? CSV.File(bytes; header, rows..., delim = ' ', ignorerepeated = true, stripwhitespace = true) : CSV.File(bytes; header, rows..., delim = delim == \"tab\" ? '\\t' : only(delim))",
		"\treturn Tables.columntable(file)",
		"end",
		"",
		"\"The published table: its row labels and its values as printed, `nothing` where a cell is empty.\"",
		"function target(file)",
		"\ttable = CSV.File(joinpath(DATA, \"targets\", file * \".csv\"); types = String, delim = ',')",
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
		"\t\tmantissa, exponent = occursin(r\"[eE]\", printed) ? split(printed, r\"[eE]\") : (printed, \"0\")",
		"\t\tdigits = (occursin('.', mantissa) ? length(split(mantissa, '.')[2]) : 0) - parse(Int, exponent)",
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
	extra = get(method, "tests", Dict{String, Any}())
	haskey(extra, "file") && push!(lines, "\tinclude($(repr(extra["file"])))")
	inputs = get(method, "inputs", Dict{String, Any}())
	for file in sort([splitext(file)[1] for file in readdir(joinpath(method["folder"], "targets")) if endswith(file, ".csv")])
		spec = get(targets, file, Dict{String, Any}())
		call = get(spec, "call", "")
		isempty(call) && error("targets/$file.csv has no call in method.toml ([targets.$file] call = \"...\")")
		named = get(spec, "run", "") == "named"
		named && push!(lines, "\tif $(repr(file)) in ARGS")
		push!(lines, "\t@testset $(repr(get(spec, "source", file))) begin")
		for (input, link) in sort(collect(inputs); by = first)
			occursin(Regex("\\b$input\\b"), call) || continue
			options = haskey(link, "delim") ? "; delim = $(repr(link["delim"]))" : ""
			haskey(link, "columns") && (options *= (isempty(options) ? "; " : ", ") * "columns = $(repr(string.(link["columns"])))")
			for key in ("header", "skipto", "limit")
				haskey(link, key) && (options *= (isempty(options) ? "; " : ", ") * "$key = $(link[key])")
			end
			push!(lines, "\t\t$input = input($(repr(haskey(link, "file") ? link["file"] : link["url"]))$options)")
		end
		push!(lines, "\t\tcheck($call, $(repr(file)), $(get(spec, "tolerance", 0)))", "\tend")
		named && push!(lines, "\telse", "\t\t@info \"Not tested: $(get(spec, "source", file)). To test it: Pkg.test(\\\"$name\\\"; test_args = [\\\"$file\\\"])\"", "\tend")
	end
	push!(lines, "end", "")
	return join(lines, "\n")
end

"The text of the MIT License, for the package's LICENSE."
mit_license(author) = """
MIT License

Copyright (c) $(year(today())) $author

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

vignette_title(method) = let title = get(method, "vignette_title", ""); isempty(title) ? get(method, "title", method["name"]) : title end

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
	usage = strip(get(method, "usage", ""))
	isempty(usage) || push!(lines, "## Usage", "", "```julia", usage, "```", "")
	pdf = joinpath(method["folder"], "vignette", "$name.pdf")
	isfile(pdf) && push!(lines, "## Vignette", "", "[$(vignette_title(method))](vignette/$name.pdf)", "")
	license = get(method, "license", "")
	isempty(license) || push!(lines, "## License", "", "$license (see [LICENSE](LICENSE)).", "")
	push!(lines, "## Tests", "", "The tests compute the published tables below from their data and check every printed value, rounded to the digits printed:", "")
	for (file, spec) in sort(collect(targets); by = first)
		named = get(spec, "run", "") == "named"
		push!(lines, "- $(get(spec, "source", file)) (`test/data/targets/$file.csv`)" * (named ? ", tested only when named: `Pkg.test(\"$name\"; test_args = [\"$file\"])`" : ""))
	end
	extra = get(method, "tests", Dict{String, Any}())
	haskey(extra, "file") && push!(lines, "", "They also run the tests of `test/$(extra["file"])`.")
	inputs = get(method, "inputs", Dict{String, Any}())
	if !isempty(inputs)
		push!(lines, "", "The data, downloaded from its links when the tests run or kept in `test/data/inputs`:", "")
		for (input, link) in sort(collect(inputs); by = first)
			source = get(link, "source", "")
			where = haskey(link, "file") ? "`test/data/$(link["file"])`" : "<$(link["url"])>"
			push!(lines, "- `$input`: $where" * (isempty(source) ? "" : ", $source"))
		end
	end
	push!(lines, "", "Run them with `using Pkg; Pkg.test(\"$name\")`.", "", "Made with [Pollis](https://pollis.org).", "")
	return join(lines, "\n")
end

"""
The entry of a package's vignette: in Vignettes.toml at the root of the registry, with links on GitHub, and in
the package's vignette/Vignette.toml, with the PDF's file name. Each value on one line: Pollis reads both with
its own TOML reader, which keeps escapes such as \\n.
"""
function vignette_entry(name, method, repository, pdf)
	return Dict(k => strip(replace(v, r"\s+" => " ")) for (k, v) in (
		"title" => vignette_title(method),
		"method" => get(method, "title", name),
		"package" => name,
		"version" => get(method, "version", "0.1.0"),
		"author" => get(method, "author", ""),
		"description" => get(method, "description", ""),
		"citation" => get(method, "citation", ""),
		"article" => let article = get(method, "article", ""), doi = get(method, "doi", ""); isempty(article) && !isempty(doi) ? "https://doi.org/$doi" : article end,
		"topic" => get(method, "topic", ""),
		"license" => get(method, "license", ""),
		"repository" => repository,
		"pdf" => pdf,
	))
end

"Makes or refreshes the package of a method in the packages folder; returns its folder."
function package(packages, folder, owner)
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
		TOML.print(io, Dict("name" => name, "uuid" => uuid, "version" => get(method, "version", "0.1.0"), "authors" => isempty(author) ? String[] : [author]); sorted = true)
	end
	for sub in ("src", "vignette", joinpath("test", "data"))
		rm(joinpath(root, sub); force = true, recursive = true)
	end
	cp(joinpath(folder, "src"), joinpath(root, "src"))
	mkpath(joinpath(root, "test", "data"))
	cp(joinpath(folder, "targets"), joinpath(root, "test", "data", "targets"))
	isdir(joinpath(folder, "inputs")) && cp(joinpath(folder, "inputs"), joinpath(root, "test", "data", "inputs"))
	extra = get(method, "tests", Dict{String, Any}())
	for path in unique([get(extra, "copy", String[]); haskey(extra, "file") ? [extra["file"]] : String[]])
		target = joinpath(root, "test", path)
		path == get(extra, "file", "") || first(splitpath(path)) in ("data", "runtests.jl") && error("method.toml: [tests] copy = \"$path\" would overwrite the generated tests")
		mkpath(dirname(target))
		cp(joinpath(folder, path), target; force = true)
	end
	# The vignette: its LaTeX sources and PDF, not LaTeX's working files
	if isfile(joinpath(folder, "vignette", "$name.pdf"))
		mkpath(joinpath(root, "vignette"))
		for file in readdir(joinpath(folder, "vignette"))
			splitext(file)[2] in (".tex", ".bib", ".pdf") && cp(joinpath(folder, "vignette", file), joinpath(root, "vignette", file))
		end
	end
	# The vignette's entry, for the list of installed vignettes
	if isfile(joinpath(root, "vignette", "$name.pdf"))
		open(joinpath(root, "vignette", "Vignette.toml"), "w") do io
			println(io, "# The vignette of $name.jl, written by Pollis (Compose > New Methods > Package and Publish) and shown in")
			println(io, "# Help > Documentation > Package Vignettes once the package is installed.\n")
			TOML.print(io, vignette_entry(name, method, owner === nothing ? "" : "https://github.com/$owner/$name.jl", "$name.pdf"); sorted = true)
		end
	end
	# The license, when method.toml names one: the MIT License, or another whose text is the method folder's LICENSE
	license = get(method, "license", "")
	if isempty(license)
		rm(joinpath(root, "LICENSE"); force = true)
		println("$name has no license, so nobody may reuse it: choose one (license in method.toml, e.g. MIT) to let others use, change and share it.")
	elseif license == "MIT"
		write(joinpath(root, "LICENSE"), mit_license(author))
	elseif isfile(joinpath(folder, "LICENSE"))
		cp(joinpath(folder, "LICENSE"), joinpath(root, "LICENSE"); force = true)
	else
		error("method.toml: license = \"$license\" needs its text in $(joinpath(folder, "LICENSE"))")
	end
	write(joinpath(root, "test", "runtests.jl"), runtests(name, method))
	write(joinpath(root, "README.md"), readme(name, method))
	write(joinpath(root, ".gitignore"), "Manifest.toml\n")

	Pkg.activate(root)
	dependencies = get(method, "packages", String[])
	isempty(dependencies) || Pkg.add(dependencies)
	Pkg.activate(joinpath(root, "test"))
	Pkg.add(unique(["Test", "CSV", "Downloads", "Tables", get(extra, "packages", String[])...]))
	Pkg.activate(root)
	return root, name, method
end

"The Pollis registry rules the package breaks; empty when it meets them all."
function registry_problems(root, name, method)
	problems = String[]
	length(name) >= MINIMUM_NAME || push!(problems, "the name $name is shorter than $MINIMUM_NAME characters")
	isempty(strip(get(method, "usage", ""))) && push!(problems, "no usage example (method.toml: usage = \"\"\"...\"\"\")")
	code = "using $name; print(join([string(s) for s in names($name) if s != nameof($name) && !Base.Docs.hasdoc($name, s)], ' '))"
	undocumented = split(read(`$(Base.julia_cmd()) --startup-file=no --project=$root -e $code`, String))
	isempty(undocumented) || push!(problems, "no docstring for " * join(undocumented, ", "))
	return problems
end

"Registers the active package in the registry at a URL, with LocalRegistry.jl."
function register(root, registry)
	Pkg.activate(; temp = true)
	Pkg.add("LocalRegistry")
	registrar = Base.require(Base.PkgId(UUID("89398ba2-070a-4b16-a995-9893c55d93cf"), "LocalRegistry"))
	Pkg.activate(root)
	Base.invokelatest(registrar.register, root; registry, push = true)
	println("Registered in $registry. To install: using Pkg; Pkg.Registry.add(url = \"$registry\"); Pkg.add(\"$(basename(root)[1:end - 3])\")")
end

"""
Adds or updates the package's entry in Vignettes.toml at the root of the registry at a URL, and pushes it:
the list of published vignettes that Help > Documentation > Package Vignettes shows.
"""
function list_vignette(registry, name, method, owner)
	mktempdir() do clone
		run(`git clone --quiet --depth 1 $registry $clone`)
		file = joinpath(clone, "Vignettes.toml")
		vignettes = isfile(file) ? TOML.parsefile(file) : Dict{String, Any}()
		repository = "https://github.com/$owner/$name.jl"
		vignettes[name] = vignette_entry(name, method, repository, "$repository/blob/main/vignette/$name.pdf")
		open(file, "w") do io
			println(io, "# The vignettes of the packages in this registry, one table per package, written by Pollis")
			println(io, "# (Compose > New Methods > Package and Publish) and shown in Help > Documentation > Package Vignettes.\n")
			TOML.print(io, vignettes; sorted = true)
		end
		cd(clone) do
			run(`git add Vignettes.toml`)
			success(`git diff --cached --quiet`) && return
			run(`git commit --quiet -m "Vignette of $name"`)
			run(`git push --quiet`)
		end
	end
	println("Listed the vignette of $name in $registry (Vignettes.toml).")
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
	packages, folders, owner, registry, skip = arguments(args)
	failed = String[]
	for folder in folders
		try
			root, name, method = package(packages, folder, owner)
			if skip
				println("\n$name: tests not run (--no-tests).")
			else
				Pkg.test()
				println("\n$name: all tests pass.")
			end
			problems = registry_problems(root, name, method)
			if isempty(problems)
				println("$name meets the Pollis registry rules.")
			else
				println("$name does not meet the Pollis registry rules yet:\n", join("  - " .* problems, "\n"))
				println("Prepare for Registration, on the method's page (Compose > New Methods > Browse Methods), asks your coding agent to fix them.")
			end
			owner === nothing || publish(root, name, owner)
			if registry !== nothing
				if isempty(problems)
					register(root, registry)
					isfile(joinpath(root, "vignette", "$name.pdf")) && list_vignette(registry, name, method, owner)
				else
					println("$name: not registered.")
				end
			end
		catch error
			showerror(stdout, error)
			println("\n\n$(basename(folder)): not published.")
			push!(failed, basename(folder))
		end
	end
	isempty(failed) || println("\nFailed: ", join(failed, ", "))
end

main(ARGS)
