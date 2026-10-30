# Diagnostics

## Estimate Over the Data
**Estimate Over the Data** draws the histogram, the kernel estimate with a rug of the observations, or the fitted density over a normalised histogram of the data. The first check is by eye: does the estimate follow the data's peaks and tails?

## Empirical Against Estimated CDF
**Empirical Against Estimated CDF** plots the empirical CDF of the data with the estimate's CDF dashed. CDFs are easier to compare than densities: a systematic gap, the estimate above the data in one region and below it in another, shows a misplaced mode or a tail that is too light or too heavy.

## Sensitivity to Tuning and Sampling
**Sensitivity to Tuning and Sampling** shows how much the answer depends on the choices made:
- **Histogram**: the data with 5, 20 and 50 bins.
- **Kernel Density**: half, the same and twice the bandwidth. Half shows noise; twice can merge two modes.
- **Parametric**: 200 bootstrap refits, with each parameter's standard error and 95% interval.
A feature that appears at every setting is real; one that appears at only one is probably not.

## Goodness of Fit and Tuning Rules
- **Histogram**: the number of bins by **Sturges**, **Scott** and **Freedman-Diaconis**, beside the current one. Sturges gives too few bins for large samples.
- **Kernel Density**: Silverman's rule against least-squares cross-validation. When they differ, as on bimodal data, cross-validation is usually closer.
- **Parametric**: a Kolmogorov-Smirnov test of the fitted distribution. Its p-value is too high, because the parameters were estimated from the same data: take a rejection seriously, but not an acceptance as proof.

## Bootstrap Parameter Intervals
**Bootstrap Parameter Intervals** gives, for univariate parametric fits, 95% percentile intervals from 1000 nonparametric and 1000 parametric bootstrap samples. When the two disagree, the family probably does not fit.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Estimate over the data | Follows the peaks | Misses a mode |
| CDF comparison | Curves overlap | Systematic gap |
| Tuning sensitivity | Features stable | Features come and go |
| KS test | Not rejected | Rejected |
| Bootstrap intervals | Narrow, both agree | Wide or disagreeing |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
