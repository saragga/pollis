# SDE Ensemble Analysis: Factsheet

The panel's equation, analyses, inputs, solvers and actions at a glance.

## The equation

| Item | Setting |
|---|---|
| Equation | dX = f(X, t) dt + g(X, t) dW, scalar, Itô |
| Default drift | f = −0.5 X |
| Default diffusion | g = 0.3, additive noise |
| Default process | Ornstein–Uhlenbeck, mean reversion to 0 at rate 0.5 |
| Stationary law of the default | Normal with mean 0 and variance 0.3² / (2 · 0.5) = 0.09 |
| Package | StochasticDiffEq.jl, part of DifferentialEquations.jl by [Rackauckas and Nie (2017)](#ref-RN2017a) |

The stationary law of the Ornstein–Uhlenbeck process, a normal with variance q/(2λ) for the equation dx = −λx dt + dβ with diffusion constant q, is derived by [Särkkä and Solin (2019)](#ref-SS2019a).

## Analyses

| Tab | Horizon | Output |
|---|---|---|
| **Path Statistics** | **Time span T** | Mean and standard deviation of X(t) on 200 times |
| **First Passage Time** | 1 000, fixed | Number of paths that crossed **Threshold**, mean and standard deviation of their crossing times |
| **Invariant Distribution** | **Time span T** | Histogram of X(T) with 50 bins, mean and standard deviation of X(T) |

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **Drift f(X,t)** | −0.5*X | Julia expression in X, p and t |
| **Diffusion g(X,t)** | 0.3 | A constant for additive noise, or an expression in X for multiplicative noise |
| **Initial state X0** | 1.0 | Starting value of every path |
| **Time span T** | 20.0 | End time; not used by **First Passage Time** |
| **Threshold** | 0.0 | Level at which a path stops, **First Passage Time** only |
| **Solver** | SRIW1 | SRIW1, EM, LambaEM or RKMil |
| **Trajectories N** | 500 | Number of independent paths |
| **Step size dt** | 0.01 | Fixed step, for EM and RKMil only |

## Solvers

| Solver | Step | Strong order | Note in the documentation |
|---|---|---|---|
| SRIW1 | Adaptive | 1.5 | Weak order 2.0, diagonal or scalar Itô SDEs |
| EM | Fixed | 0.5 | Euler–Maruyama, Itô sense |
| LambaEM | Adaptive | 0.5 | Euler–Maruyama with an adaptive error estimator; all forms of noise |
| RKMil | Fixed | 1.0 | Runge–Kutta Milstein; Itô by default; scalar and diagonal noise |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Fan Chart** | Mean path with mean ± 2 sd of the paths and mean ± 2 standard errors of the mean |
| Diagnose | **Convergence in N** | E[X(T)] and sd[X(T)] with standard errors for N = 50 to 1 000, and the exact Ornstein–Uhlenbeck moments when the drift is linear and the diffusion constant |
| Predict | **Quantile Bands** | 10th, 50th and 90th percentile paths |
| Compare | **Compare Noise Levels** | sd[X(t)] for constant diffusion 0.1, 0.3 and 0.6 with the same drift |
| Interpret | **Fokker-Planck Density** | Histogram of X(1000) for the default Ornstein–Uhlenbeck process against its stationary normal density |

The actions use SRIW1 with its default adaptive steps.

## Further reading

| Topic | Source |
|---|---|
| DifferentialEquations.jl | [Rackauckas and Nie (2017)](#ref-RN2017a) |
| SDEs, Fokker–Planck–Kolmogorov, numerical methods, first exit times | [Särkkä and Solin (2019)](#ref-SS2019a) |
| The theory of SDEs and diffusions | [Øksendal (2003)](#ref-Oks2003a) |

The DifferentialEquations.jl documentation covers the ensemble interface, `ContinuousCallback` and the SDE solvers, with the strong and weak order of each and the forms of noise it handles.

## References

<a id="ref-RN2017a"></a>Rackauckas, C., & Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

<a id="ref-Oks2003a"></a>Øksendal, B. (2003). *Stochastic Differential Equations: An Introduction with Applications* (6th ed.). Springer. [doi:10.1007/978-3-642-14394-6](https://doi.org/10.1007/978-3-642-14394-6)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
