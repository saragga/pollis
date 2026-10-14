# The artificial datasets of the cross-tests against Lai et al.'s code: comma-separated, no header, one column per
# series, as their `utils.py` reads them. Run once with `julia artificial.jl`; the files are kept in `artificial/`.

using Random, DelimitedFiles

"An AR(1) series of length `n` with coefficient `phi` and standard deviation `sigma` of the shocks."
function ar1(rng, n, phi, sigma)
	x = zeros(n)
	for t in 2:n
		x[t] = phi * x[t - 1] + sigma * randn(rng)
	end
	x
end

"""
Seasonal: 6 series with a period of 24 at different phases and amplitudes, plus AR(1) noise, all positive.
"""
function seasonal(rng, n)
	reduce(hcat, (10 .+ (2 + j) * sin.(2π * (1:n) / 24 .+ j) + ar1(rng, n, 0.7, 0.5) for j in 1:6))
end

"""
Trend and scales: 6 series with a period of 24 and a weekly period of 168, a linear trend, and scales from 1 to 1000,
which tests the division of each series by its largest absolute value.
"""
function trend(rng, n)
	t = 1:n
	reduce(hcat, (10.0^(j / 2) * (5 .+ t / n + sin.(2π * t / 24 .+ j) + 0.5sin.(2π * t / 168) + ar1(rng, n, 0.8, 0.3)) for j in 0:5))
end

"""
Constant: 5 series like the seasonal ones, one of which is constant over the last 30 per cent of the times, so that it
is constant in the test period and left out of the CORR.
"""
function constant(rng, n)
	x = seasonal(rng, n)[:, 1:5]
	x[floor(Int, 0.7n):end, 3] .= x[floor(Int, 0.7n), 3]
	x
end

rng = Xoshiro(2018)
for (name, make) in (("seasonal", seasonal), ("trend", trend), ("constant", constant))
	writedlm(joinpath(@__DIR__, "artificial", "$name.txt"), round.(make(rng, 1200); sigdigits = 8), ',')
end
