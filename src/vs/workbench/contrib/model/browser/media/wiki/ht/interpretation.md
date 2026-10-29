# Interpretation

## The p-Value
The probability, if the null hypothesis were true, of a test statistic at least as extreme as the one observed. A p-value of 0.03 means such a result would occur about 3 times in 100 under the null. It is **not** the probability that the null is true, and **not** the probability that the result is due to chance.

## The Decision
**Decision at Common Levels** compares the p-value with the 10%, 5% and 1% levels. Rejecting at level alpha means accepting a probability alpha of rejecting a true null (a **type I error**). Retaining the null is not accepting it: the data are consistent with it, and possibly with many alternatives too (a **type II error** if the null is false).

## One-Sided and Two-Sided
A two-sided test asks whether the parameter differs from the null value in either direction; a one-sided test asks about one direction only and has half the p-value when the effect goes that way. Choose the side before seeing the data.

## Confidence Intervals
A 95% confidence interval holds the values of the parameter that a two-sided test at 5% would not reject. It shows both the size of the effect and its uncertainty, which a p-value alone hides. The **Bootstrap Confidence Interval** gives one without normality; **Bootstrap Interval Methods** compares several kinds.

## Effect Size
**Effect Size** reports how large the difference is in standard-deviation units: Cohen's d for one sample, Hedges' g for two, eta-squared (the share of variance explained by the groups) for several. Conventional guides for d are 0.2 small, 0.5 medium and 0.8 large, but what matters is the size in the units of the problem. With a large sample, a tiny effect is significant; with a small one, a large effect may not be.

## Reading the Families
- **Unit root** (Augmented Dickey-Fuller): the null is a unit root, so rejecting supports stationarity.
- **Autocorrelation** (Ljung-Box, Box-Pierce, Breusch-Godfrey): the null is no autocorrelation, so rejecting means the residuals still contain structure. Durbin-Watson near 2 means none at lag 1; well below 2, positive autocorrelation.
- **Normality** (Shapiro-Wilk, Jarque-Bera, Anderson-Darling): the null is normality, so rejecting is evidence against it.
- **Forecasts** (Diebold-Mariano, Clark-West): the null is equal accuracy; the sign of the statistic tells which model forecasts better.

## Many Tests
When several tests are run, some will reject by chance. Adjust the level (Bonferroni: divide it by the number of tests), or report all the tests that were run.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
