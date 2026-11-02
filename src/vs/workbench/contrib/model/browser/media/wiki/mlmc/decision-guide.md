# Multilevel Monte Carlo — Decision Guide

The first decision is whether a hierarchy of grids exists at all. The next are which sampler to use on each level and how strict a tolerance the budget allows.

## Which Multilevel Monte Carlo Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| First look at the method and its rates | **MLMC** | Independent samples, whose rates the theorem describes directly |
| Non-smooth integrand or many active inputs | **MLMC** | Lattice points may gain little when the integrand has kinks and no leading coordinates |
| Smooth integrand with few important inputs | **MLQMC** | Lattice points can reduce the error per level faster than independent samples |
| A sample variance with few assumptions is needed | **MLMC** | Thousands of samples can inform each variance, against **n Shifts** replicates |

## When Multilevel Monte Carlo Is Worth Using

The method pays when a quantity is approximated on a family of grids or step sizes, cost grows with resolution, and neighbouring levels can share their randomness. With no such hierarchy, there is nothing to telescope. With a cheap and exact sampler, plain Monte Carlo is the simpler answer. The gain also shrinks at loose tolerances, where a coarse grid may already be fine enough.

## How to Choose the Relative Tolerance of a Multilevel Run

**Relative Tolerance** is a fraction of the exact answer, and sets the target RMSE. Halving it makes a run cost about four times as much in the regime beta > gamma, and more in the others. Start with the default of 0.005, read the cost, and tighten it from there. **Cost Forecast** gives a first figure before a long run. Very small values need more levels too, so raise **Max Level** at the same time.

## How to Set Max Level in the Multilevel Panel

Keep **Max Level** high enough to be unused: a run that stops at L = **Max Level** may have left too much bias, and **Levels Used** warns of it. The main estimator keeps the package's minimum of level 2, and the package's argument check rejects a smaller maximum, so use at least 2. On **MLQMC** with **GBM Call Option**, level l needs 2^l lattice coordinates and the package's default generator offers 3600, so stay at 11 or under.

## How Many Shifts to Use in the MLQMC Tab

**n Shifts** sets the number of independent replicates behind the error estimate of **MLQMC**. The package recommends between 10 and 30, and the panel defaults to 10. More shifts steady that estimate and cost proportionally more, as each shift evaluates all the points on the level. Fewer than 10 gives an erratic error estimate, which then steers both the allocation and the stopping rule.

## How Multilevel Monte Carlo Compares with Other Variance Reduction Methods

Control variates and importance sampling reduce variance at one fixed grid, and leave the bias unchanged, so they work with the multilevel idea rather than against it. A better discretisation raises beta: the Milstein scheme, not offered in the panel, is the usual step for path simulation, and it can move a problem to the cheap regime. Plain quasi-Monte Carlo at one fine level needs the integrand to be smooth in a very high dimension, while **MLQMC** spreads the work across levels.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Quasi-Monte Carlo Extension](qmc-extension.md)
