# SDE Ensemble Analysis: Decision Guide

Which analysis answers which question, which solver to pick, and how many paths and how long a horizon to use.

## Choosing an analysis

| Question | Tab | Panel's description |
|---|---|---|
| How uncertain is the trajectory over time? | **Path Statistics** | Mean and variance envelopes |
| When does the process first reach a level? | **First Passage Time** | Reliability, exit problems, threshold-crossing events |
| Where does the process settle in the long run? | **Invariant Distribution** | Long-run equilibrium; Fokker–Planck steady state |

[Särkkä and Solin (2019)](#ref-SS2019a) describe simulation until the first exit time from a domain as a way to compute expected values over the exit points, and the stationary solution of the Fokker–Planck–Kolmogorov equation as the density for which ∂p/∂t = 0.

## Simulation or equations

[Särkkä and Solin (2019)](#ref-SS2019a) answer the question of which method to choose for a given SDE by saying that it depends on the SDE and on the application. If the interest is in sample paths and their statistics, they recommend the numerical simulation methods; if only the statistics are wanted, Gaussian approximations, linearisation, series expansions or numerical solutions of the Fokker–Planck–Kolmogorov equation are alternatives.

For linear SDEs, such as the default Ornstein–Uhlenbeck process, they derive the means, covariances, transition densities and steady-state solutions, which the panel's **Convergence in N** and **Fokker-Planck Density** use as references.

## Choosing a solver

| Situation | Solver | Source |
|---|---|---|
| Diagonal or scalar Itô noise, accuracy wanted | SRIW1, adaptive, strong order 1.5 | DifferentialEquations.jl documentation |
| A first attempt and a reference solution | EM, fixed step | [Särkkä and Solin (2019)](#ref-SS2019a) |
| Difficult noise, adaptivity wanted, any form of noise | LambaEM | DifferentialEquations.jl documentation |
| Strong order 1 with a fixed step, scalar or diagonal noise | RKMil | DifferentialEquations.jl documentation |

[Särkkä and Solin (2019)](#ref-SS2019a) write that the first attempt should probably always be the Euler–Maruyama method, which is easy to implement and gives a useful reference solution. The documentation recommends SOSRI for most Itô diagonal and scalar noise problems, SOSRA for additive noise, and high weak order solvers when only the distribution is of interest; those solvers can be put in place of the panel's choice in the code.

## How many paths

The Monte Carlo standard error of the mean is sd/√N: four times as many paths halve it. **Convergence in N** prints the standard errors for N from 50 to 1 000, and **Fan Chart** draws the band of ±2 standard errors.

For **First Passage Time**, only the paths that cross count, so the effective sample is the number of crossings that the tab prints. For **Invariant Distribution**, all N terminal values enter the 50-bin histogram and the moments.

## How long a horizon

| Tab | Horizon | Guidance |
|---|---|---|
| **Path Statistics** | **Time span T** | The window of interest |
| **First Passage Time** | 1 000 | Paths that have not crossed by then are censored |
| **Invariant Distribution** | **Time span T** | Long, such as 1 000, so that the paths reach the stationary law |

For the default process, the mean equation of [Särkkä and Solin (2019)](#ref-SS2019a) gives a decay as exp(−0.5 t), and **Convergence in N** prints the exact moments at T for any linear drift and constant diffusion.

## Further reading

[Särkkä and Solin (2019)](#ref-SS2019a) cover Itô calculus, the Fokker–Planck–Kolmogorov equation, linear SDEs, numerical simulation, filtering and parameter estimation, with exercises and algorithms; the author's copy is available online. [Rackauckas and Nie (2017)](#ref-RN2017a) describe DifferentialEquations.jl, and its documentation gives the ensemble interface, the callbacks and the full list of SDE solvers with their orders. Among the ensemble algorithms, it names EnsembleThreads, the default, as local multithreading, fastest when the trajectories are quick, and recommends EnsembleDistributed when each trajectory takes at least about a millisecond.

## References

<a id="ref-RN2017a"></a>Rackauckas, C., & Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
