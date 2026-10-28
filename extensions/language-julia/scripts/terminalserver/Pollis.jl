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
