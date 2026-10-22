# Pollis: the statistics of the alerts on statistical conditions (an unusual move, leaving a band, beyond a quantile,
# a new high or low), computed by OnlineStats.jl. Run by the Julia extension in a hidden process (pollisAlertStats.ts),
# in its own environment, ~/.pollis/alerts/julia/vX.Y, which it makes with OnlineStats and JSON3 the first time; the
# user's environments are never touched. It reads a request in JSON per line on stdin and writes the answer, with the
# request's id, as a line on stdout:
#   {"id", "op": "update", "key", "spec", "value", "history"?} -> {"id", "fires", "lower", "upper", "nobs"} or
#       {"id", "needsHistory": true} when there is no tracker for `key` yet and no history came with it
#   {"id", "op": "backtest", "spec", "values"} -> {"id", "lower": [...], "upper": [...], "fired": [...]}
#   {"id", "op": "forget", "key"} -> {"id"}
# `lower` and `upper` are the band, in the units of the value, that a value is checked against; null before there are
# enough observations. While it installs the packages it writes {"status": "installing"}, then {"status": "ready"}.
import Pkg

const ENVIRONMENT = joinpath(homedir(), ".pollis", "alerts", "julia", "v$(VERSION.major).$(VERSION.minor)")
Pkg.activate(ENVIRONMENT; io = devnull)
if Base.find_package("OnlineStats") === nothing || Base.find_package("JSON3") === nothing
    println("{\"status\":\"installing\"}")
    flush(stdout)
    Pkg.add(["OnlineStats", "JSON3"]; io = devnull)
end

using OnlineStats, JSON3

println("{\"status\":\"ready\"}")
flush(stdout)

"""
What an alert watches: `condition` is unusualMove, leavesBand, beyondQuantile or newExtreme; `transform` is how a move
is measured from two values, logReturn (quotes) or change (economic series); `k` the number of standard deviations;
`halfLife` the observations after which an observation weighs half; `p` the quantile; `window` the observations a
high or low is looked for in; `minObs` the observations before it may fire.
"""
struct Spec
    condition::String
    transform::String
    k::Float64
    halfLife::Float64
    p::Float64
    window::Int
    minObs::Int
end

Spec(json) = Spec(
    String(json.condition), String(get(json, :transform, "change")), Float64(get(json, :k, 3)),
    Float64(get(json, :halfLife, 60)), Float64(get(json, :p, 0.99)), Int(get(json, :window, 250)),
    Int(get(json, :minObs, 20)),
)

mutable struct Tracker
    spec::Spec
    stat::OnlineStat
    last::Union{Float64,Nothing}
    outside::Bool
end

# Equal weights until the observations are more than the weight's reciprocal, then exponential: ExponentialWeight alone
# starts the mean from 0.
function weight(spec::Spec)
    lambda = 1 - 2.0^(-1 / spec.halfLife)
    return n -> max(1 / n, lambda)
end

function Tracker(spec::Spec)
    stat = if spec.condition == "beyondQuantile"
        P2Quantile(spec.p)
    elseif spec.condition == "newExtreme"
        MovingWindow(spec.window, Float64)
    else
        Variance(weight = weight(spec))
    end
    return Tracker(spec, stat, nothing, false)
end

"""The move from `last` to `x`."""
move(spec::Spec, last, x) = spec.transform == "logReturn" ? log(x / last) : x - last

"""The value `last` would reach with the move `y`."""
level(spec::Spec, last, y) = spec.transform == "logReturn" ? last * exp(y) : last + y

"""The band, in the units of the value, that the next value is checked against; nothings until it may fire."""
function band(t::Tracker)
    spec = t.spec
    # A high or low is of the whole window.
    nobs(t.stat) < max(spec.minObs, 2, spec.condition == "newExtreme" ? spec.window : 0) && return (nothing, nothing)
    if spec.condition == "unusualMove"
        t.last === nothing && return (nothing, nothing)
        m, s = mean(t.stat), std(t.stat)
        return (level(spec, t.last, m - spec.k * s), level(spec, t.last, m + spec.k * s))
    elseif spec.condition == "leavesBand"
        m, s = mean(t.stat), std(t.stat)
        return (m - spec.k * s, m + spec.k * s)
    elseif spec.condition == "beyondQuantile"
        t.last === nothing && return (nothing, nothing)
        q = level(spec, t.last, value(t.stat))
        return spec.p < 0.5 ? (q, nothing) : (nothing, q)
    else
        window = value(t.stat)
        return (minimum(window), maximum(window))
    end
end

"""Checks `x` against the band, then takes it in; whether it fires."""
function observe!(t::Tracker, x::Float64)
    lower, upper = band(t)
    beyond = (lower !== nothing && x < lower) || (upper !== nothing && x > upper)
    fires = beyond
    if t.spec.condition == "leavesBand"
        # Fires on leaving the band, not again while it stays out.
        fires = beyond && !t.outside
        lower !== nothing && (t.outside = beyond)
    end
    if t.spec.condition in ("unusualMove", "beyondQuantile")
        t.last !== nothing && fit!(t.stat, move(t.spec, t.last, x))
    else
        fit!(t.stat, x)
    end
    t.last = x
    return (fires = fires, lower = lower, upper = upper)
end

const trackers = Dict{String,Tracker}()

function answer(request)
    op = String(request.op)
    if op == "update"
        key = String(request.key)
        spec = Spec(request.spec)
        tracker = get(trackers, key, nothing)
        if tracker === nothing || tracker.spec != spec
            history = get(request, :history, nothing)
            history === nothing && return Dict{Symbol,Any}(:needsHistory => true)
            tracker = trackers[key] = Tracker(spec)
            foreach(x -> observe!(tracker, Float64(x)), history)
        end
        result = observe!(tracker, Float64(request.value))
        return Dict{Symbol,Any}(:fires => result.fires, :lower => result.lower, :upper => result.upper, :nobs => nobs(tracker.stat))
    elseif op == "backtest"
        tracker = Tracker(Spec(request.spec))
        results = [observe!(tracker, Float64(x)) for x in request.values]
        return Dict{Symbol,Any}(
            :lower => [r.lower for r in results], :upper => [r.upper for r in results],
            :fired => [i - 1 for (i, r) in enumerate(results) if r.fires],
        )
    elseif op == "forget"
        delete!(trackers, String(request.key))
        return Dict{Symbol,Any}()
    end
    return Dict{Symbol,Any}(:error => "unknown op $op")
end

while !eof(stdin)
    line = readline(stdin)
    isempty(strip(line)) && continue
    id = nothing
    reply = try
        request = JSON3.read(line)
        id = get(request, :id, nothing)
        answer(request)
    catch err
        Dict{Symbol,Any}(:error => sprint(showerror, err))
    end
    reply[:id] = id
    println(JSON3.write(reply))
    flush(stdout)
end
