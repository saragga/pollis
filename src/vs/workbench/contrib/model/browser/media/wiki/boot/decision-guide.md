# Decision Guide

## Which Model

| Data | Model | Why |
|---|---|---|
| Independent observations, no trusted distribution | **Nonparametric** | Uses only the data |
| Independent observations, a distribution that fits well | **Parametric** | Smoother replicates, better in small samples |
| A time series | **Time Series** (maximum entropy) | Keeps the dependence |
| Clustered or grouped data | Resample whole clusters | The clusters are the independent units |

## Which Scheme (Nonparametric)

| Scheme | When |
|---|---|
| **Basic** | The default |
| **Balanced** | Lower Monte Carlo error for the bias and the mean of the replicates |
| **Antithetic** | Lower variance for statistics that rise with the data (means, quantiles) |

## Which Interval

| Situation | Interval |
|---|---|
| Replicates close to normal | **Normal** or **Percentile** |
| Skewed replicates, or a biased statistic | **BCa** |
| A good estimate of the standard error in each replicate | **Studentised** |
| Quick look | **Percentile** |

## Decision Flow

1. **Are the observations independent?** If not, use the time-series model or resample clusters.
2. **Do you trust a distribution?** Parametric if so, nonparametric otherwise.
3. **Look at the replicates.** Symmetric: any interval. Skewed: BCa or studentised.
4. **Check the Monte Carlo error** with Required Replicates, and the **coverage** in a simulation like your data.

## Rules of Thumb
- **BCa by default** for intervals, with 2,000 replicates or more.
- **Resample the way the data were drawn.**
- **Distrust the bootstrap below about 20 observations**, and for the maximum or minimum.

## See Also
- [Overview](overview.md) · [Confidence Intervals](confidence-intervals.md) · [Resampling Schemes](resampling-schemes.md)
