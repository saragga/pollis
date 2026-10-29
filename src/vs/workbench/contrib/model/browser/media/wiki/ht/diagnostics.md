# Diagnostics

## Normality
**Check Test Assumptions** gives each sample's size, standard deviation and Jarque-Bera p-value. The **Normal Q-Q Plots** show the shape: points on the line support normality, an S-shape shows heavy or light tails, a curve shows skew. With small samples, normality tests have little power, so look at the plot; with large samples they reject trivial departures, and the tests of means are robust to them anyway.

## Equal Variances
Check Test Assumptions also runs **Levene's test**. If it rejects, or the standard deviations differ by more than a factor of about 2, use the **Welch t-test** instead of the pooled one; for several groups, a Welch-type ANOVA or **Kruskal-Wallis**.

## Outliers
The **Box Plots** show points beyond the whiskers. A few outliers can dominate a t-test or an F-test. Check whether they are errors; if they are real, a rank test or a test of medians is more robust than one of means.

## Robustness of the Conclusion
**Parametric vs Nonparametric** runs both kinds of test on the same samples. When they agree, the conclusion does not hinge on the assumptions; when the parametric test rejects and the rank test does not (or the other way round), an assumption is doing the work, usually normality or the effect of outliers. The **Permutation p-Value** needs only exchangeability, so it is a good referee.

## Power
**Power by Resampling** resamples the data at several sample sizes and reruns the test many times. The share of rejections estimates the power to detect an effect of the size observed. Low power at the current size means a non-significant result says little.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Normality | Q-Q points near the line | Strong curve or heavy tails, in a small sample |
| Equal variances | Levene's test not significant | Standard deviations differing by a factor of 2 or more |
| Outliers | None, or explained | A few points far from the rest |
| Robustness | Parametric and nonparametric agree | They disagree |
| Power | High at the current sample size | Low: a non-rejection is inconclusive |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
