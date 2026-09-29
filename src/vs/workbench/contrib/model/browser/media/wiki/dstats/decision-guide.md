# Decision Guide

| Question | Data | Method | Why |
|---|---|---|---|
| What is a typical value, and how spread out are the values? | Numeric vector | **Summary** ([Summary Stats](summary-stats.md)) | Centre, spread and shape in one call |
| How often does each category occur? | Categorical or discrete vector | **Frequency** ([Frequency](frequency.md)) | Counts and proportions per level |
| Are two categorical variables related? | Two categorical vectors | **Frequency** (cross-tabulation) | Joint counts show the pattern |
| Do numeric variables move together linearly? | Numeric matrix | **Correlation**, Pearson ([Correlation](correlation.md)) | Linear association |
| Do they move together in the same direction, whatever the shape? | Numeric or ordinal matrix | **Correlation**, Spearman | Rank-based, robust to outliers |

## Decision Flow

1. **Is the variable categorical** (labels, codes, a small set of integers)? Use Frequency.
2. **Is it numeric?** Use Summary. If the mean and the median differ a lot, or the Outlier Check flags many values, report the median and the IQR.
3. **Do you want the relation between several numeric variables?** Use Correlation. Start with Pearson; switch to Spearman when a scatter plot shows a curve or outliers.
4. **Is the data ordered in time?** Add the Rolling Statistics action: one overall mean hides trends.

## Rules of Thumb
- **Always count the missing values first.**
- **Report the median and IQR** for skewed data, the mean and standard deviation for roughly symmetric data.
- **Plot before correlating**: a single number can hide a curve, clusters or one influential point.

## See Also
- [Summary Stats](summary-stats.md) · [Frequency](frequency.md) · [Correlation](correlation.md)
