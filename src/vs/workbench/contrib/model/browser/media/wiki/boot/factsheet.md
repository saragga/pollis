# Bootstrap Resampling — Factsheet

The **bootstrap** (Efron, 1979) treats the sample as a stand-in for the population. Drawing new samples from it, and recomputing the statistic on each, imitates what would happen if the study were repeated. The spread of these replicates estimates the standard error and the shape of the sampling distribution, for statistics whose distribution has no simple formula.

| | |
|---|---|
| **Purpose** | Standard errors, bias and confidence intervals for a statistic, without a formula for its distribution |
| **Input** | A sample (or a time series) and a statistic; the scheme, the number of replicates and the confidence level |
| **Core packages** | [Bootstrap.jl](https://github.com/juliangehring/Bootstrap.jl) |
| **Models** | Nonparametric (Basic, Balanced, Antithetic), Parametric (Normal, Log-Normal, Gamma, Exponential), Time Series (maximum entropy) |
| **Output** | The replicates, the estimate, its bias and standard error; percentile, basic, normal, BCa and studentised intervals |
| **Key choice** | How to resample: it must reproduce how the data were generated, independent draws or dependent ones |

## When to Use

- The statistic is a **median, a ratio, a correlation, a quantile** or anything else without a convenient standard error.
- The sample is **moderate** and the normal approximation is in doubt.
- You want to **check** a formula-based interval.

## What It Is Not

The bootstrap cannot create information: with very small samples the replicates take few distinct values and the intervals are too narrow. It fails for statistics that depend on the extremes (the maximum, the minimum), and resampling independent observations fails for dependent data. It is not a test of a hypothesis by itself; for that, see permutation tests.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
