module BreslowCox

using ForwardDiff, Distributions, LinearAlgebra, Statistics, Tables

export partial, cox, survival

"""
	partial(β, X, t, e)

Breslow's (1974) partial log likelihood of the Cox model with covariates `X`, times `t` and events `e`: the patients who die on the same day
share one risk set.
"""
function partial(β, X, t, e)
	η = X * β
	sum(η[i] - log(sum(exp.(η[t .>= t[i]]))) for i in findall(e))
end

"""
	cox(X, t, e)

Fit the Cox model by Newton's method on Breslow's partial likelihood: coefficients, standard errors, Wald chi-squares and their p values,
and the likelihood ratio chi-square of the whole model.
"""
function cox(X, t, e)
	f(β) = partial(β, X, t, e)
	β = zeros(size(X, 2))
	for _ in 1:25
		β -= ForwardDiff.hessian(f, β) \ ForwardDiff.gradient(f, β)
	end
	se = sqrt.(diag(inv(-ForwardDiff.hessian(f, β))))
	chi2 = (β ./ se) .^ 2
	(β = β, se = se, chi2 = chi2, p = ccdf.(Chisq(1), chi2), LR = 2 * (f(β) - f(zero(β))), X = X, t = t, e = e)
end

"""
	survival(m)

The predicted survival S(t, R) = S0(t)^exp(R - c) of a model fitted by `cox`, at t days for a patient with risk score R, where c is the
mean risk score and S0 is Kalbfleisch and Prentice's (1980) estimate.
"""
function survival(m)
	R = m.X * m.β
	c = mean(R)
	w = exp.(R .- c)
	times = sort(unique(m.t[m.e]))
	α = map(times) do s
		deaths = findall(m.e .& (m.t .== s))
		g(a) = sum(w[i] / (1 - a^w[i]) for i in deaths) - sum(w[m.t .>= s])  # increasing in a
		lo, hi = 0.0, 1.0
		for _ in 1:100
			mid = (lo + hi) / 2
			g(mid) > 0 ? (hi = mid) : (lo = mid)
		end
		(lo + hi) / 2
	end
	S0 = cumprod(α)
	(t, r) -> (j = searchsortedlast(times, t); j == 0 ? 1.0 : S0[j]^exp(r - c))
end

# The tests: Dickson, Grambsch, Fleming, Fisher and Langworthy's (1989) Mayo model of primary biliary cirrhosis, from the pbc table of
# PollisDatasets: the 418 Mayo patients as Fleming and Harrington (1991) published them

"""
The five measurements of the Mayo model for the patients in `rows`, one column each, in the order of Table 2: log bilirubin, log
albumin, age, log prothrombin time and edema.
"""
riskfactors(pbc, rows; protime=pbc.protime) = Float64.(hcat(log.(pbc.bili[rows]), log.(pbc.albumin[rows]), pbc.age[rows], log.(protime[rows]), pbc.edema[rows]))

"The follow-up in days, and whether it ended in death (transplanted patients are censored at transplantation)."
followup(pbc) = Float64.(pbc.time), pbc.status .== 2

"The initial model, fitted to the 312 trial patients."
function initial(pbc)
	days, dead = followup(pbc)
	cox(riskfactors(pbc, 1:312), days[1:312], dead[1:312])
end

"""
The final model, fitted to all 418 patients, after estimating the two missing prothrombin times by a regression on the other four
measurements; with its matrix of measurements.
"""
function final(pbc)
	days, dead = followup(pbc)
	n = length(days)
	missingpt = findall(ismissing, pbc.protime)
	known = setdiff(1:n, missingpt)
	Z(rows) = Float64.(hcat(ones(length(rows)), log.(pbc.bili[rows]), log.(pbc.albumin[rows]), pbc.age[rows], pbc.edema[rows]))
	b = Z(known) \ log.(Float64.(pbc.protime[known]))
	protime = Float64.(coalesce.(pbc.protime, NaN))
	protime[missingpt] = exp.(Z(missingpt) * b)
	cox(riskfactors(pbc, 1:n; protime), days, dead)
end

"A column of Table 2 (p. 4): for each measurement, its coefficient, standard error, chi-square and p value."
column(m) = vec(permutedims([m.β m.se m.chi2 m.p]))

"Table 2 (p. 4), the initial model's column."
table2initial(pbc) = column(initial(pbc))

"Table 2 (p. 4), the final model's column."
table2final(pbc) = column(final(pbc))

"The likelihood ratio chi-square of the initial model (p. 4)."
likelihoodratio(pbc) = [initial(pbc).LR]

"Table 4 (p. 6): the baseline survival S0(t) of the final model for years 1 to 7, at the mean risk score of the 418 patients."
function table4(pbc)
	m = final(pbc)
	S = survival(m)
	c = mean(m.X * m.β)
	[S(y * 365.25, c) for y in 1:7]
end

end
