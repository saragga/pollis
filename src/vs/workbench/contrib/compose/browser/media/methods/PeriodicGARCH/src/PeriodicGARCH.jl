module PeriodicGARCH

using Optim, ADTypes, ForwardDiff, LinearAlgebra, Statistics, Tables

export PARAMETERS, pgarchvariances, pgarchloglik, diagnostics, pgarch

"""The parameters of the periodic GARCH(1,1), in the order of θ: μ, μ₁, ω, ω₁, α, α₁ and β."""
const PARAMETERS = (:mu, :mu1, :omega, :omega1, :alpha, :alpha1, :beta)

"""
	pgarchvariances(θ, y, s)

Residuals and conditional variances of the periodic GARCH(1,1) for returns `y`, dummy `s` and θ = (μ, μ₁, ω, ω₁, α, α₁, β).
"""
function pgarchvariances(θ, y, s)
	μ, μ1, ω, ω1, α, α1, β = θ
	ε = y .- μ .- μ1 .* s
	h = similar(ε)
	h[1] = var(y)  # start from the sample variance
	for t in 2:length(y)
		level = ω + ω1 * s[t-1]  # the variance level of day t-1
		h[t] = ω + ω1 * s[t] + (α + α1 * s[t]) * (ε[t-1]^2 - level) + β * (h[t-1] - level)
	end
	ε, h
end

"""
	pgarchloglik(θ, y, s)

The Gaussian log likelihood of each day, or -Inf everywhere if a variance is not positive."""
function pgarchloglik(θ, y, s)
	ε, h = pgarchvariances(θ, y, s)
	all(>(0), h) || return fill(oftype(first(h), -Inf), length(y))
	-(log(2pi) .+ log.(h) .+ ε .^ 2 ./ h) ./ 2
end

"""
	diagnostics(ε, h, logL, k)

The statistics of Bollerslev and Ghysels's Table 2 for residuals `ε`, variances `h`, log likelihood `logL` and `k` parameters:
AIC and SIC (larger is better), skewness b3 and kurtosis b4 of the standardized residuals, Ljung-Box Q and Q2 for 20 lags,
and the losses MSE, HMSE and LL.
"""
function diagnostics(ε, h, logL, k)
	T = length(ε)
	z = ε ./ sqrt.(h)
	ljungbox(x) = (c = x .- mean(x); T * (T + 2) * sum((sum(c[j+1:end] .* c[1:end-j]) / sum(abs2, c))^2 / (T - j) for j in 1:20))
	(AIC = 2logL - 2k, SIC = 2logL - k * log(T), b3 = mean(z .^ 3), b4 = mean(z .^ 4), Q = ljungbox(z), Q2 = ljungbox(z .^ 2),
		MSE = mean((ε .^ 2 .- h) .^ 2), HMSE = mean((ε .^ 2 ./ h .- 1) .^ 2), LL = mean(log.(ε .^ 2 ./ h) .^ 2))
end

"""
	pgarch(y, s; free=PARAMETERS, start)

Quasi-maximum likelihood fit of the periodic GARCH(1,1) to returns `y` with dummy `s`, the parameters not in `free` held at zero.
`start` gives the starting values of the free ones, in the order of `PARAMETERS`. Returns the estimates θ, robust standard errors,
conditional variances h, the log likelihood and the statistics of `diagnostics`.
"""
function pgarch(y, s; free=PARAMETERS, start)
	index = [findfirst(==(p), PARAMETERS) for p in free]
	expand(p) = (θ = zeros(eltype(p), 7); θ[index] = p; θ)
	nll(p) = -sum(pgarchloglik(expand(p), y, s))
	p = Optim.minimizer(optimize(nll, start, BFGS(), Optim.Options(g_tol=1e-10); autodiff=AutoForwardDiff()))
	H = ForwardDiff.hessian(nll, p)
	G = ForwardDiff.jacobian(q -> pgarchloglik(expand(q), y, s), p)  # the score of each day
	se = sqrt.(diag(H \ (transpose(G) * G) / H))  # robust (sandwich) standard errors
	ε, h = pgarchvariances(expand(p), y, s)
	(θ = expand(p), se = expand(se), h = h, logL = -nll(p), diagnostics(ε, h, -nll(p), length(p))...)
end

# The tests: Bollerslev and Ghysels's (1996) Table 2, columns 5 and 6, on the Deutsche mark / British pound returns of the bg96 table
# of PollisDatasets, with the paper's non-trading-day dummy

const STATISTICS = (:AIC, :SIC, :b3, :b4, :Q, :Q2, :MSE, :HMSE, :LL)

"""
A column of Table 2 (p. 146): the estimate and robust standard error of μ, ω, ω₁, α, α₁ and β, NaN for those held at zero, then the
statistics.
"""
function column(m, free)
	rows = Float64[]
	for (i, p) in enumerate(PARAMETERS)
		p === :mu1 && continue  # not in the table
		append!(rows, p in free ? [m.θ[i], m.se[i]] : [NaN, NaN])
	end
	[rows; [m[k] for k in STATISTICS]]
end

const FREE5 = (:mu, :omega, :omega1, :alpha, :beta)
const FREE6 = (:mu, :omega, :omega1, :alpha, :alpha1, :beta)

fit5(bg96) = pgarch(Float64.(bg96.return), Float64.(bg96.nontrading); free=FREE5, start=[0.0, 0.25, 0.05, 0.15, 0.8])
fit6(bg96) = pgarch(Float64.(bg96.return), Float64.(bg96.nontrading); free=FREE6, start=[0.0, 0.3, 0.05, 0.15, -0.1, 0.8])

"Table 2 (p. 146), columns 5 (GARCH(1,1) with the dummy) and 6 (P-GARCH(1,1))."
table2(bg96) = [column(fit5(bg96), FREE5) column(fit6(bg96), FREE6)]

"The persistence of a shock in P-GARCH(1,1) (p. 146): α + β, and α + α₁ + β after a day without trading."
function persistence(bg96)
	θ = fit6(bg96).θ
	[θ[5] + θ[7], θ[5] + θ[6] + θ[7]]
end

end
