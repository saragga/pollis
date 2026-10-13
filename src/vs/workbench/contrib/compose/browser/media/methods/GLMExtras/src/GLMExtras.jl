module GLMExtras

using GLM, Distributions, Random, Statistics, Tables

export parametric, deltabeta, bootstrap_interval

"""
	parametric(m, f, data, response, n, B; rng=Random.default_rng())

`B` refits of the binomial GLM formula `f` to responses drawn from the fitted model `m`: each case's share `response` in `data` is redrawn
as Binomial(n, p̂)/n, with `n` the trials of each case (Efron 1979). Returns the refitted models; a sample whose fit fails is skipped.
"""
function parametric(m, f, data, response, n, B; rng=Random.default_rng())
	p = predict(m)
	fits = []
	for _ in 1:B
		y = rand.(rng, Binomial.(round.(Int, n), p)) ./ n
		try
			push!(fits, glm(f, merge(data, NamedTuple{(response,)}((y,))), Binomial(); weights=n))
		catch
		end
	end
	fits
end

"""
	deltabeta(f, data, n, j)

The change in coefficient `j` of the binomial GLM formula `f` when each case of `data`, with trials `n`, is dropped in turn, divided by the
standard deviation of the refitted coefficients (Dalal, Fowlkes and Hoadley 1989, p. 950). Returns the scaled changes and the refitted
coefficients.
"""
function deltabeta(f, data, n, j)
	all = coef(glm(f, data, Binomial(); weights=n))[j]
	N = length(n)
	loo = [coef(glm(f, map(column -> column[setdiff(1:N, i)], data), Binomial(); weights=n[setdiff(1:N, i)]))[j] for i in 1:N]
	(all .- loo) ./ std(loo), loo
end

"""
	bootstrap_interval(m, f, data, response, n, new; B=1000, level=0.9, scale=1, rng=Random.default_rng())

The parametric bootstrap interval, at the given `level`, of the prediction of the binomial GLM `m` (formula `f`, fitted to `data` with
trials `n`) at the cases of the table `new`, times `scale`: a matrix with a row for each case of `new`, its lower and upper limits in the
columns.
"""
function bootstrap_interval(m, f, data, response, n, new; B=1000, level=0.9, scale=1, rng=Random.default_rng())
	curves = reduce(hcat, [scale .* predict(b, new) for b in parametric(m, f, data, response, n, B; rng)])
	tail = (1 - level) / 2
	[quantile.(eachrow(curves), tail) quantile.(eachrow(curves), 1 - tail)]
end

# The tests: Dalal, Fowlkes and Hoadley's (1989) Model (3.2) of the Challenger O-ring damage, from the challenger table of
# PollisDatasets (Table 1 of the paper), and what the paper computes from it

const MODEL = @formula(distressed ~ temperature)

"The share of the six field-joint O-rings of each flight that were damaged, with its temperature, and the binomial n of each flight."
flights(challenger) = (temperature = Float64.(challenger.temperature), distressed = challenger.n_failures ./ 6), fill(6.0, length(challenger.temperature))

"Model (3.2): the coefficients, their standard errors and G2 (p. 948), a column."
function model32(challenger)
	data, six = flights(challenger)
	m = glm(MODEL, data, Binomial(); weights=six)
	[coef(m); stderror(m); deviance(m)]
end

"The 90% bootstrap interval of the expected number of damaged O-rings at 30 degrees F (p. 950), 1,000 samples: a column, 5% then 95%."
function interval30(challenger)
	data, six = flights(challenger)
	m = glm(MODEL, data, Binomial(); weights=six)
	vec(bootstrap_interval(m, MODEL, data, :distressed, six, (temperature = [30.0],); scale=6, rng=Xoshiro(1989)))
end

"The delta beta of the temperature coefficient (p. 950): flight 21's, then the flights of the next three largest, in launch order."
function influence(challenger)
	data, six = flights(challenger)
	delta, _ = deltabeta(MODEL, data, six, 2)
	[delta[21]; sort(sortperm(abs.(delta), rev=true)[2:4])]
end

end
