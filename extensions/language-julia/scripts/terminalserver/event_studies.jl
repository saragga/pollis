# Pollis: the results of the event studies, computed by PollisEventStudies.jl, for the Event Studies page. Run by the
# Julia extension in a hidden process (pollisHiddenJulia.ts), in its own environment, ~/.pollis/event-studies/julia/vX.Y,
# which it makes with PollisEventStudies, from the Pollis registry, and JSON3 the first time, and updates when the
# package is older than the page needs; the user's environments are never touched. It reads a request in JSON per line
# on stdin and writes the answer, with the request's id, as a line on stdout:
#   {"id", "op": "analyse", "folder"} -> {"id", "source": "filings", "periods": [...]} for a study of filings, each
#       period as `analyse` gives it, with its `outcomes`; or
#       {"id", "source": "fomc", "periods": [...]} for a study of FOMC releases, each period's moves, summary, paths and
#       curves; or {"id", "source": "panel", "tables": {...}} for a panel study, each table its estimators' results file
#       would hold, by the file's name, a column at a time. MixedModels.jl, for the stepped wedge, and WildBootTests.jl,
#       for the wild bootstrap, are added to the environment the first time a study asks for them
# Missing values, and values that are not finite, are null. While it installs the packages it writes
# {"status": "installing"}, then {"status": "ready"}. While it computes, it writes {"id", "progress", "done", "steps",
# "step"}, the fraction done and the step it starts (none after the last): each period of a study of filings or of FOMC
# releases, by its name, or, for a panel study, the loading of a package, by its name, and each estimator.
import Pkg

# The oldest PollisEventStudies with what the page shows: the CAAR's band, the curves from the next open and the
# panel studies' tables
const MINIMUM = v"0.5.1"
const REGISTRY_URL = "https://github.com/Trumpingtons/PollisRegistry"
const ENVIRONMENT = joinpath(homedir(), ".pollis", "event-studies", "julia", "v$(VERSION.major).$(VERSION.minor)")
Pkg.activate(ENVIRONMENT; io = devnull)
installed = Dict(info.name => info.version for info in values(Pkg.dependencies()) if info.is_direct_dep)
if !haskey(installed, "PollisEventStudies") || !haskey(installed, "JSON3") ||
        (installed["PollisEventStudies"] !== nothing && installed["PollisEventStudies"] < MINIMUM)
    println("{\"status\":\"installing\"}")
    flush(stdout)
    if !any(registry -> registry.name == "PollisRegistry", Pkg.Registry.reachable_registries())
        Pkg.Registry.add(url = REGISTRY_URL; io = devnull)
    end
    if haskey(installed, "PollisEventStudies")
        Pkg.Registry.update("PollisRegistry"; io = devnull)
        Pkg.update("PollisEventStudies"; io = devnull)
    end
    Pkg.add([name for name in ("PollisEventStudies", "JSON3") if !haskey(installed, name)]; io = devnull)
end

using PollisEventStudies, JSON3, Dates

println("{\"status\":\"ready\"}")
flush(stdout)

# What JSON3 writes: null for what is missing or not finite, times in ISO 8601 with a Z, six significant digits
plain(x) = x
plain(::Missing) = nothing
plain(x::AbstractFloat) = isfinite(x) ? round(Float64(x); sigdigits = 6) : nothing
plain(x::DateTime) = string(x, "Z")
plain(x::Symbol) = String(x)
plain(x::AbstractVector) = [plain(value) for value in x]
plain(x::NamedTuple) = Dict{Symbol, Any}(key => plain(value) for (key, value) in pairs(x))
plain(x::AbstractDict) = Dict{String, Any}(string(key) => plain(value) for (key, value) in x)
plain(x::PollisEventStudies.Period) = Dict{Symbol, Any}(:name => x.name, :before => x.before, :after => x.after, :next_open => x.next_open)

# Loads a package of the environment that PollisEventStudies.jl extends, adding it the first time
function load(name)
    any(info -> info.name == name && info.is_direct_dep, values(Pkg.dependencies())) || Pkg.add(name; io = devnull)
    Core.eval(Main, :(using $(Symbol(name))))
end

# Tells the page how far the request `id` has come, and the step it starts
function report(id, done, steps, step = nothing)
    println(JSON3.write(Dict(:id => id, :progress => done / steps, :done => done, :steps => steps, :step => step)))
    flush(stdout)
end

# The study with only `values` as its `field` (its periods, or its estimators), to compute it a step at a time
part(study, field, values) = typeof(study)((name == field ? values : getfield(study, name) for name in fieldnames(typeof(study)))...)

# The study's results a step at a time, reporting after each
function stepwise(f, id, study, field)
    values = getfield(study, field)
    results = Any[]
    for (k, value) in enumerate(values)
        report(id, k - 1, length(values), value isa PollisEventStudies.Period ? value.name : string(value))
        append!(results, f(part(study, field, [value])))
    end
    report(id, length(values), length(values))
    results
end

function answer(request, id)
    op = String(request.op)
    if op == "analyse"
        study = read_study(String(request.folder))
        if study isa PollisEventStudies.FomcStudy
            periods = [Dict{Symbol, Any}(:period => plain(result.period), :moves => plain(result.moves),
                :summary => plain(result.summary), :paths => plain(result.paths), :curves => plain(result.curves))
                for result in stepwise(analyse, id, study, :periods)]
            return Dict{Symbol, Any}(:source => "fomc", :periods => periods)
        elseif study isa PollisEventStudies.Study
            return Dict{Symbol, Any}(:source => "filings", :periods => plain(stepwise(analyse, id, study, :periods)))
        end
        needed = [name for (name, wanted) in (("MixedModels", "stepped_wedge" in study.estimators),
            ("WildBootTests", get(study.options, :wild, false) === true)) if wanted && !isdefined(Main, Symbol(name))]
        steps = length(needed) + length(study.estimators)
        for (k, name) in enumerate(needed)
            report(id, k - 1, steps, name)
            load(name)
        end
        # Each estimator's results through invokelatest, the packages just loaded being newer than this function
        results = Any[]
        for (k, estimator) in enumerate(study.estimators)
            report(id, length(needed) + k - 1, steps, estimator)
            append!(results, Base.invokelatest(analyse, part(study, :estimators, [estimator])))
        end
        report(id, steps, steps)
        tables = Dict{String, Any}(name => plain(PollisEventStudies.Tables.columntable(table))
            for result in results for (name, table) in Base.invokelatest(PollisEventStudies.result_tables, result))
        return Dict{Symbol, Any}(:source => "panel", :tables => tables)
    end
    return Dict{Symbol, Any}(:error => "unknown op $op")
end

while !eof(stdin)
    line = readline(stdin)
    isempty(strip(line)) && continue
    id = nothing
    reply = try
        request = JSON3.read(line)
        id = get(request, :id, nothing)
        answer(request, id)
    catch err
        Dict{Symbol, Any}(:error => sprint(showerror, err))
    end
    reply[:id] = id
    println(JSON3.write(reply))
    flush(stdout)
end
