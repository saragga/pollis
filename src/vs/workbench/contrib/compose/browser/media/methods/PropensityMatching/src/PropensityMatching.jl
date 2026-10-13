module PropensityMatching

using LinearAlgebra, Statistics, Tables

export Logit, logit, logodds, commonsupport, trimmedsupport, nnmatch, att, tierange, locallinear, matchweights, balance, ols

"""
	Logit

A logit model of the probability of treatment, fitted by maximum likelihood. Fields: `coefficients` (the constant first),
`se` (their standard errors, from the inverse of the information matrix), `fitted` (the estimated propensity scores) and
`loglikelihood`.
"""
struct Logit
	coefficients::Vector{Float64}
	se::Vector{Float64}
	fitted::Vector{Float64}
	loglikelihood::Float64
end

Base.show(io::IO, m::Logit) = print(io, "Logit with $(length(m.coefficients)) coefficients, log-likelihood $(round(m.loglikelihood; digits = 3))")

"""
	logit(X, d; intercept = true, tol = 1e-10, maxiter = 100)

Fits the logit P(d = 1 | x) = 1 / (1 + exp(-x'β)) by Newton-Raphson. `X` holds one column for each term of the
specification and `d` is 1 for the treated and 0 for the comparison units; a constant is added first unless `intercept` is
false. Earnings are best given in thousands of dollars, as squares of earnings in dollars make the information matrix
nearly singular.
"""
function logit(X::AbstractMatrix{<:Real}, d::AbstractVector{<:Real}; intercept::Bool = true, tol::Real = 1e-10, maxiter::Integer = 100)
	A = intercept ? hcat(ones(size(X, 1)), float.(X)) : float.(X)
	y = float.(d)
	β = zeros(size(A, 2))
	H = Matrix{Float64}(undef, 0, 0)
	for _ in 1:maxiter
		p = 1 ./ (1 .+ exp.(-A * β))
		H = A' * (A .* (p .* (1 .- p)))
		step = H \ (A' * (y - p))
		β += step
		maximum(abs, step) < tol * (1 + maximum(abs, β)) && break
	end
	p = 1 ./ (1 .+ exp.(-A * β))
	H = A' * (A .* (p .* (1 .- p)))
	ll = sum(@. y * log(p) + (1 - y) * log1p(-p))
	Logit(β, sqrt.(diag(inv(H))), p, ll)
end

"The log-odds ratio log(p / (1 - p)) of a propensity score, on which Smith and Todd match."
logodds(p) = @. log(p / (1 - p))

"""
	commonsupport(score, d)

Dehejia and Wahba's common support: every treated unit, and the comparison units whose score lies between the smallest
and the largest score of the treated. Returns a Bool mask.
"""
function commonsupport(score::AbstractVector{<:Real}, d::AbstractVector{<:Real})
	lo, hi = extrema(score[d .== 1])
	(d .== 1) .| ((score .>= lo) .& (score .<= hi))
end

"The quartic (biweight) kernel, (15/16)(1 - s²)² on [-1, 1]."
quartic(s) = abs(s) <= 1 ? 15 / 16 * (1 - s^2)^2 : 0.0

"Silverman's rule-of-thumb bandwidth, 1.06 σ n^(-1/5)."
silverman(x) = 1.06 * std(x) * length(x)^(-1 / 5)

"The kernel density estimate of the sample `x` at the points `at`."
density(x, at, h) = [sum(quartic((xj - a) / h) for xj in x) / (length(x) * h) for a in at]

"""
	trimmedsupport(score, d; q = 0.02)

Smith and Todd's common support (their Section 3.3): the treated units at whose score the quartic-kernel densities of the
treated and of the comparison scores (Silverman bandwidths) are both positive and both above the density cut-off that
trims `q` of them. Returns the indices of the treated units kept.
"""
function trimmedsupport(score::AbstractVector{<:Real}, d::AbstractVector{<:Real}; q::Real = 0.02)
	treated = findall(d .== 1)
	s1, s0 = score[treated], score[d .== 0]
	f1, f0 = density(s1, s1, silverman(s1)), density(s0, s1, silverman(s0))
	positive = findall((f1 .> 0) .& (f0 .> 0))
	J = length(positive)
	cut = 0.0
	for c in sort(unique([f1[positive]; f0[positive]]))
		(count(<(c), f1[positive]) + count(<(c), f0[positive])) / 2J <= q || break
		cut = c
	end
	treated[positive[(f1[positive] .> cut) .& (f0[positive] .> cut)]]
end

"""
	nnmatch(score, d; k = 1, keep = trues(length(d)), ties = :first)

Nearest-neighbour matching on the score with replacement: for each treated unit, the `k` comparison units in `keep` whose
scores are closest to its own. With `ties = :first` a tie goes to the unit that comes first in the data; with
`ties = :all` every comparison unit tied with the k-th is kept. Returns the treated indices and, for each, the vector of
its matches.
"""
function nnmatch(score::AbstractVector{<:Real}, d::AbstractVector{<:Real}; k::Integer = 1, keep::AbstractVector{Bool} = trues(length(d)), ties::Symbol = :first)
	treated = findall(d .== 1)
	pool = findall((d .== 0) .& keep)
	matches = map(treated) do i
		distance = abs.(score[pool] .- score[i])
		order = sortperm(distance; alg = MergeSort)
		ties === :all ? pool[distance .<= distance[order[k]]] : pool[order[1:k]]
	end
	treated, matches
end

"""
	att(y, treated, matches)

The effect of treatment on the treated: the mean over the treated of their outcome less the mean outcome of their matches.
"""
att(y::AbstractVector{<:Real}, treated, matches) = mean(y[i] - mean(y[m]) for (i, m) in zip(treated, matches))

"""
	tierange(y, score, d; keep = trues(length(d)))

The smallest and the largest single nearest-neighbour estimate over every way of breaking exact ties in the score.
"""
function tierange(y::AbstractVector{<:Real}, score::AbstractVector{<:Real}, d::AbstractVector{<:Real}; keep::AbstractVector{Bool} = trues(length(d)))
	treated, matches = nnmatch(score, d; keep, ties = :all)
	(mean(y[i] - maximum(y[m]) for (i, m) in zip(treated, matches)), mean(y[i] - minimum(y[m]) for (i, m) in zip(treated, matches)))
end

"""
	locallinear(y, score, d, h; treated = findall(d .== 1))

Local linear matching (Smith and Todd's eq. 11): the effect on the `treated` of their outcome less the local linear
regression of the comparison outcomes on the score at their own score, with the quartic kernel and bandwidth `h`.
"""
function locallinear(y::AbstractVector{<:Real}, score::AbstractVector{<:Real}, d::AbstractVector{<:Real}, h::Real; treated = findall(d .== 1))
	s0, y0 = score[d .== 0], y[d .== 0]
	counterfactual = map(treated) do i
		Δ = s0 .- score[i]
		g = quartic.(Δ ./ h)
		S0, S1, S2 = sum(g), sum(g .* Δ), sum(g .* Δ .^ 2)
		sum(g .* (S2 .- Δ .* S1) .* y0) / (S0 * S2 - S1^2)
	end
	mean(y[treated]) - mean(counterfactual)
end

"""
	matchweights(n, treated, matches)

Each unit's weight after matching: 1 for a treated unit, and for a comparison unit the number of times it is matched,
divided among ties.
"""
function matchweights(n::Integer, treated, matches)
	w = zeros(n)
	for (i, m) in zip(treated, matches)
		w[i] = 1
		w[m] .+= 1 / length(m)
	end
	w
end

"""
	balance(X, d; weights = ones(length(d)))

The difference in means between the treated and the (weighted) comparison units of each column of `X`, divided by the
standard deviation of the treated for a continuous column and left as it is for a binary one, as R's cobalt reports it.
"""
function balance(X::AbstractMatrix{<:Real}, d::AbstractVector{<:Real}; weights::AbstractVector{<:Real} = ones(length(d)))
	t, c = d .== 1, d .== 0
	map(eachcol(X)) do x
		difference = mean(x[t]) - sum(weights[c] .* x[c]) / sum(weights[c])
		all(in((0, 1)), x) ? difference : difference / std(x[t])
	end
end

"""
	ols(y, X)

Least squares of `y` on a constant and the columns of `X`: the coefficients, the constant first, and their standard errors.
"""
function ols(y::AbstractVector{<:Real}, X::AbstractMatrix{<:Real})
	A = hcat(ones(length(y)), float.(X))
	b = A \ y
	e = y - A * b
	b, sqrt.(diag(inv(A' * A)) .* (sum(abs2, e) / (length(y) - size(A, 2))))
end

# The articles' samples and specifications. Each input is a column table of one of Dehejia's files: treat, age, educ,
# black, hisp, married, nodegree, re74 (not in LaLonde's files), re75 and re78.

columns(t, names) = NamedTuple{names}(Tuple(Float64.(Tables.getcolumn(t, n)) for n in names))
const NAMES = (:treat, :age, :educ, :black, :hisp, :married, :nodegree, :re74, :re75, :re78)
sample(t) = columns(t, Tuple(n for n in NAMES if n in Tables.columnnames(t)))
stack(a, b) = (a = sample(a); b = sample(b); NamedTuple{keys(a)}(Tuple(vcat(a[n], b[n]) for n in keys(a))))
unemployed(x) = Float64.(x .== 0)
thousands(s) = merge(s, NamedTuple{Tuple(n for n in (:re74, :re75) if n in keys(s))}(Tuple(s[n] ./ 1000 for n in (:re74, :re75) if n in keys(s))))

"Dehejia and Wahba's (2002) specifications, as printed in Smith and Todd's Table 3 (earnings in thousands of dollars)."
dw2002(s, comparison) = comparison == :cps ?
	hcat(s.age, s.age .^ 2, s.age .^ 3 ./ 1000, s.educ, s.educ .^ 2, s.nodegree, s.married, s.black, s.hisp, s.re74, s.re75, unemployed(s.re74), unemployed(s.re75), s.educ .* s.re74) :
	hcat(s.age, s.age .^ 2, s.educ, s.educ .^ 2, s.nodegree, s.married, s.black, s.hisp, s.re74, s.re74 .^ 2, s.re75, s.re75 .^ 2, unemployed(s.re74), unemployed(s.re75), unemployed(s.re74) .* s.hisp)

"Dehejia's (2005) Table 2 specifications (earnings in thousands of dollars)."
function dehejia2005(s, name)
	base(s) = hcat(s.re74, s.re75, s.married, s.black, s.hisp, s.educ, s.age)
	name == "CPS/DW" ? hcat(base(s), s.black .* s.age) :
	name == "PSID/DW" ? hcat(base(s), s.married .* unemployed(s.re75), s.nodegree .* unemployed(s.re74)) :
	name == "CPS/Lalonde" ? hcat(s.re75, s.married, s.black, s.hisp, s.age, s.educ, s.married .* unemployed(s.re75), s.nodegree .* s.re75, s.age .^ 2) :
	name == "PSID/Lalonde" ? hcat(s.re75, s.married, s.black, s.hisp, s.age, s.educ, s.black .* s.educ, s.hisp .* s.re75, s.nodegree .* s.educ) :
	name == "CPS/ST" ? hcat(base(s), s.nodegree .* unemployed(s.re75), s.re74 .^ 2) :
	name == "PSID/ST" ? hcat(base(s), s.hisp .* s.educ, s.re74 .^ 2) :
	throw(ArgumentError("no specification $name"))
end

"""
Table 1 of Dehejia and Wahba (1999), the means: LaLonde's treated and controls, the RE74 subset's, and the six comparison
groups, one row each; columns age, education, black, Hispanic, no degree, married, RE74 and RE75 (RE74 is not in LaLonde's
files).
"""
function dw1999table1(lalondetreated, lalondecontrols, treated, controls, psid, psid2, psid3, cps, cps2, cps3)
	function row(t)
		s = sample(t)
		[[mean(s[n]) for n in (:age, :educ, :black, :hisp, :nodegree, :married)]; haskey(s, :re74) ? mean(s.re74) : NaN; mean(s.re75)]
	end
	permutedims(reduce(hcat, [row(t) for t in (lalondetreated, lalondecontrols, treated, controls, psid, psid2, psid3, cps, cps2, cps3)]))
end

"Table 3, column (1) of Dehejia and Wahba (1999): mean 1978 earnings of the treated less those of the controls and of each comparison group."
dw1999table3(treated, controls, psid, psid2, psid3, cps, cps2, cps3) =
	[mean(sample(treated).re78) - mean(sample(c).re78) for c in (controls, psid, psid2, psid3, cps, cps2, cps3)]

"""
The propensity score of Smith and Todd's Table 3 for the DW sample: the NSW treated and controls against the comparison
group, Dehejia and Wahba's (2002) specification with a constant.
"""
function stscore(treated, controls, comparison, kind)
	nsw = stack(treated, controls)
	s = stack(nsw, comparison)
	d = [ones(length(nsw.age)); zeros(length(s.age) - length(nsw.age))]
	s, d, logit(dw2002(thousands(s), kind), d)
end

"The coefficients in dollars, as printed: those of earnings divided by 1000 and those of squared earnings by 10⁶."
function dollars(m::Logit, kind)
	scale = kind == :cps ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1e-3, 1e-3, 1, 1, 1e-3] : [1, 1, 1, 1, 1, 1, 1, 1, 1e-3, 1e-6, 1e-3, 1e-6, 1, 1, 1]
	[m.coefficients[2:end] .* scale; m.coefficients[1]], [m.se[2:end] .* scale; m.se[1]]
end

"Smith and Todd's Table 3, DW sample, CPS column: the coefficients and their standard errors, the intercept last."
function sttable3cps(treated, controls, cps)
	b, se = dollars(stscore(treated, controls, cps, :cps)[3], :cps)
	[b se]
end

"Smith and Todd's Table 3, DW sample, PSID column: the coefficients, the intercept last."
sttable3psid(treated, controls, psid) = dollars(stscore(treated, controls, psid, :psid)[3], :psid)[1]

"""
The bias of the estimators that Smith and Todd apply to the NSW controls and the comparison group, whose effect is zero:
the mean difference of Table 5, column (1), and the regression on Dehejia and Wahba's (2002) covariates of Table 7,
column (3), with its standard error; one row each for CPS and PSID.
"""
function stbias(treated, controls, cps, psid)
	map([(cps, :cps), (psid, :psid)]) do (comparison, kind)
		s = stack(controls, comparison)
		d = [ones(length(sample(controls).age)); zeros(length(s.age) - length(sample(controls).age))]
		b, se = ols(s.re78, hcat(d, dw2002(thousands(s), kind)))
		[mean(s.re78[d .== 1]) - mean(s.re78[d .== 0]), b[2], se[2]]
	end |> rows -> permutedims(reduce(hcat, rows))
end

"""
Smith and Todd's Table 5, columns (6)-(7), CPS: local linear matching of the NSW controls on the log-odds ratio, with
bandwidths 1 and 4, over the 2 per cent trimmed common support.
"""
function stlocallinear(treated, controls, cps)
	s, d, m = stscore(treated, controls, cps, :cps)
	ntreated = length(sample(treated).age)
	keep = [i > ntreated for i in eachindex(d)]  # the NSW controls in place of the treated
	z, y, dc = logodds(m.fitted)[keep], s.re78[keep], d[keep]
	support = trimmedsupport(z, dc)
	[locallinear(y, z, dc, h; treated = support) for _ in 1:1, h in (1, 4)]
end

"""
Dehejia's (2005) Tables 3 and 4: single nearest-neighbour matching with replacement on the propensity score of each
Table 2 specification, the ties to the unit first in the data. Rows: the DW sample against the CPS (CPS/Lalonde and CPS/ST
specifications) and the PSID (PSID/DW, PSID/Lalonde, PSID/ST), and the Lalonde sample against the CPS and the PSID with
their own specifications.
"""
function dehejia2005table(treated, lalondetreated, cps, psid)
	cases = [(treated, cps, "CPS/Lalonde"), (treated, cps, "CPS/ST"), (treated, psid, "PSID/DW"), (treated, psid, "PSID/Lalonde"),
		(treated, psid, "PSID/ST"), (lalondetreated, cps, "CPS/Lalonde"), (lalondetreated, psid, "PSID/Lalonde")]
	map(cases) do (t, comparison, name)
		s = stack(t, comparison)
		score = logit(dehejia2005(thousands(s), name), s.treat).fitted
		att(s.re78, nnmatch(score, s.treat)...)
	end
end

end
