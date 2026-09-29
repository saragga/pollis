# Interpretation

## Centre
The **mean** is the balance point of the values; the **median** is the middle value. For symmetric data they agree. In right-skewed data (incomes, waiting times) the mean is pulled above the median by the long tail, and the median is the better "typical" value.

## Spread
The **standard deviation** is in the units of the data. For roughly normal data, about two-thirds of the values lie within one standard deviation of the mean and about 95% within two. The **interquartile range** (Q3 - Q1) holds the middle half of the data and is not affected by outliers. The **Percentile Report** gives the full profile.

## Shape
The **Shape Interpretation** action applies common rules of thumb:

| Skewness | Reading |
|---|---|
| Between -0.5 and 0.5 | Approximately symmetric |
| 0.5 to 1 (or -1 to -0.5) | Moderately skewed |
| Beyond 1 or -1 | Strongly skewed |

`kurtosis` in StatsBase.jl is **excess** kurtosis: 0 for a normal distribution, positive for heavy tails (more extreme values than a normal), negative for light tails.

## Frequencies
Compare **proportions**, not counts, when groups differ in size. In a cross-tabulation, choose the margin to match the question: proportions within each row answer "given this row group, how are the columns distributed?"

## Correlation
- The sign gives the direction; the magnitude gives the strength. As a rough guide, |r| of 0.1 is weak, 0.3 moderate and 0.5 or more strong, although what counts as strong depends on the field.
- r squared is the share of the variance of one variable that a linear relation with the other accounts for: r = 0.5 accounts for only 25%.
- Correlation is not causation: a third variable can drive both.
- The **covariance** matrix is in the product of the units of the two variables, so its size is hard to read; the correlation is the scale-free version.

## See Also
- [Summary Stats](summary-stats.md) · [Correlation](correlation.md) · [Diagnostics](diagnostics.md)
