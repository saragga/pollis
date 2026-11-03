# SDE Ensemble Analysis: First Passage Time

The **First Passage Time** tab runs every path until it reaches **Threshold**, stops it there with a callback, and summarises the crossing times of the paths that reached the level before the horizon.

## The first passage time

For a path started at X₀, the first passage time is the first time t at which X(t) equals the threshold. With the defaults, X₀ = 1 and **Threshold** = 0, it is the time the Ornstein–Uhlenbeck process takes to reach its long-run mean for the first time. The tooltip calls it the time to reach the threshold from X₀.

[Särkkä and Solin (2019)](#ref-SS2019a) use the related first exit time Tₑ of the process from a domain, the first time the path leaves it, and compute expectations over the exit points by simulating N paths from the starting point until their first exit time. A threshold on a scalar process is the boundary of a half-line.

## The callback

```
condition(X, t, integ) = X - threshold
affect!(integ)         = terminate!(integ)
cb = ContinuousCallback(condition, affect!)
```

The DifferentialEquations.jl documentation describes `ContinuousCallback` as a callback whose condition is a continuous function, triggered when the function evaluates to 0, a hitting that can happen within an integration step and that the solver must detect and adjust the step to.

`terminate!` ends the path at the event, so the last time point of each solution is its crossing time.

## Detection within a step

The documentation explains that the condition is checked at `interp_points` interpolated points within each step, 10 by default, and at the end points, and that a different sign at any of them triggers the callback. The `rootfind` option then locates the event: with the default, `LeftRootFind`, the solution is backtracked to the point where the condition is 0, and the left limit of the root is used if the solution is not exact.

The condition `X - threshold` changes sign whichever side the path comes from, so the same code serves a threshold under X₀, as in the default, or over it.

## Censoring at the horizon

The problem runs to t = 1 000. Paths that have not crossed by then end at the horizon and are flagged as censored:

```
hit = [sol.t[end] < 1000.0 for sol in ens]
fpt = [sol.t[end] for sol in ens][hit]
```

The code prints the number of crossings out of N and the mean and standard deviation of the crossing times; the comment marks them as conditional on crossing before the horizon. The tooltip adds that for the default process, a level far outside the stationary spread of sd 0.3 is almost never reached, and every path is then censored.

## The distribution of crossing times

`fpt` holds one crossing time per crossing path, an i.i.d. sample from the distribution of the first passage time, conditional on crossing before 1 000. A histogram or empirical distribution function of `fpt` shows its shape; the mean and standard deviation summarise it.

The panel's decision row names reliability, exit problems and threshold-crossing events as the uses of the tab. [Särkkä and Solin (2019)](#ref-SS2019a) illustrate exit times with Ornstein–Uhlenbeck processes started 100 times from each point of a 50 × 50 grid and simulated with the exact transition density until they hit a side of the unit square; the exit points give a Monte Carlo solution of an elliptic partial differential equation.

## Solver and noise

The tab uses the selected **Solver**, and **Step size dt** for EM and RKMil. The first passage time is a functional of the path up to the crossing; [Särkkä and Solin (2019)](#ref-SS2019a) distinguish strong approximations, of the paths, from weak approximations, of the distribution of the state.

The bullets of the panel note that the callback gives the first passage times without post-processing of the paths.

## References

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [Invariant Distribution](invariant.md)
