# Assumptions

## The Sample Represents the Population
The nonparametric bootstrap uses the empirical distribution of the data as if it were the population. This works when the sample is **large enough to show the population's shape**; with a handful of observations, the tails are missing and the intervals are too narrow.

## Resampling Matches the Data Generation
- **Nonparametric**: the observations are **independent and identically distributed**. Clustered data need clusters resampled, not observations; dependent series need a time-series scheme.
- **Parametric**: the **fitted distribution is right**. If the data are skewed and the fit is Normal, the replicates are symmetric and the intervals wrong.
- **Time series**: the series is **stationary**, or close to it; the maximum entropy bootstrap is more tolerant of trends than block methods, but still assumes the dependence carries over to the replicates.

## The Statistic Is Smooth
The bootstrap works for statistics that change smoothly with the data: means, standard deviations, regression coefficients, and (less well) medians. It fails for the **sample maximum or minimum**, and for statistics on the boundary of their range.

## Enough Replicates
- About **1,000** replicates are enough for a standard error.
- About **2,000 to 10,000** for percentile, basic and BCa intervals, which depend on the tails of the replicates.
- The studentised interval needs a **nested bootstrap** of the standard error inside each replicate (the panel's Inner Replicates, often 50 to 200), which multiplies the cost.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
