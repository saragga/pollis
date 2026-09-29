# Diagnostics

Descriptive statistics are only as good as the data behind them. These checks tell you whether a summary can be taken at face value.

## Missing Values
The **Missing Values** action reports the count and the percentage of missing entries. A few percent is usually harmless; more than that, or missingness concentrated in one group, can bias every summary.

## Outliers
The **Outlier Check** flags values outside the Tukey fences, Q1 - 1.5 IQR and Q3 + 1.5 IQR. A few flagged values in a large sample are expected; many, or extreme ones, mean the mean and standard deviation are unreliable. Check each flagged value: is it a recording error or a genuine extreme?

## Mean Against Median
When the mean and the median are far apart (relative to the standard deviation), the distribution is skewed or has outliers. Report the median and the IQR instead of the mean and the standard deviation.

## Shape Estimates Need Data
Skewness and kurtosis are unstable in small samples: below about 50 observations, treat them as rough indications only. Look at a **Violin Plot** as well.

## Correlation Checks
- **Plot before you trust r.** Very different scatter plots (a line, a curve, a cloud with one outlier) can share the same Pearson correlation.
- **Constant columns** have zero standard deviation and give `NaN` correlations.
- **Pearson and Spearman disagree** when the relation is curved or driven by a few extreme points.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Missing values | Few, scattered | Many, or concentrated in one group |
| Outlier Check | Few mild flags | Many or extreme values |
| Mean against median | Close | Far apart |
| Pearson against Spearman | Similar | Very different |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Summary Stats](summary-stats.md)
