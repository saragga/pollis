# Pollis: functions every Pollis Julia session has, the REPL (terminalserver.jl) and the notebook
# kernel (notebook.jl) alike. Loads no packages until one of them is called.
module Pollis

const PKG = Base.PkgId(Base.UUID("44cfe95a-1eb2-52ea-b672-e2afdf69b78f"), "Pkg")

"""The Julia environment of the packages built into Pollis (PollisDatasets, DuckDB), one per Julia minor version: PollisDB installs into it."""
const ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

# After the user's environments, so that their own versions of these packages come first.
ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, ENVIRONMENT)

"""Pollis's own packages that are not in the General registry, so a bare name is enough."""
const LINKS = Dict(
	"PollisDatasets" => "https://github.com/Trumpingtons/PollisDatasets.jl",
	"PollisTeX" => "https://github.com/Trumpingtons/PollisTeX.jl",
)

"""
    Pollis.packages(names...; forks = ())

Step 0 of every workflow, notebook and Code Example: install whichever of the named packages the
active environment cannot load, and do nothing when all are there.

A name is a string, `"Plots"`. A package that may not be in the registries is given with its link,
`"EDGAR" => "https://github.com/Trumpingtons/EDGAR.jl"`: added by name if a reachable registry has it,
from the link otherwise. A name in `forks` is always added from its link, since the registered
version may be the one present; it is re-added whenever anything is missing.

```julia
Pollis.packages("ARCHModels", "Plots", "PollisDatasets")
```
"""
function packages(names::Union{AbstractString, Pair{<:AbstractString, <:AbstractString}}...; forks = ())
	wanted = [name isa Pair ? (String(first(name)), String(last(name))) : (String(name), get(LINKS, name, "")) for name in names]
	missing_packages = filter(((name, _),) -> Base.identify_package(name) === nothing, wanted)
	isempty(missing_packages) && return nothing
	to_add = unique([missing_packages; filter(((name, _),) -> name in forks, wanted)])
	# Pkg is loaded only now, so the adding runs in the newest world, where Pkg's methods exist.
	Base.invokelatest(add, Base.require(PKG), to_add, forks)
	return nothing
end

"""Adds each `(name, link)`: by name if a reachable registry has it and it is not a fork, from its link otherwise."""
function add(Pkg::Module, to_add, forks)
	registries = Pkg.Registry.reachable_registries()
	registered(name) = any(registry -> !isempty(Pkg.Registry.uuids_from_name(registry, name)), registries)
	Pkg.add([!(name in forks) && (isempty(link) || registered(name)) ? Pkg.PackageSpec(name = name) : Pkg.PackageSpec(url = link) for (name, link) in to_add])
end

"""
    Pollis.llama_server(model; embeddings = false, thinking = false)

The address of the OpenAI-compatible API (`http://127.0.0.1:<port>/v1`) of the llama-server of
llama.cpp, which Pollis ships, running `model` on this computer: started for it if needed, and
answered once the model is loaded. `model` is the path of a GGUF file or `hf:owner/repo/file.gguf`,
a file on Hugging Face, downloaded into `~/.pollis/models` the first time. `embeddings = true` runs
an embedding model; thinking is off unless `thinking = true`, whatever the model.

```julia
url = Pollis.llama_server("hf:unsloth/Qwen3.5-0.8B-GGUF/Qwen3.5-0.8B-Q4_K_M.gguf")
```
"""
function llama_server(model::AbstractString; embeddings::Bool = false, thinking::Bool = false)
	# The connection to Pollis of this REPL or notebook, through which Pollis starts the server.
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	(server === nothing || server.conn_endpoint[] === nothing) && error("Pollis.llama_server runs only in the Julia REPL or a notebook of Pollis.")
	answer = server.JSONRPC.send_request(server.conn_endpoint[], "pollis/llamaServer", Dict("model" => model, "embeddings" => embeddings, "thinking" => thinking))
	haskey(answer, "error") && error(answer["error"])
	return answer["url"]::String
end

"""
    Pollis.stop_llama_server(model; embeddings = false, thinking = false)

Stops the llama-server that `Pollis.llama_server` started for `model` with the same settings, and returns once it
has ended and its memory is free, so that the next model runs alone in memory.
"""
function stop_llama_server(model::AbstractString; embeddings::Bool = false, thinking::Bool = false)
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	(server === nothing || server.conn_endpoint[] === nothing) && error("Pollis.stop_llama_server runs only in the Julia REPL or a notebook of Pollis.")
	server.JSONRPC.send_request(server.conn_endpoint[], "pollis/stopLlamaServer", Dict("model" => model, "embeddings" => embeddings, "thinking" => thinking))
	return nothing
end

"""
    Pollis.browse(page)

Opens `page` in Pollis' browser: an HTML file, such as the report of a profiler, or a link starting
with `http://` or `https://`. Opened again, the page reloads in the same tab. Outside Pollis, prints
where the page is.

```julia
Pollis.browse(ProfileCanvas.html_file(joinpath(mktempdir(), "flamegraph.html")))
```
"""
function browse(page::AbstractString)
	link = occursin(r"^https?://"i, page)
	!link && !isfile(page) && error("Pollis.browse: there is no file $page.")
	target = link ? String(page) : abspath(page)
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	if server === nothing || server.conn_endpoint[] === nothing
		println("Open ", target)
	else
		server.JSONRPC.send_notification(server.conn_endpoint[], "pollis/browse", Dict("page" => target))
	end
	return nothing
end

"""
    Pollis.replicate(title, rows; results = "results.csv")

Compares results with published values that are exact to the digits printed: estimates, test
statistics, a model solved. Prints each value in full, rounded to the published precision and beside
the published value, with the number of decimals they share ("same to 2 decimals"), "one in the last
digit" when not even the units agree but the last printed digit is one off (14016 against 14017), or
"DIFFERENT".

Each row is `(label, value, published)`, `published` written as in the source, `"1,794.3"`, `"-.002"`
or `"2.5e-4"`: its decimals give the published precision. The rows also go to `results`, a CSV file
beside the notebook, replacing those of an earlier run of the same `title`; `results = nothing` writes
none.

```julia
Pollis.replicate("Table 1, column 2", [("intercept", coef(model)[1], "5.085"), ("temperature", coef(model)[2], "-.1156")])
```
"""
function replicate(title::AbstractString, rows; results::Union{AbstractString, Nothing} = "results.csv")
	width = max(26, maximum((length(first(row)) for row in rows); init = 0) + 2)
	println("\n", title, "\n", rpad("", width), lpad("Julia", 16), lpad("rounded", 14), lpad("published", 14))
	records = Vector{Vector{String}}()
	for (label, value, published) in rows
		p, d = printed(published)
		k = findlast(j -> round(value; digits = j) == round(p; digits = j), 0:max(d, 0))  # position in 0:d
		# Not even the units agree: one in the last printed digit (14016 against 14017), or different
		last = abs(round(value; digits = d) - p) <= 1.5 * 10.0^-d
		verdict = k !== nothing ? "same to $(k - 1) decimals" : last ? "one in the last digit" : "DIFFERENT"
		rounded = d < 0 ? string(round(Int, round(value; digits = d))) : fixed(value, d)
		println(rpad(label, width), lpad(fixed(value, max(8, d + 2)), 16), lpad(rounded, 14), lpad(published, 14), "  ", verdict)
		push!(records, [title, string(label), "exact", published, repr(Float64(value)), "", string(d), k === nothing ? "" : string(k - 1), "", verdict])
	end
	record(results, title, records)
	return nothing
end

"""
    Pollis.compare(title, rows; noisy = true, results = "results.csv")

Compares results with published values that are themselves estimates of a random quantity:
simulations, bootstrap or random forests, rerun with other random numbers. Prints each value with its
standard error, rounded to the published precision and beside the published value, with "within
noise" when the two are less than two standard errors apart, or "DIFFERENT" and how many.

Each row is `(label, value, se, published)`, `se` the Monte Carlo standard error of `value`. With
`noisy = true` the published value is taken to carry the same noise, so the difference is measured
against `sqrt(2) * se`; with `noisy = false` the published value is exact and against `se`. The rows
go to `results` as for `Pollis.replicate`.

```julia
Pollis.compare("Table 2, test set error (%)", [("waveform", mean(errors), std(errors) / sqrt(runs), "17.2")])
```
"""
function compare(title::AbstractString, rows; noisy::Bool = true, results::Union{AbstractString, Nothing} = "results.csv")
	width = max(16, maximum((length(first(row)) for row in rows); init = 0) + 2)
	println("\n", title, "\n", rpad("", width), lpad("Julia", 10), lpad("se", 8), lpad("rounded", 10), lpad("published", 11))
	records = Vector{Vector{String}}()
	for (label, value, se, published) in rows
		p, d = printed(published)
		z = (value - p) / ((noisy ? sqrt(2) : 1) * se)
		verdict = abs(z) < 2 ? "within noise" : "DIFFERENT ($(fixed(z, 1)) se)"
		rounded = d < 0 ? string(round(Int, round(value; digits = d))) : fixed(value, d)
		println(rpad(label, width), lpad(fixed(value, 3), 10), lpad(fixed(se, 3), 8), lpad(rounded, 10), lpad(published, 11), "  ", verdict)
		push!(records, [title, string(label), "noise", published, repr(Float64(value)), repr(Float64(se)), string(d), "", repr(z), verdict])
	end
	record(results, title, records)
	return nothing
end

"""A published value as printed, `"1,794.3"` or `"2.5e-4"`: its value, and its decimals (negative for `"2.5e4"`)."""
function printed(published::AbstractString)
	text = replace(strip(published), "," => "")
	mantissa, exponent = occursin(r"[eE]", text) ? split(text, r"[eE]") : (text, "0")
	decimals = (occursin('.', mantissa) ? length(split(mantissa, '.')[2]) : 0) - parse(Int, exponent)
	return parse(Float64, text), decimals
end

const PRINTF = Base.PkgId(Base.UUID("de0858da-6303-5e67-8744-51eddeeeb8d7"), "Printf")

"""`value` with `digits` decimals, as `@printf("%.2f")` writes it; Printf is loaded the first time."""
function fixed(value::Real, digits::Integer)
	Printf = Base.require(PRINTF)
	return Base.invokelatest(Printf.format, Base.invokelatest(Printf.Format, "%.$(digits)f"), Float64(value))
end

"""The columns of results.csv, one row for each value compared."""
const RESULT_COLUMNS = ["table", "row", "kind", "published", "julia", "se", "printed_decimals", "same_decimals", "z", "verdict"]

"""Writes `records` to the CSV file `path` in place of the rows of an earlier run of `title`; warns and goes on when it cannot."""
function record(path::Union{AbstractString, Nothing}, title::AbstractString, records)
	path === nothing && return nothing
	quoted(field) = occursin(r"[\",\n]", field) ? "\"" * replace(field, "\"" => "\"\"") * "\"" : field
	try
		kept = isfile(path) ? filter(line -> !startswith(line, quoted(title) * ","), readlines(path)[2:end]) : String[]
		lines = [join(RESULT_COLUMNS, ","); kept; [join(quoted.(fields), ",") for fields in records]]
		write(path, join(lines, "\n") * "\n")
	catch error
		@warn "The results were not written to $(abspath(path))" exception = error
	end
	return nothing
end

const REPL_ID = Base.PkgId(Base.UUID("3fa0cd96-eef1-5676-8a61-b3b8758bbffb"), "REPL")

"""
    Pollis.run_first(example, step)

What a Next Step sends to the Julia REPL when the Code Example of its tab has not run there yet, or
has changed since: run the Code Example, then the Next Step, which uses its results. Each statement
runs in `Main` as if typed at the REPL, its value shown unless it ends with `;`. When the Code Example
stops with an error, the error is shown and the Next Step does not run.
"""
function run_first(example::AbstractString, step::AbstractString)
	printstyled("Running the Code Example first, so that this Next Step can use its results…\n"; color = :cyan)
	if !run_statements(example, "Code Example")
		printstyled("The Next Step did not run, since the Code Example stopped with an error.\n"; color = :red)
		return nothing
	end
	printstyled("Running the Next Step…\n"; color = :cyan)
	run_statements(step, "Next Step")
	return nothing
end

"""Runs each statement of `code` in `Main` as the REPL would; shows the first error and returns false at it."""
function run_statements(code::AbstractString, name::AbstractString)
	REPL = get(Base.loaded_modules, REPL_ID, nothing)
	position = 1
	while position <= ncodeunits(code)
		statement, next = Meta.parse(code, position; filename = name)
		text = code[position:prevind(code, next)]
		# The line the statement starts on, for the errors: after the line breaks before it.
		line = count('\n', SubString(code, 1, prevind(code, position))) + count('\n', text[1:length(text) - length(lstrip(text))]) + 1
		position = next
		statement === nothing && continue
		try
			# The REPL's soft scope, so that a loop at top level assigns the globals it names.
			REPL === nothing || (statement = Base.invokelatest(REPL.softscope, statement))
			value = Base.invokelatest(Core.eval, Main, Expr(:toplevel, LineNumberNode(line, Symbol(name)), statement))
			value === nothing || (REPL !== nothing && Base.invokelatest(REPL.ends_with_semicolon, text)) || Base.invokelatest(display, value)
		catch error
			# The backtrace up to the statement, without the frames of Pollis that ran it.
			trace = stacktrace(catch_backtrace())
			cut = something(findfirst(frame -> frame.func === :run_statements, trace), length(trace) + 1)
			printstyled(stderr, "ERROR: "; color = :red, bold = true)
			Base.invokelatest(showerror, stderr, error, trace[1:max(cut - 2, 0)])
			println(stderr)
			return false
		end
	end
	return true
end

end
