# Substitute

**Substitute** replaces every missing value in a column with a single **statistic of that column's observed values**: its mean, median or mode.

## Construction
```julia
using Impute, Tables, Statistics
tbl = Tables.columntable(data)
result = Impute.substitute(tbl; statistic=mean)
result = Impute.substitute(tbl; statistic=median)

using StatsBase                         # mode lives in StatsBase
result = Impute.substitute(tbl; statistic=mode)
```

## Choosing the Statistic

| Statistic | Use for |
|---|---|
| Mean | Roughly symmetric numeric columns |
| Median | Skewed numeric columns, or columns with outliers |
| Mode | Categorical or discrete columns |

## How It Works
Each column is handled on its own: the statistic is computed from the observed values and written into every gap. The other columns and the order of the rows are ignored.

## Side Effects
- **Variance shrinks**: all imputed values sit exactly at the centre, so the spread is understated.
- **Correlations weaken**: the imputed values do not move with the other columns.
- **A spike** appears at the statistic in the histogram; see **Distribution Shift**.

## Strengths and Limits
- Instant, never fails, and fills every gap.
- A reasonable baseline when only a few values are missing.
- Distorts variances and relations as the share of missing values grows. When those matter, prefer SVD, or Interpolate for time series.

## See Also
- [Drop](drop.md) · [SVD](svd.md) · [Diagnostics](diagnostics.md)
