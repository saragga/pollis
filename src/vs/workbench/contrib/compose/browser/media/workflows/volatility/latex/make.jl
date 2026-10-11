# The template of the volatility workflow's report: Pollis copies report.tex, references.bib and this file to the
# report folder and runs this file there, in the notebook's folder, to write the figures and tables report.tex uses.
# It runs the notebook's cells in order; the only additions save figures (figures/) and tables (tables/) by absolute path.

const OUT = @__DIR__
mkpath(joinpath(OUT, "figures")); mkpath(joinpath(OUT, "tables"))

Pollis.packages("ARCHModels", "Optim", "ForwardDiff", "PollisDatasets", "Plots")

# ---- Cell 4: set-up ----
using ARCHModels, Optim, ForwardDiff, PollisDatasets, Plots, Printf, Statistics, LinearAlgebra

const REPLICATED = Dict{String, Vector{Any}}()  # rows of each `replicate` call, for the tables

function replicate(title, rows)
	@printf("\n%s\n%-26s%16s%14s%14s\n", title, "", "Julia", "rounded", "published")
	REPLICATED[title] = []
	for (label, value, published) in rows
		p = parse(Float64, replace(published, "," => ""))
		d = occursin('.', published) ? length(split(published, '.')[end]) : 0  # decimals as published
		k = findlast(j -> round(value, digits=j) == round(p, digits=j), 0:d)  # position in 0:d
		@printf("%-26s%16.8f%14s%14s  %s\n", label, value, Printf.format(Printf.Format("%.$(d)f"), value), published, k === nothing ? "DIFFERENT" : "same to $(k - 1) decimals")
		push!(REPLICATED[title], (label = label, value = Float64(value), published = published, decimals = d, same = k === nothing ? nothing : k - 1))
	end
end

bg = dataset("bg96");  # one row per trading day
hasproperty(bg, :nontrading) || error("This workflow needs the nontrading column of bg96: update PollisDatasets")
y = Float64.(bg.return);  # daily percentage returns, 100 [ln(P_t) - ln(P_t-1)]
s = Float64.(bg.nontrading);  # 1 after a weekend or holiday, 0 otherwise
T = length(y);

# ---- Cell 6: the data ----
r1 = sum((y[2:end] .- mean(y)) .* (y[1:end-1] .- mean(y))) / sum(abs2, y .- mean(y));  # first-order autocorrelation
replicate("The data (Bollerslev and Ghysels 1996, p. 145)", [
	("observations", T, "1,974"), ("non-trading days", sum(s), "456"), ("share, %", 100 * mean(s), "23"), ("autocorrelation, lag 1", r1, ".009")])
@printf("\nvariance of the returns: %.3f on ordinary days, %.3f after non-trading days\n", var(y[s .== 0]), var(y[s .== 1]))

plot(y, lw=0.5, color=:gray, label="return", xlabel="trading day (January 1984 to December 1991)", ylabel="%")
scatter!(findall(==(1), s), y[s .== 1], ms=1.5, msw=0, color=:red, label="after no trading")
plot!(size=(800, 360), legend=:bottomleft, left_margin=3Plots.mm, bottom_margin=3Plots.mm)
savefig(joinpath(OUT, "figures", "returns.pdf"))

# ---- Cell 8: the models ----
parameters = ["mu", "mu1", "omega", "omega1", "alpha", "alpha1", "beta"];
statistics = (:AIC, :SIC, :b3, :b4, :Q, :Q2, :MSE, :HMSE, :LL);  # the rows below the estimates in Table 2

function variances(θ)
	μ, μ1, ω, ω1, α, α1, β = θ
	ε = y .- μ .- μ1 .* s
	h = similar(ε)
	h[1] = var(y)  # start from the sample variance
	for t in 2:T
		level = ω + ω1 * s[t-1]  # the variance level of day t-1
		h[t] = ω + ω1 * s[t] + (α + α1 * s[t]) * (ε[t-1]^2 - level) + β * (h[t-1] - level)
	end
	ε, h
end

function loglik(θ)
	ε, h = variances(θ)
	all(>(0), h) || return fill(oftype(first(h), -Inf), T)
	-(log(2pi) .+ log.(h) .+ ε .^ 2 ./ h) ./ 2
end

function diagnostics(ε, h, LL, k)
	z = ε ./ sqrt.(h)
	ljungbox(x) = (c = x .- mean(x); T * (T + 2) * sum((sum(c[j+1:end] .* c[1:end-j]) / sum(abs2, c))^2 / (T - j) for j in 1:20))
	(AIC = 2LL - 2k, SIC = 2LL - k * log(T), b3 = mean(z .^ 3), b4 = mean(z .^ 4), Q = ljungbox(z), Q2 = ljungbox(z .^ 2),
		MSE = mean((ε .^ 2 .- h) .^ 2), HMSE = mean((ε .^ 2 ./ h .- 1) .^ 2), LL = mean(log.(ε .^ 2 ./ h) .^ 2))
end

function qmle(free, start)
	expand(p) = (θ = zeros(eltype(p), 7); θ[free] = p; θ)
	nll(p) = -sum(loglik(expand(p)))
	p = Optim.minimizer(optimize(nll, start, BFGS(), Optim.Options(g_tol=1e-10); autodiff=:forward))
	H = ForwardDiff.hessian(nll, p)
	G = ForwardDiff.jacobian(q -> loglik(expand(q)), p)  # the score of each day
	se = sqrt.(diag(H \ (transpose(G) * G) / H))  # robust (sandwich) standard errors
	ε, h = variances(expand(p))
	(θ = expand(p), se = expand(se), h = h, logL = -nll(p), diagnostics(ε, h, -nll(p), length(p))...)
end

function table2(title, m, published)
	rows = []
	for (i, name) in enumerate(parameters)
		haskey(published, Symbol(name)) || continue
		b, se = published[Symbol(name)]
		push!(rows, (name, m.θ[i], b), ("se " * name, m.se[i], se))
	end
	for name in statistics
		push!(rows, (string(name), m[name], published[name]))
	end
	replicate(title, rows)
end

# ---- Cell 10: constant variance ----
m1 = qmle([1, 3], [0.0, 0.2]);  # mu, omega
m2 = qmle([1, 2, 3, 4], [0.0, 0.0, 0.2, 0.1]);  # mu, mu1, omega, omega1
m3 = qmle([1, 3, 4], [0.0, 0.2, 0.1]);  # mu, omega, omega1
table2("Constant variance (Bollerslev and Ghysels 1996, p. 146, Table 2, column 1)", m1, (mu = ("-.016", ".011"), omega = (".221", ".012"),
	AIC = "-2,626.2", SIC = "-2,652.5", b3 = "-.25", b4 = "6.63", Q = "27.8", Q2 = "507.6", MSE = ".275", HMSE = "5.63", LL = "9.67"))
table2("Non-trading days in mean and variance (Table 2, column 2)", m2, (mu = ("-.013", ".011"), mu1 = ("-.017", ".028"), omega = (".200", ".011"), omega1 = (".092", ".036"),
	AIC = "-2,602.7", SIC = "-2,625.1", b3 = "-.25", b4 = "6.18", Q = "27.2", Q2 = "593.0", MSE = ".273", HMSE = "5.18", LL = "9.87"))
table2("Non-trading days in the variance (Table 2, column 3)", m3, (mu = ("-.015", ".010"), omega = (".200", ".011"), omega1 = (".092", ".036"),
	AIC = "-2,601.1", SIC = "-2,617.9", b3 = "-.25", b4 = "6.18", Q = "26.9", Q2 = "599.4", MSE = ".273", HMSE = "5.18", LL = "9.52"))
@printf("\nvariance after no trading: %.0f%% larger (omega1 / omega)\n", 100 * m3.θ[4] / m3.θ[3])

# ---- Cell 12: GARCH(1,1) with ARCHModels ----
am = fit(GARCH{1, 1}, y; meanspec=Intercept)  # robust standard errors by default
w, b1, a1, mu = coef(am);  # intercept, beta, alpha, mean
level = w / (1 - a1 - b1);  # the paper's omega
grad = [1, level, level, 0] ./ (1 - a1 - b1);  # its derivative with respect to (w, b1, a1, mu)
se_am = sqrt.(diag(vcov(am)));
m4 = (logL = loglikelihood(am), diagnostics(residuals(am; standardized=false), volatilities(am) .^ 2, loglikelihood(am), 4)...);
replicate("GARCH(1,1), ARCHModels (Table 2, column 4)", [
	("mu", mu, "-.006"), ("se mu", se_am[4], ".009"), ("omega", level, ".264"), ("se omega", sqrt(transpose(grad) * vcov(am) * grad), ".075"),
	("alpha", a1, ".153"), ("se alpha", se_am[3], ".054"), ("beta", b1, ".806"), ("se beta", se_am[2], ".073"),
	[(string(name), m4[name], p) for (name, p) in zip(statistics, ["-2,221.2", "-2,243.5", "-.40", "6.56", "19.3", "17.5", ".253", "5.52", "8.79"])]...])

# ---- Cell 14: GARCH(1,1) with the dummy ----
m5 = qmle([1, 3, 4, 5, 7], [0.0, 0.25, 0.05, 0.15, 0.8]);  # mu, omega, omega1, alpha, beta
table2("GARCH(1,1) with the dummy (Table 2, column 5)", m5, (mu = ("-.009", ".008"), omega = (".259", ".086"), omega1 = (".054", ".022"), alpha = (".137", ".035"), beta = (".832", ".044"),
	AIC = "-2,191.0", SIC = "-2,219.0", b3 = "-.44", b4 = "5.89", Q = "18.8", Q2 = "21.7", MSE = ".252", HMSE = "4.88", LL = "8.21"))

# ---- Cell 16: P-GARCH(1,1) ----
m6 = qmle([1, 3, 4, 5, 6, 7], [0.0, 0.3, 0.05, 0.15, -0.1, 0.8]);  # mu, omega, omega1, alpha, alpha1, beta
table2("P-GARCH(1,1) (Table 2, column 6)", m6, (mu = ("-.006", ".008"), omega = (".341", ".169"), omega1 = (".043", ".026"), alpha = (".178", ".043"),
	alpha1 = ("-.111", ".044"), beta = (".822", ".042"),
	AIC = "-2,179.3", SIC = "-2,212.9", b3 = "-.46", b4 = "5.87", Q = "19.1", Q2 = "23.9", MSE = ".257", HMSE = "4.67", LL = "8.66"))
replicate("Persistence of a shock (p. 146)", [("alpha + beta", m6.θ[5] + m6.θ[7], "1.000"), ("alpha + alpha1 + beta", m6.θ[5] + m6.θ[6] + m6.θ[7], ".889")])

days = 1400:1600;  # a stretch of 1989-1990
plot(days, sqrt.(m5.h[days]), label="GARCH(1,1) with the dummy", xlabel="trading day", ylabel="conditional volatility (%)")
plot!(days, sqrt.(m6.h[days]), label="P-GARCH(1,1)")
plot!(size=(800, 360), left_margin=3Plots.mm, bottom_margin=3Plots.mm)
savefig(joinpath(OUT, "figures", "volatility.pdf"))

# ---- Cell 18: GARCH or periodic GARCH? ----
@printf("%-34s%12s%12s%12s\n", "", "log lik.", "AIC", "SIC")
models = [("Constant variance", m1), ("Non-trading days, mean and var.", m2), ("Non-trading days, variance", m3),
		("GARCH(1,1)", m4), ("GARCH(1,1) with the dummy", m5), ("P-GARCH(1,1)", m6)]
for (label, m) in models
	@printf("%-34s%12.1f%12.1f%12.1f\n", label, m.logL, m.AIC, m.SIC)
end
t_alpha1 = m6.θ[6] / m6.se[6];
@printf("\nrobust t-statistic of alpha1: %.2f\n", t_alpha1)
periodic = abs(t_alpha1) > 1.96 && m6.AIC > m5.AIC && m6.SIC > m5.SIC  # the rule: significant at 5% and preferred by both criteria
println("periodic = ", periodic)

# ---- Cell 20: column 1 at the published estimates ----
ε, h = variances([-0.016, 0, 0.221, 0, 0, 0, 0]);  # column 1 at its published estimates
d1 = diagnostics(ε, h, sum(loglik([-0.016, 0, 0.221, 0, 0, 0, 0])), 2);
replicate("Column 1 at the published estimates (Table 2)", [("b4", d1.b4, "6.63"), ("HMSE", d1.HMSE, "5.63"), ("LL", d1.LL, "9.67")])

# ================= LaTeX tables, from the values above =================

texnum(x::AbstractString) = (x = replace(x, r"^(-?)\." => s"\g<1>0."); startswith(x, "-") ? "\$-\$" * x[2:end] : x)
function commas(x::AbstractString)  # thousands separators, as the paper prints them
	neg = startswith(x, "-"); x = lstrip(x, '-')
	i, f = occursin('.', x) ? split(x, '.') : (x, nothing)
	i = reverse(join(Iterators.partition(reverse(i), 3) .|> join, ","))
	(neg ? "-" : "") * i * (f === nothing ? "" : "." * f)
end
rounded(r) = (x = Printf.format(Printf.Format("%.$(r.decimals)f"), r.value); occursin(',', r.published) ? commas(x) : x)
agreement(r) = r.same === nothing ? "\\textbf{differs}" : "same to $(r.same) decimal$(r.same == 1 ? "" : "s")"

const LABELS = Dict("mu" => "\$\\mu\$", "mu1" => "\$\\mu_1\$", "omega" => "\$\\omega\$", "omega1" => "\$\\omega_1\$",
	"alpha" => "\$\\alpha\$", "alpha1" => "\$\\alpha_1\$", "beta" => "\$\\beta\$",
	"AIC" => "AIC", "SIC" => "SIC", "b3" => "\$b_3\$", "b4" => "\$b_4\$", "Q" => "\$Q(20)\$", "Q2" => "\$Q^2(20)\$",
	"MSE" => "MSE", "HMSE" => "HMSE", "LL" => "LL",
	"share, %" => "share (\\%)", "alpha + beta" => "\$\\alpha+\\beta\$", "alpha + alpha1 + beta" => "\$\\alpha+\\alpha_1+\\beta\$")
texlabel(l) = startswith(l, "se ") ? "\\quad s.e. " * LABELS[l[4:end]] : get(LABELS, l, l)

"Write the rows of a `replicate` call as the body of a five-column booktabs table."
function writerows(file, title)
	open(joinpath(OUT, "tables", file), "w") do io
		for r in REPLICATED[title]
			r.label == "AIC" && println(io, "\\addlinespace")  # estimates above, statistics below
			println(io, texlabel(r.label), " & ", (isinteger(r.value) ? string(Int(r.value)) : @sprintf("%.6f", r.value)) |> texnum, " & ", texnum(rounded(r)), " & ",
				texnum(commas(replace(r.published, "," => ""))), " & ", agreement(r), " \\\\")
		end
	end
end

writerows("data.tex", "The data (Bollerslev and Ghysels 1996, p. 145)")
writerows("col1.tex", "Constant variance (Bollerslev and Ghysels 1996, p. 146, Table 2, column 1)")
writerows("col2.tex", "Non-trading days in mean and variance (Table 2, column 2)")
writerows("col3.tex", "Non-trading days in the variance (Table 2, column 3)")
writerows("col4.tex", "GARCH(1,1), ARCHModels (Table 2, column 4)")
writerows("col5.tex", "GARCH(1,1) with the dummy (Table 2, column 5)")
writerows("col6.tex", "P-GARCH(1,1) (Table 2, column 6)")
writerows("persistence.tex", "Persistence of a shock (p. 146)")
writerows("col1published.tex", "Column 1 at the published estimates (Table 2)")

open(joinpath(OUT, "tables", "comparison.tex"), "w") do io
	for (label, m) in models
		println(io, label, " & ", join((texnum(@sprintf("%.1f", x)) for x in (m.logL, m.AIC, m.SIC)), " & "), " \\\\")
	end
end

# Numbers quoted in the text, as macros
open(joinpath(OUT, "tables", "values.tex"), "w") do io
	val(name, x) = println(io, "\\newcommand{\\", name, "}{", x, "}")
	val("varordinary", @sprintf("%.3f", var(y[s .== 0])))
	val("varnontrading", @sprintf("%.3f", var(y[s .== 1])))
	val("varlarger", @sprintf("%.0f", 100 * m3.θ[4] / m3.θ[3]))
	val("talphaone", texnum(@sprintf("%.2f", t_alpha1)))
	val("periodicchoice", periodic ? "P-GARCH(1,1)" : "GARCH(1,1) with the dummy")
	val("periodicflag", string(periodic))
	val("nobs", commas(string(T)))
	val("nnontrading", string(Int(sum(s))))
	val("persistord", @sprintf("%.4f", m6.θ[5] + m6.θ[7]))
	val("persistnontrading", @sprintf("%.3f", m6.θ[5] + m6.θ[6] + m6.θ[7]))
	val("qtwoconst", @sprintf("%.1f", m3.Q2))
	val("qtwogarch", @sprintf("%.1f", m4.Q2))
	val("ndiffer", string(count(r -> r.same === nothing, vcat((REPLICATED[t] for t in keys(REPLICATED) if !startswith(t, "Column 1 at"))...))))
	val("nfull", string(count(r -> r.same == r.decimals, vcat((REPLICATED[t] for t in keys(REPLICATED) if !startswith(t, "Column 1 at"))...))))
	val("nvalues", string(sum(length(REPLICATED[t]) for t in keys(REPLICATED) if !startswith(t, "Column 1 at"))))
end
println("\nTables and figures written to ", OUT)
