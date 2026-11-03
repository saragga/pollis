# SDE Ensemble Analysis: Diagnostics

How to check an ensemble: the Monte Carlo error of its statistics, the agreement with exact results, the effect of the solver and step size, and the horizon.

## Monte Carlo error

Every ensemble statistic is an estimate from **Trajectories N** paths. **Fan Chart** shows both kinds of spread: mean ± 2 standard deviations of the paths, where individual paths lie, and mean ± 2 standard errors, sd/√N, the Monte Carlo uncertainty of the mean itself. The first band does not narrow as N grows; the second does.

The DifferentialEquations.jl documentation offers the same two choices in the plot recipe of `EnsembleSummary`: quantile bounds by default, or a Gaussian interval of 1.96 standard errors of the mean with `ci_type=:SEM`.

## Convergence in N

**Convergence in N** repeats the ensemble with 50, 100, 250, 500 and 1 000 paths and prints, for each, E[X(T)] and sd[X(T)] with their standard errors: sd/√N for the mean and sd/√(2(N − 1)) for the standard deviation.

When the drift is linear, −θX with θ > 0, and the diffusion a constant σ, the action detects an Ornstein–Uhlenbeck process and prints its exact moments at T, with the z-score (mean − exact mean)/standard error.

## Exact results

The exact moments come from the mean and variance equations of the Ornstein–Uhlenbeck process that [Särkkä and Solin (2019)](#ref-SS2019a) derive: dm/dt = −λm and dP/dt = −2λP + q, with m(0) = x₀ and P(0) = 0. Since the process is Gaussian, they note, the first two moments characterise the whole distribution of X(t).

**Fokker-Planck Density** compares the histogram of X(T) with the exact density of X(T) when the action detects an Ornstein–Uhlenbeck process: normal, with mean x₀ exp(−θT) and variance σ²(1 − exp(−2θT))/(2θ). [Särkkä and Solin (2019)](#ref-SS2019a) give this transition density of the Ornstein–Uhlenbeck process, with q = σ² the diffusion constant of the Brownian motion, and derive the stationary density from the stationary Fokker–Planck–Kolmogorov equation.

## Solver and step size

**Solver** and **Step size dt** change the numerical paths. For the fixed-step EM and RKMil, a smaller dt reduces the discretisation error; for the adaptive SRIW1 and LambaEM, the solver chooses the steps.

[Särkkä and Solin (2019)](#ref-SS2019a) illustrate the strong and weak orders with the Euler–Maruyama method: strong order 1/2 for the paths, weak order 1 for expectations, and strong order 1 when the noise is additive, since the Milstein correction then vanishes. Rerunning the panel with a different solver or a halved dt, and comparing the statistics with their standard errors, shows whether the discretisation affects them.

## The horizon

For **Invariant Distribution**, the terminal values approach the stationary law only for a long enough **Time span T**. The tab prints the mean and standard deviation of X(T); for the default process, the stationary values are 0 and 0.3.

**Fokker-Planck Density** draws X(T) at **Time span T**, so a long horizon brings its density close to the stationary one. For other equations, repeating **Invariant Distribution** with a longer T and comparing the histograms and moments shows whether the horizon matters.

## Censoring

**First Passage Time** prints how many paths crossed **Threshold** before the horizon of 1 000; the others are censored, and the mean and standard deviation of the crossing times are conditional on crossing. The tooltip notes that for the default process, a level far outside the stationary spread, sd 0.3, is almost never reached, so every path is then censored.

## References

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
