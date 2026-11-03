# SDE Ensemble Analysis: Interpretation

How to read the mean path and its bands, the quantile paths, the crossing times, the stationary histogram and the comparison of noise levels.

## Mean and spread over time

**Path Statistics** computes, on 200 equally spaced times from 0 to **Time span T**, the mean of X(t) across the paths and their standard deviation. The mean path is an estimate of E[X(t)], the standard deviation of sd[X(t)]; neither is a path that the process follows.

For the default Ornstein–Uhlenbeck process, [Särkkä and Solin (2019)](#ref-SS2019a) give the mean and variance as solutions of dm/dt = −λm and dP/dt = −2λP + q: the mean decays from X₀ towards 0 and the variance rises from 0 towards q/(2λ). **Convergence in N** prints both at T for comparison with the ensemble.

## The fan chart

**Fan Chart** draws the mean path with two ribbons. The wide one, mean ± 2 sd, shows where individual paths lie; the narrow one, mean ± 2 sd/√N, is the Monte Carlo uncertainty of the mean. The code's comment calls the second a confidence band for E[X(t)], and the first a spread of individual paths, not a confidence band.

**Quantile Bands** gives the spread of the paths from their percentiles instead of their standard deviation, and **Convergence in N** shows how the standard errors shrink as N grows.

## Quantile paths

**Quantile Bands** computes the 10th, 50th and 90th percentiles of X(t) across the paths at every time, and plots the median with the 10–90% band. As with the mean path, each quantile is taken time by time, so the band shows where 80% of the paths lie at each t, not a path.

The DifferentialEquations.jl documentation lists the same summaries among its ensemble analysis functions, such as `timeseries_point_quantile` and `timeseries_point_meanvar`, and builds `EnsembleSummary`, a mean and variance summary with quantile bounds, on them.

## Crossing times

**First Passage Time** prints the number of paths that reached **Threshold** before the horizon of 1 000, and the mean and standard deviation of their crossing times. The default starts at X₀ = 1 and stops at 0, the long-run mean of the process.

The mean and standard deviation are conditional on crossing before the horizon. When all the paths cross, they estimate the moments of the first passage time; when only some do, the crossing share itself is part of the result.

## The stationary histogram

**Invariant Distribution** prints the mean and standard deviation of X(T) across the paths, and the code builds a 50-bin histogram of the terminal values. For the default process, [Särkkä and Solin (2019)](#ref-SS2019a) give the stationary law as normal with mean 0 and variance q/(2λ), here 0.3²/(2 · 0.5) = 0.09, so a standard deviation of 0.3.

**Fokker-Planck Density** overlays that normal density on the normalised histogram of X(1 000) from the default process. A histogram that follows the curve shows the ensemble reproducing the stationary Fokker–Planck–Kolmogorov solution.

## Noise levels

**Compare Noise Levels** runs the ensemble with constant diffusions 0.1, 0.3 and 0.6 and the current drift, and plots the standard deviation of X(t) across paths for each. Its description notes that with a linear drift the mean path does not depend on the noise, so the spread is what changes.

For the Ornstein–Uhlenbeck process, the stationary variance q/(2λ) of [Särkkä and Solin (2019)](#ref-SS2019a) scales with q = σ², so the stationary standard deviation is proportional to σ: 0.1, 0.3 and 0.6 for the three runs with λ = 0.5.

## References

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
