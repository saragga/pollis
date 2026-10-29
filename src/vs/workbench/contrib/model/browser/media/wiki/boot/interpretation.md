# Interpretation

## Estimate, Bias and Standard Error
The **estimate** is the statistic on the original data. The **standard error** is the standard deviation of the replicates: how much the statistic would vary from sample to sample. The **bias** is the average replicate minus the estimate: how far, on average, the statistic tends to sit from its target.

## Bias Correction
**Bias Correction** subtracts the estimated bias: estimate minus bias, that is, twice the estimate minus the mean of the replicates. It reduces the bias but adds variance, and so is worth it only when the bias is large compared with the standard error. BCa corrects for bias inside the interval instead.

## Reading the Intervals
A 95% bootstrap interval is a range that would contain the true value in about 95% of repeated studies, if the bootstrap approximation holds. When the five intervals of the **Interval Plot** agree, the choice does not matter. When they differ, **Interval Choice** shows the reason:
- **z0**, the bias correction: the share of replicates below the estimate, on the normal scale. Zero when the bootstrap distribution is centred on the estimate.
- **a**, the acceleration: how fast the standard error changes with the parameter, from the jackknife skewness.
- **Skewness** of the replicates.
If z0 and a are close to zero and the skewness small, the percentile and normal intervals are fine; otherwise prefer BCa or studentised. See [Confidence Intervals](confidence-intervals.md).

## Width and Sample Size
**Width vs Sample Size** shows how the interval narrows as n grows, usually as 1/sqrt(n): halving the width takes four times the data.

## Comparing Schemes
**Compare Schemes** sets the schemes side by side on the same data. Balanced and antithetic sampling should give the same answer as basic sampling, with less Monte Carlo noise. A parametric bootstrap that differs much from the nonparametric one suggests the fitted distribution is wrong; a time-series bootstrap that differs much from basic resampling shows how much the dependence matters.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Confidence Intervals](confidence-intervals.md)
