/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The alert.ipynb of an alert on a statistical condition: Julia that computes with OnlineStats.jl, over the values in
// its folder (alert.toml and values.csv), what the alert would have done, as alert_stats.jl in Pollis' Julia extension
// does, so the condition can be checked and its settings tuned before the alert is added.

import { code, markdown } from './eventStudyNotebook.js';

/** The notebook of the alert whose settings and values are in `folder` (its path on disk), as the JSON of a Jupyter notebook in Julia. */
export function alertNotebook(folder: string): string {
	const cells = [
		markdown(String.raw`
# Alert on a Statistical Condition

What the alert would have done over the values it would look at, computed with [OnlineStats.jl](https://github.com/joshday/OnlineStats.jl) as Pollis computes it while the alert is on. Pollis writes them to this folder each time **Open Notebook** is chosen on the Add Alert page:

- **alert.toml**: the symbol or series, the condition and its settings;
- **values.csv**: for a quote, the close of each minute of the regular sessions of the last five days, with its time (UTC); for an economic series, its latest values, with their periods.

Each value is checked against the band computed from the values before it, then taken in:

- **unusualMove**: a move (a quote's log return, a series' change) beyond the mean of the moves before it, plus or minus k standard deviations;
- **leavesBand**: a value outside the mean of the values before it, plus or minus k standard deviations; it fires on leaving, not again while it stays out;
- **beyondQuantile**: a move beyond the p quantile of the moves before it, above 0.5 a rise, below 0.5 a fall (the P-square algorithm of Jain and Chlamtac, 1985);
- **newExtreme**: a value above the highest or below the lowest of the window of values before it.

The mean and the variance weigh the values equally until there are 1/lambda of them, then exponentially, with lambda = 1 - 2^(-1/halfLife): a value weighs half as much after halfLife values.
`),
		code(String.raw`
import Pkg
# OnlineStats and Plots, added to the active environment when it does not have them
for name in ("OnlineStats", "Plots")
	Base.find_package(name) === nothing && Pkg.add(name)
end
using OnlineStats, Plots, TOML

const FOLDER = isfile(joinpath(pwd(), "alert.toml")) ? pwd() : raw"${folder}"
alert = TOML.parsefile(joinpath(FOLDER, "alert.toml"))
rows = split.(readlines(joinpath(FOLDER, "values.csv"))[2:end], ',')
labels = String.(first.(rows))
values = parse.(Float64, last.(rows))
println(alert["name"], ": ", length(values), " values, from ", first(labels), " to ", last(labels))
`),
		markdown(String.raw`
## Settings

The alert's settings, as on the Add Alert page. Change them and run the cells below again; the alert is not changed.
`),
		code(String.raw`
condition = alert["condition"]                   # "unusualMove", "leavesBand", "beyondQuantile" or "newExtreme"
k = alert["k"]                                   # standard deviations, for unusualMove and leavesBand
half_life = alert["halfLife"]                    # values after which a value weighs half, for unusualMove and leavesBand
p = alert["p"]                                   # the quantile, for beyondQuantile
window = alert["window"]                         # values a high or low is looked for in, for newExtreme
min_obs = alert["minObs"]                        # values taken in before it may fire
log_returns = alert["transform"] == "logReturn"  # a quote's moves are log returns, a series' are changes
`),
		code(String.raw`
"""The statistic a condition keeps: an exponentially weighted variance, a quantile, or a moving window."""
function statistic(condition, half_life, p, window)
	if condition == "beyondQuantile"
		return P2Quantile(p)
	elseif condition == "newExtreme"
		return MovingWindow(window, Float64)
	end
	# Equal weights until there are more values than 1/lambda, then exponential
	lambda = 1 - 2.0^(-1 / half_life)
	return Variance(weight = n -> max(1 / n, lambda))
end

"""
The band each value is checked against, from the values before it (NaN before there are enough), and the
positions of those it would fire on.
"""
function run_alert(values; condition, k, half_life, p, window, min_obs, log_returns)
	move(last, x) = log_returns ? log(x / last) : x - last
	level(last, y) = log_returns ? last * exp(y) : last + y
	stat = statistic(condition, half_life, p, window)
	lower = fill(NaN, length(values))
	upper = fill(NaN, length(values))
	fired = Int[]
	outside = false
	for (i, x) in enumerate(values)
		previous = i > 1 ? values[i - 1] : nothing
		if nobs(stat) >= max(min_obs, 2, condition == "newExtreme" ? window : 0)
			if condition == "unusualMove" && previous !== nothing
				m, s = mean(stat), std(stat)
				lower[i], upper[i] = level(previous, m - k * s), level(previous, m + k * s)
			elseif condition == "leavesBand"
				m, s = mean(stat), std(stat)
				lower[i], upper[i] = m - k * s, m + k * s
			elseif condition == "beyondQuantile" && previous !== nothing
				q = level(previous, value(stat))
				p < 0.5 ? (lower[i] = q) : (upper[i] = q)
			elseif condition == "newExtreme"
				lower[i], upper[i] = extrema(value(stat))
			end
		end
		# Comparisons with NaN are false: no band, no firing
		beyond = x < lower[i] || x > upper[i]
		if condition == "leavesBand"
			# Fires on leaving the band, not again while it stays out
			beyond && !outside && push!(fired, i)
			isnan(lower[i]) && isnan(upper[i]) || (outside = beyond)
		elseif beyond
			push!(fired, i)
		end
		# A move needs the value before; a level is taken in as it is
		if condition in ("unusualMove", "beyondQuantile")
			previous === nothing || fit!(stat, move(previous, x))
		else
			fit!(stat, x)
		end
	end
	return (; lower, upper, fired)
end

result = run_alert(values; condition, k, half_life, p, window, min_obs, log_returns)
println("It would have fired ", length(result.fired), " times over these values.")
`),
		markdown(String.raw`
## The band and where it would have fired
`),
		code(String.raw`
plot(values; label = alert["name"], color = :black, linewidth = 1, legend = :topleft, xlabel = "observation")
plot!(result.lower; label = "band", color = :steelblue, linestyle = :dash)
plot!(result.upper; label = "", color = :steelblue, linestyle = :dash)
scatter!(result.fired, values[result.fired]; label = "would fire", color = :red, markersize = 4)
`),
		code(String.raw`
for i in result.fired
	println(labels[i], ": ", values[i], ", band ", round(result.lower[i]; sigdigits = 6), " to ", round(result.upper[i]; sigdigits = 6))
end
`),
	];
	return JSON.stringify({
		cells,
		metadata: { kernelspec: { display_name: 'Julia', language: 'julia', name: 'julia' }, language_info: { name: 'julia' } },
		nbformat: 4,
		nbformat_minor: 4,
	}, undefined, 1);
}
