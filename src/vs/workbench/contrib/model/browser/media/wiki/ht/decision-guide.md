# Decision Guide

| Question | Data | Test | Why |
|---|---|---|---|
| Is the mean equal to a value? | One sample | **One-Sample t-test**; **Wilcoxon Signed-Rank** or **Sign** test without normality | t for normal data; ranks or signs otherwise |
| Do two means differ? | Two independent samples | **Welch t-test**; **Mann-Whitney U** without normality | Welch needs no equal variances |
| Do paired measurements differ? | Two samples, paired | **One-Sample t-test** or **Wilcoxon Signed-Rank** on the differences | Pairing removes the between-subject variation |
| Do several means differ? | Three or more samples | **One-Way ANOVA**; **Kruskal-Wallis** without normality | One test instead of many pairwise ones |
| Are the variances equal? | Two or more samples | **Levene's** or **Brown-Forsythe**; **Fligner-Killeen** without normality | The F-test is too sensitive to non-normality |
| Do counts match expected proportions? | Counts per category | **Chi-Squared**; **Multinomial LR**, **Power Divergence** | Exact **Binomial** for two categories |
| Are two binary variables related? | A 2 x 2 table | **Fisher Exact** | Exact, valid with small counts |
| Does a sample follow a distribution? | One sample | **Kolmogorov-Smirnov**, **Anderson-Darling**; **Shapiro-Wilk** for normality | Anderson-Darling weighs the tails more |
| Do two samples come from one distribution? | Two samples | **KS Two-Sample**, **Wald-Wolfowitz** | Sensitive to any difference, not only in location |
| Does a series have a unit root? | A series | **Augmented Dickey-Fuller** | Choose its lags and trend |
| Are the residuals autocorrelated? | A series or a fitted model | **Ljung-Box**; **Breusch-Godfrey** for a regression | Durbin-Watson only for lag 1 without lagged responses |
| Is one forecast better? | Two error series | **Diebold-Mariano**; **Clark-West** for nested models | Diebold-Mariano is undersized for nested models |
| Do mean vectors differ? | Data matrices | **Hotelling's T-squared** | One test for all variables together |

## Decision Flow

1. **What is the claim?** A mean, a variance, a proportion, a distribution, a dependence or a forecast comparison: this picks the row.
2. **How many samples, and are they paired?**
3. **Do the assumptions hold?** Run Check Test Assumptions. If normality fails in a small sample, use the nonparametric test; if variances differ, use Welch.
4. **Unsure?** Run the Permutation p-Value: it needs only exchangeability.
5. **Report the effect size and an interval** with the p-value.

## Rules of Thumb
- **Prefer Welch** to the pooled t-test: it loses little when variances are equal and protects when they are not.
- **Plot before testing**: a test on data with outliers or two clusters answers the wrong question.
- **Significant is not important**: read the effect size.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
