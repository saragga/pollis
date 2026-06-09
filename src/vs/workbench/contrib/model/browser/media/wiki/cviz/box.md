# Box Plot

A **box plot** summarises a distribution with five numbers: minimum, first quartile (Q1), median, third quartile (Q3), and maximum, with outliers drawn separately. It is compact and robust, ideal for comparing many groups at once.

## Construction
```julia
using StatsPlots
boxplot(group, value; xlabel = "Group", ylabel = "Value", legend = false)
```

## Anatomy
- **Box** — the interquartile range (Q1 to Q3), containing the middle 50%.
- **Line in the box** — the median.
- **Whiskers** — typically extend to 1.5 × IQR beyond the quartiles.
- **Points beyond whiskers** — flagged outliers.

## Strengths and Limits
- **Robust** to outliers and works for small samples.
- **Hides shape**: two very different distributions (e.g. one bimodal) can share an identical box. When shape matters, use a [Violin Plot](violin.md).

## See Also
- [Violin Plot](violin.md) · [Decision Guide](decision-guide.md)
