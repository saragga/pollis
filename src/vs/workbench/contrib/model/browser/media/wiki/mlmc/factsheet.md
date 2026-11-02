# Multilevel Monte Carlo — Factsheet

Multilevel Monte Carlo writes an expected value as a sum of corrections between successively finer grids, and spends most of its samples where they are cheap. The panel runs the method through MultilevelEstimators.jl on two test problems with known answers, so that each run can be judged against the truth.

## What the Multilevel Monte Carlo Panel Does

| Item | Detail |
|---|---|
| Purpose | Estimate an expected value to a target root mean squared error (RMSE), and measure the rates that decide how much the levels save |
| Julia stack | MultilevelEstimators.jl for the estimator, SpecialFunctions.jl for the exact answer of **Random Integral**, Plots.jl for the figures |
| Tabs | **MLMC** and **MLQMC** |
| Input shape | No data: **Problem** picks a built-in test problem, and a problem of your own means editing `sample_fn` in the code |
| Printed results | Estimate, exact answer, error, estimated RMSE, tolerance, levels, samples per level, total cost |
| Key choice | **Relative Tolerance**, then **Max Level** |

## How the MLMC and MLQMC Tabs Differ

| Feature | **MLMC** | **MLQMC** |
|---|---|---|
| Method in the code | `MC()` | `QMC()` |
| Points on each level | Independent pseudo-random samples | Rank-1 lattice rule with independent random shifts |
| Source of the error estimate | Sample variance on each level divided by its sample count | Spread across the shifts on each level |
| Extra input | None | **n Shifts**, default 10 |
| Samples added per step | Computed from the optimal allocation formula | Points multiplied by 1.2 on the level with most variance per unit cost |

## Which Test Problems the Multilevel Monte Carlo Panel Offers

| **Problem** | Quantity | Level l | Exact answer | Theoretical alpha, beta, gamma |
|---|---|---|---|---|
| **Random Integral** | Integral of exp(X t) over [0, 1], with X ~ N(0, 1) | Midpoint rule with 2^l points | sqrt(pi/2) erfi(1/sqrt(2)) | 2, 4, 1 |
| **GBM Call Option** | Discounted European call under geometric Brownian motion | Euler-Maruyama with 2^l time steps | Black-Scholes price | 1, 1, 1 |

Level 0 of each problem uses one grid point or time step.

## What the Inputs of the Multilevel Monte Carlo Panel Default To

| Input | Default | Role |
|---|---|---|
| **Relative Tolerance** | 0.005 | Target RMSE as a fraction of the exact answer |
| **Max Level** | 10 | Finest level the estimator may add |
| **n Shifts** | 10 | Random shifts of the lattice rule, **MLQMC** only |
| **Seed** | 1 | Starting point of the random numbers |
| **Spot (S0)**, **Strike (K)** | 100.0, 100.0 | Option terms, **GBM Call Option** only |
| **Rate (r)**, **Volatility**, **Maturity (T)** | 0.05, 0.2, 1.0 | Model terms, **GBM Call Option** only |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
