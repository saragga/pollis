# Pollis: compiles, at the start of a session, the packages that Julia would otherwise compile the first time they
# are loaded: after an update of Julia, or of packages outside Pollis. Run by the Julia extension in a hidden process
# of low priority (pollisPrecompile.ts), with the project and the flags of the REPL, which share its caches. It
# prints "precompiling" when there is something to compile, so that the Welcome page can say so, and nothing
# otherwise. A package the REPL loads meanwhile waits for this process to finish it, rather than compiling it twice.
using TOML

const LOAD_PATH_OF_REPL = copy(LOAD_PATH)

# The environments of the REPL: its project, the default environment, and the one of Pollis (PollisDB.ENVIRONMENT).
projects = unique(filter(p -> p !== nothing && isfile(p), [
    Base.active_project(),
    Base.load_path_expand("@v#.#"),
    joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)", "Project.toml"),
]))

"""Whether a package of `project` is installed but not compiled for this Julia and these flags."""
function stale(project::AbstractString)
    deps = get(TOML.parsefile(project), "deps", Dict{String,Any}())
    empty!(LOAD_PATH)
    push!(LOAD_PATH, project, "@stdlib")
    return any(deps) do (name, uuid)
        id = Base.PkgId(Base.UUID(uuid), name)
        # A package not installed is left alone: installing is for Pkg, when the user asks.
        Base.locate_package(id) !== nothing && !Base.isprecompiled(id)
    end
end

todo = filter(stale, projects)
append!(empty!(LOAD_PATH), LOAD_PATH_OF_REPL)
isempty(todo) && exit()
println("precompiling")
flush(stdout)

using Pkg
for project in todo
    try
        Pkg.activate(project; io = devnull)
        Pkg.precompile()
    catch err
        @debug "Pollis: could not precompile $project" exception = err
    end
end
