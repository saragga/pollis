### A Pluto.jl notebook ###
# v0.20.4

using Markdown
using InteractiveUtils

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000001
md"""
# Univariate Distributions

This notebook introduces discrete and continuous univariate distributions using [Distributions.jl](https://github.com/JuliaStats/Distributions.jl).
"""

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000002
using Distributions, Random
Random.seed!(42)

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000003
md"## Discrete Distributions"

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000004
let
	d = Binomial(10, 0.3)
	println("mean = ", mean(d))
	println("var  = ", var(d))
	println("sample: ", rand(d, 5))
end

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000005
let
	d = Poisson(2.5)
	println("mean = ", mean(d))
	println("sample: ", rand(d, 5))
end

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000006
md"## Continuous Distributions"

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000007
let
	d = Normal(0.0, 1.0)
	println("mean = ", mean(d))
	println("std  = ", std(d))
	println("pdf(0) = ", pdf(d, 0.0))
	println("cdf(1) = ", cdf(d, 1.0))
	println("sample: ", rand(d, 5))
end

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000008
let
	d = Gamma(2.0, 1.0)
	println("mean = ", mean(d))
	println("std  = ", std(d))
	println("sample: ", rand(d, 5))
end

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000009
md"## Fitting a Distribution to Data"

# ╔═╡ a1b2c3d4-0001-4000-8000-000000000010
let
	data = rand(Normal(2.0, 0.5), 200)
	d = fit(Normal, data)
	println("fitted mean = ", mean(d))
	println("fitted std  = ", std(d))
end

# ╔═╡ Cell order:
# ╟─a1b2c3d4-0001-4000-8000-000000000001
# ╠═a1b2c3d4-0001-4000-8000-000000000002
# ╟─a1b2c3d4-0001-4000-8000-000000000003
# ╠═a1b2c3d4-0001-4000-8000-000000000004
# ╠═a1b2c3d4-0001-4000-8000-000000000005
# ╟─a1b2c3d4-0001-4000-8000-000000000006
# ╠═a1b2c3d4-0001-4000-8000-000000000007
# ╠═a1b2c3d4-0001-4000-8000-000000000008
# ╟─a1b2c3d4-0001-4000-8000-000000000009
# ╠═a1b2c3d4-0001-4000-8000-000000000010
