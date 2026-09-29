# Correlation

The **Correlation** method measures how pairs of numeric variables move together, for every pair of columns of a matrix at once.

## Construction
```julia
using Statistics, StatsBase
C = cor(X)                              # Pearson correlation matrix, columns are variables
C = corspearman(X)                      # Spearman rank correlation matrix
V = cov(X)                              # sample covariance matrix
cor(x, y)                               # a single pair
```

## Pearson and Spearman
- **Pearson** (Galton, 1889) measures **linear** association between the values. It is the right choice for roughly linear relations without extreme points.
- **Spearman** (1904) is Pearson's r computed on the **ranks** of the values. It measures **monotonic** association (as one goes up, does the other tend to go up?) and is robust to outliers.
- **Kendall's tau**, `corkendall(X)`, is another rank measure, better suited to small samples with many ties.

## Reading the Matrix
The matrix is symmetric with ones on the diagonal. Each entry lies between -1 (perfect negative) and 1 (perfect positive); 0 means no linear (Pearson) or monotonic (Spearman) association. See [Interpretation](interpretation.md) for rules of thumb.

## Missing Values
`cor` does not skip missing values. Keep the complete rows first:

```julia
keep = [all(!ismissing, row) for row in eachrow(X)]
C = cor(Float64.(X[keep, :]))
```

## Is It Significant?
A correlation from a sample is an estimate. Under the null hypothesis of no correlation, t = r * sqrt(n - 2) / sqrt(1 - r^2) follows a t distribution with n - 2 degrees of freedom. With large n even tiny correlations are "significant", so judge the size as well.

## Strengths and Limits
- One matrix shows every pairwise relation at once.
- Only **pairwise**: it does not show relations that involve three or more variables together.
- Pearson misses curved relations; check the scatter plots before trusting a single number.

## See Also
- [Summary Stats](summary-stats.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
