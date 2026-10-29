# Assumptions

## All Tests
- **Independent observations**, within and between samples, except where the test is built for pairs (paired t-test, Wilcoxon Signed-Rank, Sign test) or for series (the time series tests).
- **A hypothesis fixed in advance.** Choosing the test, the alternative or the subset of data after seeing them makes the p-value too small.
- **A random sample** from the population the conclusion is about.

## Parametric Tests
- **Normality.** t-tests, z-tests, the F-test and ANOVA assume normal data within each sample. The tests of means are fairly robust to it in large samples (the central limit theorem); the F-test of variances is not robust at all.
- **Equal variances** for the pooled two-sample t-test and for ANOVA. The Welch t-test drops it.
- **A known standard deviation** for the z-test; with an estimated one, use the t-test.
- **Large enough expected counts** for the Chi-Squared and related tests: a common rule is at least 5 in every category; below that, use an exact test.

## Nonparametric Tests
- **Continuous data** for the rank tests: ties weaken them, and the reported p-value is then approximate.
- **Same shape** for Mann-Whitney U and Kruskal-Wallis to be read as tests of the median: in general they test whether one sample tends to give larger values than another.
- **Exchangeability** for the Permutation test: under the null, the labels could be swapped without changing the distribution.
- **A fully specified distribution** for the one-sample Kolmogorov-Smirnov test; with parameters estimated from the same data, its p-value is too large.

## Time Series Tests
- **Correct lags.** Augmented Dickey-Fuller, Ljung-Box, Box-Pierce and Breusch-Godfrey depend on the number of lags; too few miss dependence, too many lose power.
- **The right deterministic terms** for Augmented Dickey-Fuller: none, a constant, or a constant and a trend. A trending series tested without a trend looks like a unit root.
- **A regression with an intercept and no lagged response** for Durbin-Watson; with lagged responses, use Breusch-Godfrey.
- **Nested models** for Clark-West; Diebold-Mariano is for non-nested ones.

## Multivariate Tests
- **Multivariate normality** for Hotelling's T-squared and the Equality of Covariance test, and more observations than variables in each group.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
