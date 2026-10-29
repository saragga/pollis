# Hypothesis Testing — Factsheet

A **hypothesis test** measures the evidence in the data against a null hypothesis. It computes a **test statistic**, compares it with the distribution the statistic would have if the null were true, and reports the **p-value**. A small p-value says the data would be surprising under the null; it does not say how large or important the departure is.

| | |
|---|---|
| **Purpose** | Decide whether the data are consistent with a stated claim about means, variances, proportions, distributions, dependence or forecasts |
| **Input** | One or more samples (vectors), counts in categories, a 2 x 2 table, a series in time order, a fitted regression model, forecast errors or a data matrix, depending on the test |
| **Core packages** | [HypothesisTests.jl](https://github.com/JuliaStats/HypothesisTests.jl); [Bootstrap.jl](https://github.com/juliangehring/Bootstrap.jl) for the intervals |
| **Families** | Parametric, Nonparametric, Time Series, Multivariate |
| **Output** | The test statistic, the p-value, a confidence interval where the test has one, and the decision at chosen levels |
| **Key choice** | A parametric test (more power when its assumptions hold) or a nonparametric one (valid under weaker assumptions) |

## When to Use

- You have a **specific claim to check**, stated before seeing the result.
- You need a **yes-or-no decision** with a controlled error rate: reject the null at a chosen level.
- You want to check an **assumption of another model**: normality of residuals, constant variance, no autocorrelation, a unit root.

## What It Is Not

A test does not tell you the size of an effect, the probability that the null is true, or whether the result matters in practice. Failing to reject is not evidence that the null is true: a small sample may simply lack the power to see a real difference. Running many tests and reporting the significant ones inflates the false-positive rate.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
