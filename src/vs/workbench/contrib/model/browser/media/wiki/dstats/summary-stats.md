# Summary Stats

The **Summary** method describes a numeric vector by its centre, spread and shape.

## Construction
```julia
using StatsBase, Statistics
s = summarystats(x)                     # min, Q1, median, mean, Q3, max
mean(x), std(x), median(x)
quantile(x, [0.25, 0.75])               # first and third quartiles
skewness(x), kurtosis(x)                # shape; kurtosis is excess kurtosis
count(ismissing, x)                     # missing values
```

If `x` contains missing values, pass `skipmissing(x)` to the statistics that need numbers, or they return `missing`.

## What Each Statistic Measures

| Statistic | Measures | Sensitive to outliers? |
|---|---|---|
| Mean | Balance point | Yes |
| Median | Middle value | No |
| Standard deviation | Typical distance from the mean | Yes |
| Quartiles, IQR | Spread of the middle half | No |
| Skewness | Asymmetry | Very |
| Kurtosis | Weight of the tails | Very |

## Robust Alternatives
When outliers or heavy tails are present, StatsBase.jl offers estimators that resist them:

```julia
iqr(x)                                  # interquartile range
mad(x; normalize=true)                  # median absolute deviation, scaled to match std for normal data
mean(trim(x; prop=0.1))                 # 10% trimmed mean
```

## Strengths and Limits
- Fast, universal, and understood by every reader.
- A handful of numbers cannot show multimodality or gaps: pair them with a **Box Plot** or **Violin Plot**.
- Skewness and kurtosis are noisy in small samples; see [Diagnostics](diagnostics.md).

## See Also
- [Frequency](frequency.md) · [Correlation](correlation.md) · [Interpretation](interpretation.md)
