# Diagnostics

## Sample Against Distribution
**Sample Against Distribution** lays the histogram of 10,000 draws over the density, or bars over the probability mass. For multivariate distributions it shows the first two components; for matrix-variate ones, the mean next to one draw. The histogram should follow the curve, with random fluctuations largest where the bins hold fewest draws.

## Cumulative and Marginals
For univariate distributions, the **empirical CDF** of the sample against the exact CDF: the largest vertical gap between them is the Kolmogorov-Smirnov statistic. For multivariate ones, the histogram of each component; for matrix-variate ones, the distribution of the largest singular value.

## Sample Against Exact Moments
The theoretical moments next to those of the sample. The sample mean should be within a few standard errors (the standard deviation over sqrt(n)) of the exact mean; higher moments, skewness and kurtosis, converge much more slowly. Where a moment is undefined, as the Cauchy mean, the exact value is NaN and the sample value meaningless.

## Goodness of Fit
**Goodness of Fit** makes three checks:
- **Support**: every draw must lie in the support of the distribution. A draw outside it is a bug.
- **Negative log-density against entropy**: the average of -log pdf(d, x) over the draws estimates the entropy of d, and the two should agree.
- **Kolmogorov-Smirnov test** (continuous univariate distributions): a p-value that is not small means the sample is consistent with d. Remember that about one run in twenty gives p below 0.05 even when the sampler is right.

## Error Against Sample Size
**Error Against Sample Size** measures how far the sample median (univariate) or mean (multivariate) is from the exact value for n = 10, 100, 1,000 and 10,000. Each tenfold increase in n should divide the error by about sqrt(10), roughly 3.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Histogram vs density | Follows the curve | Systematic gaps or shifts |
| Empirical vs exact CDF | Close everywhere | A large gap |
| Sample mean | Within a few standard errors | Far off (or no mean exists) |
| Support | All draws inside | Any draw outside |
| Negative log-density vs entropy | Agree | Disagree |
| KS p-value | Not small | Small on repeated seeds |
| Error vs n | Falls about 3x per 10x | Falls more slowly |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
