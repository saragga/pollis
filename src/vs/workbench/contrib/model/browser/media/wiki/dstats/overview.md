# Overview

This webview covers the three questions asked of almost every data set: **what does one variable look like**, **how often does each value occur**, and **how do variables move together**.

## Summary
Central tendency (mean, median), spread (standard deviation, quartiles) and shape (skewness, kurtosis) of a numeric vector, from `summarystats` and friends in StatsBase.jl. It also counts the missing values. See [Summary Stats](summary-stats.md).

## Frequency
Counts and proportions of each level of a categorical or discrete variable, with `freqtable` from FreqTables.jl and `countmap` from StatsBase.jl. Two variables give a cross-tabulation. See [Frequency](frequency.md).

## Correlation
The pairwise association between the columns of a numeric matrix: **Pearson** for linear relations, **Spearman** for monotonic ones and robustness to outliers, together with the covariance matrix. See [Correlation](correlation.md).

## Common Workflow

1. Count the **missing values** and decide how to handle them (see the Handle Missing Data webview).
2. Run **Summary** on each numeric variable; compare mean and median, and look at skewness.
3. Plot the distribution (**Box Plot** or **Violin Plot**) and run the **Outlier Check**.
4. Run **Frequency** on each categorical variable; look for rare or misspelt levels.
5. Run **Correlation** on the numeric variables to see which ones move together before modelling them.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Summary Stats](summary-stats.md)
