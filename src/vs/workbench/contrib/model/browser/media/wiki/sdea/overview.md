# SDE Ensemble Analysis: Overview

An ensemble simulates many independent paths of a stochastic differential equation and estimates, from the paths, how the solution is distributed: its mean and spread over time, the time it takes to reach a level, and its long-run distribution. The panel builds the ensemble with DifferentialEquations.jl.

## Stochastic differential equations

The panel's equation is the scalar Itô SDE

dX = f(X, t) dt + g(X, t) dW, X(0) = X₀,

with drift **Drift f(X,t)**, diffusion **Diffusion g(X,t)** and a Brownian motion W. The default, f = −0.5 X and g = 0.3, is an Ornstein–Uhlenbeck process: the drift pulls X back towards 0, and the noise keeps it moving.

[Särkkä and Solin (2019)](#ref-SS2019a) give the solution of the Ornstein–Uhlenbeck equation dx = −λx dt + dβ as x(t) = exp(−λt) x₀ + ∫₀ᵗ exp(−λ(t − τ)) dβ(τ), and use the process as a running example for moments, stationary distributions and numerical methods.

## Ensembles

[Rackauckas and Nie (2017)](#ref-RN2017a) present DifferentialEquations.jl as a package covering, among others, ordinary, stochastic, delay and hybrid differential equations and jump diffusions, with a unified interface to solve and analyse them, and methods for parallel Monte Carlo simulations.

In the panel's code, an `SDEProblem` holds f, g, X₀ and the time span, and `EnsembleProblem` wraps it so that `solve` runs **Trajectories N** independent paths. The DifferentialEquations.jl documentation describes `EnsembleThreads()`, the panel's choice, as multithreading on a single computer with shared memory, the fastest option when the trajectories are quick.

## Three analyses

| Tab | Quantity | From the ensemble |
|---|---|---|
| **Path Statistics** | E[X(t)], sd[X(t)] | Mean and standard deviation across paths on a grid of 200 times |
| **First Passage Time** | The time to reach **Threshold** | The time at which a callback stops each path |
| **Invariant Distribution** | The stationary density | A histogram of the terminal values X(T) |

[Särkkä and Solin (2019)](#ref-SS2019a) derive the Fokker–Planck–Kolmogorov equation, the partial differential equation that the probability density of the solution satisfies. When the interest is in sample paths and their statistics, they write, one should use the numerical simulation methods; the three tabs take that route.

## Solvers

**Solver** selects one of four methods of StochasticDiffEq.jl:

| Solver | Step | Strong order |
|---|---|---|
| SRIW1 | Adaptive | 1.5 |
| EM, Euler–Maruyama | Fixed, **Step size dt** | 0.5 |
| LambaEM | Adaptive | 0.5 |
| RKMil, Milstein | Fixed, **Step size dt** | 1.0 |

The orders are those of the DifferentialEquations.jl documentation, which gives SRIW1 a weak order of 2.0 for diagonal or scalar Itô SDEs. [Särkkä and Solin (2019)](#ref-SS2019a) explain that the strong order concerns the approximation of paths, the weak order that of moments and distributions.

## The panel in Julia

```
prob = SDEProblem(f, g, X0, (0.0, T))
ens  = solve(EnsembleProblem(prob), SRIW1(), EnsembleThreads(), trajectories=N)
```

Each solution in `ens` can be evaluated at any time with `s(t)`; the documentation notes that every StochasticDiffEq.jl solver comes with a linear interpolation. **Path Statistics** uses it to put all the paths on one time grid, and **First Passage Time** adds a callback to the same `solve` call.

## References

<a id="ref-RN2017a"></a>Rackauckas, C., & Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
