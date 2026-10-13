# Compose > New Methods > Package and Publish: turns each method folder into a Julia package whose
# tests are the method's target tables, computed from its input tables, and runs them. With --push
# OWNER, a package whose tests all pass is pushed to github.com/OWNER/NAME.jl (GitHub CLI, gh). With
# --register URL as well, a pushed package that also meets the Pollis registry rules (a name of at least
# 5 characters, a usage example, a docstring for every exported name) is registered in the registry at URL
# (LocalRegistry.jl). The rules are checked, and reported, every time. A registered package with a vignette
# (vignette/NAME.pdf) also gets an entry in Vignettes.toml at the registry's root, the list that
# Help > Documentation > Vignettes shows.
#
#   julia package.jl PACKAGES_FOLDER METHOD_FOLDER... [--push OWNER [--register REGISTRY_URL]]
#
# A method folder holds method.toml (name, title, author, description, citation, version, usage (Julia code
# that shows how to call the method, for the README), packages, and a
# [targets.NAME] table for each target: source, call, tolerance, and an [inputs.NAME] table for each input:
# url or file, source, delim, columns, skipto, limit), src/NAME.jl (module NAME), targets/*.csv and inputs/*.csv. An input is
# a link, which the tests download into memory, writing nothing to disk, or a file of the method
# (file = "inputs/NAME.csv", typed in from the article), copied into the package's tests. A target table's first column holds the row
# labels and its other cells the published values as printed; the call is the Julia expression that
# computes them from the inputs, each input a variable named after its table and holding a Tables.jl
# column table. A value passes when the
# result, rounded to the digits printed, equals it, within `tolerance` units of the last printed digit
# (in scientific notation, as 1.64e-09, the last digit of the mantissa).

using Pkg, TOML, UUIDs

"The value of an option and the arguments without it."
function option(args, flag)
	at = findfirst(==(flag), args)
	at === nothing && return nothing, args
	return args[at + 1], [args[1:at - 1]; args[at + 2:end]]
end

function arguments(args)
	owner, args = option(args, "--push")
	registry, args = option(args, "--register")
	return args[1], args[2:end], owner, registry
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
		"function input(source; delim = ',', columns = nothing, skipto = nothing, limit = nothing)",
		"\tbytes = startswith(source, r\"https?://\") ? take!(Downloads.download(source, IOBuffer())) : read(joinpath(DATA, source))",
		"\theader = columns === nothing ? 1 : Symbol.(columns)",
		"\trows = (; skipto = something(skipto, columns === nothing ? 2 : 1), limit)",
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
			for key in ("skipto", "limit")
				haskey(link, key) && (options *= (isempty(options) ? "; " : ", ") * "$key = $(link[key])")
			end
			push!(lines, "\t\t$input = input($(repr(haskey(link, "file") ? link["file"] : link["url"]))$options)")
		end
		push!(lines, "\t\tcheck($call, $(repr(file)), $(get(spec, "tolerance", 0)))", "\tend")
	end
	push!(lines, "end", "")
	return join(lines, "\n")
end

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
	push!(lines, "## Tests", "", "The tests compute the published tables below from their data and check every printed value, rounded to the digits printed:", "")
	for (file, spec) in sort(collect(targets); by = first)
		push!(lines, "- $(get(spec, "source", file)) (`test/data/targets/$file.csv`)")
	end
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
		TOML.print(io, Dict("name" => name, "uuid" => uuid, "version" => get(method, "version", "0.1.0"), "authors" => isempty(author) ? String[] : [author]); sorted = true)
	end
	for sub in ("src", "vignette", joinpath("test", "data"))
		rm(joinpath(root, sub); force = true, recursive = true)
	end
	cp(joinpath(folder, "src"), joinpath(root, "src"))
	mkpath(joinpath(root, "test", "data"))
	cp(joinpath(folder, "targets"), joinpath(root, "test", "data", "targets"))
	isdir(joinpath(folder, "inputs")) && cp(joinpath(folder, "inputs"), joinpath(root, "test", "data", "inputs"))
	# The vignette: its LaTeX sources and PDF, not LaTeX's working files
	if isfile(joinpath(folder, "vignette", "$name.pdf"))
		mkpath(joinpath(root, "vignette"))
		for file in readdir(joinpath(folder, "vignette"))
			splitext(file)[2] in (".tex", ".bib", ".pdf") && cp(joinpath(folder, "vignette", file), joinpath(root, "vignette", file))
		end
	end
	write(joinpath(root, "test", "runtests.jl"), runtests(name, method))
	write(joinpath(root, "README.md"), readme(name, method))
	write(joinpath(root, ".gitignore"), "Manifest.toml\n")

	Pkg.activate(root)
	dependencies = get(method, "packages", String[])
	isempty(dependencies) || Pkg.add(dependencies)
	Pkg.activate(joinpath(root, "test"))
	Pkg.add(["Test", "CSV", "Downloads", "Tables"])
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
the list of published vignettes that Help > Documentation > Vignettes shows.
"""
function list_vignette(registry, name, method, owner)
	mktempdir() do clone
		run(`git clone --quiet --depth 1 $registry $clone`)
		file = joinpath(clone, "Vignettes.toml")
		vignettes = isfile(file) ? TOML.parsefile(file) : Dict{String, Any}()
		repository = "https://github.com/$owner/$name.jl"
		# Each value on one line: Pollis reads the file with its own TOML reader, which keeps escapes such as \n
		vignettes[name] = Dict(k => strip(replace(v, r"\s+" => " ")) for (k, v) in (
			"title" => vignette_title(method),
			"method" => get(method, "title", name),
			"package" => name,
			"version" => get(method, "version", "0.1.0"),
			"author" => get(method, "author", ""),
			"description" => get(method, "description", ""),
			"citation" => get(method, "citation", ""),
			"repository" => repository,
			"pdf" => "$repository/blob/main/vignette/$name.pdf",
		))
		open(file, "w") do io
			println(io, "# The vignettes of the packages in this registry, one table per package, written by Pollis")
			println(io, "# (Compose > New Methods > Package and Publish) and shown in Help > Documentation > Vignettes.\n")
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
	packages, folders, owner, registry = arguments(args)
	failed = String[]
	for folder in folders
		try
			root, name, method = package(packages, folder)
			Pkg.test()
			println("\n$name: all tests pass.")
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
