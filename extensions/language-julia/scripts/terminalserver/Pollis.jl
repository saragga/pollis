# Pollis: functions every Pollis Julia session has, the REPL (terminalserver.jl) and the notebook
# kernel (notebook.jl) alike. Loads no packages until one of them is called.
module Pollis

const PKG = Base.PkgId(Base.UUID("44cfe95a-1eb2-52ea-b672-e2afdf69b78f"), "Pkg")

"""Pollis's own packages that are not in the General registry, so a bare name is enough."""
const LINKS = Dict("PollisDatasets" => "https://github.com/Trumpingtons/PollisDatasets.jl")

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

end
