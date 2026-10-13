module ErrorComponents

using LinearAlgebra, Statistics, Tables

export variances, errorcomponents

"""The dummies of a grouping: one column per group."""
dummies(g) = Float64.(g .== permutedims(unique(g)))

"""The projection onto the columns of `W`; `pinv` allows designs with redundant columns."""
projection(W) = W * pinv(W)

"""
	projections(groups, structure)

The orthogonal projections that split the data, the within projection first: `:oneway` (individuals), `:twoway` (individuals, periods)
or `:nested` (regions, then states within them). Each is orthogonal to the overall mean.
"""
function projections(groups, structure)
	n = length(groups[1]); J = fill(1 / n, n, n)
	P = [projection(dummies(g)) for g in groups]
	structure == :oneway && return [I - P[1], P[1] - J]
	structure == :twoway && return [I - P[1] - P[2] + J, P[1] - J, P[2] - J]
	structure == :nested && return [I - P[2], P[2] - P[1], P[1] - J]
	error("structure must be :oneway, :twoway or :nested")
end

"""
	anova(y, forms, incidence)

Variance components by equating each sum of squares `e'Ae`, with `e = M*y`, to its exact expectation. `forms` are the pairs `(A, M)`;
`incidence` are the incidence matrices of the components, the remainder (the identity) last.
"""
function anova(y, forms, incidence)
	q = [(e = M * y; transpose(e) * A * e) for (A, M) in forms]
	E = [(B = transpose(M) * A * M; tr(transpose(Z) * B * Z)) for (A, M) in forms, Z in incidence]
	E \ q
end

"""Residuals of the regression of `A*y` on `A*X`, as a matrix that acts on `y`."""
residualsof(A, X) = (AX = A * X; A - AX * pinv(AX))

"""
	variances(y, X, groups; structure=:oneway, method=:swar, prior=nothing)

The variances of the error components, in the order of `groups` and then the remainder, by `method` `:walhus`, `:amemiya`, `:swar`,
`:hfb` (nested only) or `:mivque` (with `prior`, a guess of the same variances). Negative estimates are set to zero. `divisors = :trace`
(WALHUS and AMEMIYA, one-way and two-way) divides each sum of squares by the trace of its projection, as R's plm does.
"""
function variances(y, X, groups; structure=:oneway, method=:swar, prior=nothing, divisors=:exact)
	n = length(y); Z = [ones(n) X]; J = fill(1 / n, n, n)
	A = projections(groups, structure)
	incidence = [[dummies(g) for g in groups]; [Matrix(1.0I, n, n)]]
	if method == :walhus
		Mols = I - projection(Z)
		forms = [(Ak, Mols) for Ak in A]
	elseif method == :amemiya
		Mwithin = (I - J) * (I - X * pinv(A[1] * X) * A[1])  # y - alpha - X b, alpha = ybar - xbar b
		forms = [(Ak, Mwithin) for Ak in A]
	elseif method == :swar
		forms = [(Ak, residualsof(Ak, X)) for Ak in A]
	elseif method == :hfb
		structure == :nested || error("HFB is written for the nested model")
		H = [projection([Z dummies(groups[2])]), projection([Z dummies(groups[1])]), projection(Z)]
		forms = [(I - H[1], I), (H[1] - H[2], I), (H[2] - H[3], I)]
	elseif method == :mivque
		V = sum(prior[k] * incidence[k] * transpose(incidence[k]) for k in eachindex(incidence))
		Vi = inv(V); R = Vi - Vi * Z * ((transpose(Z) * Vi * Z) \ (transpose(Z) * Vi))
		forms = [(R * Zk * transpose(Zk) * R, I) for Zk in incidence]
		E = [tr(R * Zi * transpose(Zi) * R * Zj * transpose(Zj)) for Zi in incidence, Zj in incidence]
		return max.(E \ [transpose(y) * A * y for (A, _) in forms], 0)
	else
		error("unknown method $method")
	end
	if divisors == :trace
		method in (:walhus, :amemiya) && structure != :nested || error("trace divisors are for WALHUS and AMEMIYA, one-way and two-way")
		structure == :oneway && (forms[2] = (forms[2][1] + J, forms[2][2]))  # P, whose trace is N (2.21)
		q = [(e = M * y; transpose(e) * Ak * e) for (Ak, M) in forms]
		E = [tr(transpose(Zc) * Ak * Zc) for (Ak, _) in forms, Zc in incidence]  # expectations of the true disturbances
		return max.(E \ q, 0)
	end
	max.(anova(y, forms, incidence), 0)
end

"""
	errorcomponents(y, X, groups; structure=:oneway, method=:swar, prior=nothing, divisors=:exact, scale=false)

Feasible GLS of `y` on an intercept and `X` with error components: the coefficients, their standard errors and the variances
(see `variances`). `scale = true` multiplies the covariance matrix by the residual variance of the transformed regression.
"""
function errorcomponents(y, X, groups; structure=:oneway, method=:swar, prior=nothing, divisors=:exact, scale=false)
	n = length(y); Z = [ones(n) X]
	s = variances(y, X, groups; structure, method, prior, divisors)
	incidence = [[dummies(g) for g in groups]; [Matrix(1.0I, n, n)]]
	C = cholesky(Symmetric(sum(s[k] * incidence[k] * transpose(incidence[k]) for k in eachindex(incidence))))
	Zt, yt = C.L \ Z, C.L \ y
	V = inv(transpose(Zt) * Zt); b = V * (transpose(Zt) * yt)
	scale && (V *= sum(abs2, yt - Zt * b) / (n - size(Z, 2)))
	(coef = b, se = sqrt.(diag(V)), variances = s)
end

# The tests: Baltagi's Econometric Analysis of Panel Data (3rd edition, 2005), Tables 2.1, 2.5, 2.6, 3.1, 3.6, 3.7 and 9.4, on the
# grunfeld, gasoline and produc tables of PollisDatasets

const METHODS = (:walhus, :amemiya, :swar)

"""
One estimator's column of a published table: each slope (and the intercept if `intercept`) followed by its standard error, then rho
= sigma_mu^2 / (sigma_mu^2 + sigma_nu^2) if `rho`, then the components in the order of `components`, standard deviations unless `variance`.
"""
function column(fit; components, intercept=false, variance=false, rho=false)
	v = fit.variances
	values = Float64[]
	for i in (intercept ? eachindex(fit.coef) : 2:length(fit.coef))
		push!(values, fit.coef[i], fit.se[i])
	end
	rho && push!(values, v[1] / (v[1] + v[end]))
	append!(values, [variance ? v[i] : sqrt(v[i]) for i in components])
end

"Baltagi's 10 Grunfeld firms, without American Steel: investment, the regressors F and K, firms and years."
function firms(grunfeld)
	keep = grunfeld.firm .!= "American Steel"
	(y = Float64.(grunfeld.invest[keep]), X = Float64.([grunfeld.value[keep] grunfeld.capital[keep]]), firm = grunfeld.firm[keep], year = grunfeld.year[keep])
end

"Baltagi and Griffin's gasoline demand: log gasoline per car on log income, log real price and log cars per capita."
countries(gasoline) = (y = Float64.(gasoline.lgaspcar), X = Float64.([gasoline.lincomep gasoline.lrpmg gasoline.lcarpcap]), country = gasoline.country, year = gasoline.year)

"Munnell's public capital: log gross state product on log public capital, log private capital, log employment and unemployment."
states(produc) = (y = log.(Float64.(produc.gsp)), X = [log.(produc.pcap) log.(produc.pc) log.(produc.emp) Float64.(produc.unemp)], state = produc.state, year = produc.year)

"The one-way columns WALHUS, AMEMIYA and SWAR."
oneway(d, g) = reduce(hcat, [column(errorcomponents(d.y, d.X, [g]; method); components=[1, 2], rho=true) for method in METHODS])

"The two-way columns WALHUS, AMEMIYA and SWAR, with standard errors scaled as Baltagi's two-way tables are."
twoway(d, g, t) = reduce(hcat, [column(errorcomponents(d.y, d.X, [g, t]; structure=:twoway, method, scale=true); components=[1, 2, 3]) for method in METHODS])

"Table 2.1 (p. 21): Grunfeld, one-way."
table21(grunfeld) = (d = firms(grunfeld); oneway(d, d.firm))

"Table 2.5 (p. 24): gasoline, one-way."
table25(gasoline) = (d = countries(gasoline); oneway(d, d.country))

"Table 2.6 (p. 25): public capital, one-way."
table26(produc) = (d = states(produc); oneway(d, d.state))

"Table 3.1 (p. 43): Grunfeld, two-way."
table31(grunfeld) = (d = firms(grunfeld); twoway(d, d.firm, d.year))

"Table 3.6 (p. 46): gasoline, two-way."
table36(gasoline) = (d = countries(gasoline); twoway(d, d.country, d.year))

"Table 3.7 (p. 47): public capital, two-way."
table37(produc) = (d = states(produc); twoway(d, d.state, d.year))

"""
Table 9.4 (p. 182): public capital with states nested in regions, the columns WH, WK, SA, HFB, MV1 (prior 0, 0, 1) and MV2 (prior 1, 1, 1).
"""
function table94(produc)
	y = log.(Float64.(produc.gsp))
	X = [log.(produc.pc) log.(produc.emp) log.(produc.hwy) log.(produc.water) log.(produc.util) Float64.(produc.unemp)]
	groups = [produc.region, produc.state]
	options = [(method=:walhus,), (method=:amemiya,), (method=:swar,), (method=:hfb,), (method=:mivque, prior=[0, 0, 1]), (method=:mivque, prior=[1, 1, 1])]
	reduce(hcat, [column(errorcomponents(y, X, groups; structure=:nested, o...); components=[3, 1, 2], intercept=true, variance=true) for o in options])
end

end
