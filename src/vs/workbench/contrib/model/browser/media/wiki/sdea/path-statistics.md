# SDE Ensemble Analysis: Path Statistics

The **Path Statistics** tab simulates **Trajectories N** paths of the SDE up to **Time span T** and computes, on a grid of 200 times, the mean and the standard deviation of X(t) across the paths.

## The code

```
prob = SDEProblem(f, g, X0, (0.0, T))
ens  = solve(EnsembleProblem(prob), SRIW1(), EnsembleThreads(), trajectories=N)
t_grid    = range(0.0, T, length=200)
mean_path = [mean(s(t) for s in ens) for t in t_grid]
std_path  = [std(s(t) for s in ens) for t in t_grid]
```

With a fixed-step solver, EM or RKMil, the call also passes `dt`. `s(t)` evaluates each solution at the grid times by interpolation, so the adaptive solvers, whose steps differ from path to path, still give values on a common grid.

## The ensemble interface

The DifferentialEquations.jl documentation introduces `EnsembleProblem` for Monte Carlo simulations, solving with a set of initial conditions, and parameter searches: a template problem is solved `trajectories` times, optionally modified for each trajectory. `EnsembleThreads()`, the default ensemble algorithm, uses multithreading on one computer; `EnsembleDistributed()` uses `pmap` over Julia processes and is recommended when each trajectory takes at least about a millisecond.

[Rackauckas and Nie (2017)](#ref-RN2017a) describe the same functionality as distributing the N solves automatically across multiple nodes of a cluster.

## Mean and variance

For an equation with linear drift, [Särkkä and Solin (2019)](#ref-SS2019a) derive closed differential equations for the mean m(t) and variance P(t); for the Ornstein–Uhlenbeck process dx = −λx dt + dβ, they are dm/dt = −λm and dP/dt = −2λP + q.

They add that for nonlinear SDEs the mean and covariance equations are often not closed: the mean and covariance alone do not determine the expectations on the right-hand side, as in their sine diffusion example. The ensemble estimates E[X(t)] and sd[X(t)] for any drift and diffusion the inputs define.

## Summaries in DifferentialEquations.jl

The documentation lists analysis functions for ensembles: `timeseries_point_mean`, `timeseries_point_median`, `timeseries_point_quantile` and `timeseries_point_meanvar` at given times, among others, and `EnsembleSummary`, which builds a mean and variance summary with quantile bounds, 0.05 and 0.95 by default, and has a plot recipe.

The panel computes the mean and standard deviation directly from the interpolated paths, and **Fan Chart** and **Quantile Bands** draw the corresponding bands.

## Additive and multiplicative noise

With the default additive noise, g = 0.3, the spread of the paths grows from 0 and levels off as the mean reversion balances the noise. With multiplicative noise, such as g = 0.2*X, the diffusion depends on the state, and the tooltip of **Diffusion g(X,t)** gives that expression as its example.

For the geometric Brownian motion dN = rN dt + αN dB, [Øksendal (1998)](#ref-Oks1998a) derives the Itô solution N₀ exp((r − ½α²)t + αB), and shows that the Stratonovich interpretation of the same equation gives N₀ exp(rt + αB). He notes that the two interpretations coincide when the diffusion does not depend on x, as with additive noise; the panel solves the Itô equation.

**Compare Noise Levels** shows the effect of the diffusion constant on sd[X(t)] for the current drift, with σ = 0.1, 0.3 and 0.6.

## Reading the output

The code leaves `mean_path` and `std_path` as vectors over `t_grid`; **Fan Chart** plots them with the bands of ±2 standard deviations and ±2 standard errors. The standard deviation across paths estimates the spread of X(t) and does not shrink with N; the standard error of the mean, sd/√N, does.

The decision row of the panel gives the purpose of the tab as characterising trajectory uncertainty over time, with mean and variance envelopes.

## References

<a id="ref-Oks1998a"></a>Øksendal, B. (1998). *Stochastic Differential Equations: An Introduction with Applications* (5th ed.). Springer. [doi:10.1007/978-3-662-03620-4](https://doi.org/10.1007/978-3-662-03620-4)

<a id="ref-RN2017a"></a>Rackauckas, C., & Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
