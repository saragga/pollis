# Overview

The Hypothesis Testing panel runs **hypothesis tests**: it asks whether the data are consistent with a stated claim, the **null hypothesis** (two means are equal, a series has a unit root, the residuals are not autocorrelated), and reports a **p-value**, the probability of a result at least as extreme as the one observed if the null were true. All tests come from HypothesisTests.jl.

## Parametric
Tests that assume a distribution for the data, usually the normal. The **t-tests** (one-sample, two-sample with pooled variance, Welch with separate variances) and **z-tests** compare means; the **F-test** compares two variances; **One-Way ANOVA** compares the means of three or more groups; **Levene's** and **Brown-Forsythe** test equal variances across groups. For counts in categories, the **Chi-Squared**, **Power Divergence** and **Multinomial LR** tests compare observed with expected frequencies.

## Nonparametric
Tests that need no distributional form, usually because they work on ranks, signs or relabellings. **Wilcoxon Signed-Rank** and the **Sign** test are the one-sample counterparts of the t-test; **Mann-Whitney U** compares two samples, **Kruskal-Wallis** several. **Kolmogorov-Smirnov** compares a sample with a distribution, or two samples with each other; **Anderson-Darling** compares a sample with a distribution, weighing the tails more. **Shapiro-Wilk** tests normality, **Fligner-Killeen** equal spreads, and the **Wald-Wolfowitz** runs test whether two samples are mixed when sorted together, as they would be if they came from one distribution. The **Binomial** and **Fisher Exact** tests are exact tests for proportions and 2 x 2 tables; the **Permutation** test compares any statistic of two samples with its value under every relabelling.

## Time Series
Tests on series in time order and on regression residuals. **Augmented Dickey-Fuller** tests for a unit root; **Ljung-Box**, **Box-Pierce**, **Durbin-Watson** and **Breusch-Godfrey** test for autocorrelation; **Jarque-Bera** tests normality from skewness and kurtosis; **White** tests for heteroskedasticity. **Diebold-Mariano** and **Clark-West** compare the forecast errors of two models, Clark-West when one model nests the other.

## Multivariate
Tests on several variables at once: **Hotelling's T-squared** for mean vectors (the multivariate t-test), **Equality of Covariance** (Bartlett's test) for the covariance matrices of two groups, and the **Correlation** test for a correlation coefficient.

## Common Workflow

1. **State the null hypothesis** and the alternative before looking at the result, and choose the test that matches them and the data.
2. **Plot the Samples** and the **Box Plots**: location, spread, skew and outliers.
3. **Check Test Assumptions** and the **Normal Q-Q Plots**; if normality or equal variances fail, prefer a Welch or a nonparametric test.
4. Run the test, and compare it with its counterpart in **Parametric vs Nonparametric** or the **Permutation p-Value**.
5. Report the **Effect Size** and a **Bootstrap Confidence Interval**, not only the p-value.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
