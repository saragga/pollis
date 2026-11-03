# SDE Ensemble Analysis: Invariant Distribution

The **Invariant Distribution** tab runs every path to **Time span T** and treats the terminal values X(T) as draws from the stationary distribution, summarised by a histogram, a mean and a standard deviation.

## The code

```
prob = SDEProblem(f, g, X0, (0.0, T))
ens  = solve(EnsembleProblem(prob), SRIW1(), EnsembleThreads(), trajectories=N)
terminal = [sol.u[end] for sol in ens]
h = fit(Histogram, terminal, nbins=50)
```

`fit(Histogram, ...)` comes from StatsBase.jl. The code prints the mean and standard deviation of `terminal`, and `h` holds the 50-bin histogram. With a fixed-step solver, EM or RKMil, the call also passes `dt`.

## The stationary Fokker–Planck–Kolmogorov equation

[Särkkä and Solin (2019)](#ref-SS2019a) derive the Fokker–Planck–Kolmogorov equation for the density p(x, t) of the solution of dx = f(x, t) dt + L(x, t) dβ; in one dimension, with diffusion constant q,

∂p/∂t = −∂[f p]/∂x + ½ ∂²[L² q p]/∂x².

A stationary solution has ∂p/∂t = 0 and solves the equation with the left side set to 0. For SDEs of the form dx = −½ v′(x) dt + dβ, they give it as p(x) = exp(−v(x)/q)/Z.

## The Ornstein–Uhlenbeck case

For the Ornstein–Uhlenbeck process dx = −λx dt + dβ, v(x) = λx² and [Särkkä and Solin (2019)](#ref-SS2019a) find the stationary density proportional to exp(−λx²/q), a normal with mean 0 and variance q/(2λ). In the panel's notation, with f = −θX and g = σ, q = σ² and the variance is σ²/(2θ).

For the defaults, θ = 0.5 and σ = 0.3, the stationary law is Normal(0, 0.09), with standard deviation 0.3. **Fokker-Planck Density** overlays exactly this density, written as exp(−x²/(σ²/θ))/√(πσ²/θ), on the normalised histogram of X(1 000) from the default process.

## The horizon

At a finite T, the law of X(T) still depends on X₀. For the Ornstein–Uhlenbeck process, the mean equation dm/dt = −λm of [Särkkä and Solin (2019)](#ref-SS2019a) gives m(t) = x₀ exp(−λt), and **Convergence in N** prints that value and the exact standard deviation at T.

The tooltip of **Time span T** recommends a long horizon, such as 1 000, for this tab. With the default T = 20 and θ = 0.5, x₀ exp(−θT) = exp(−10), about 4.5 · 10⁻⁵.

## Ensemble or one long path

The tab takes one value from each of N independent paths, so the N terminal values are independent and identically distributed, each with the law of X(T). The panel's notebook on the tab describes the same route: the stationary distribution estimated from the terminal values of a long-horizon ensemble.

The decision row names the long-run equilibrium of ergodic systems and the Fokker–Planck steady state as the uses of the tab.

## Beyond the Ornstein–Uhlenbeck process

For other drifts and diffusions, the stationary density may have no closed form. [Särkkä and Solin (2019)](#ref-SS2019a) refer to Gardiner for more general stationary solutions, and list numerical discretisation of the Fokker–Planck–Kolmogorov equation among the approximation methods for nonlinear SDEs.

The ensemble estimate needs no closed form of the density: the histogram of `terminal` is built from the paths alone. Repeating the tab with a longer **Time span T** and comparing the histograms shows whether the horizon is long enough.

## References

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md)
