# Assumptions

Descriptive statistics make few assumptions, but each one quietly relies on the data being of the right kind.

## Numeric Values for Summary and Correlation
Means, standard deviations and correlations need numbers. A column of codes (1 = north, 2 = south) is categorical even though it is stored as integers: describe it with **Frequency**, not with a mean.

## Missing Values Propagate
In Julia, `mean([1, missing, 3])` is `missing`, not 2. Skip the missing values explicitly, and report how many there were:

```julia
using Statistics
mean(skipmissing(x))                    # mean of the observed values
count(ismissing, x)                     # how many were skipped
```

Skipping is only harmless when values are missing at random; see the Handle Missing Data webview.

## Sample, Not Population
`std` and `var` divide by n - 1 (the unbiased sample estimate). Pass `corrected=false` for the population formula. The difference matters only for small samples.

## Independent Observations
Summaries treat the observations as exchangeable. For a time series, the mean and standard deviation still describe the values, but they hide trends and seasonality: use the **Rolling Statistics** action to see how they change over time.

## Pearson Needs Linearity
Pearson's r measures **linear** association and is sensitive to outliers. A strong curved relation can give r near zero. When the relation is monotonic but not linear, or outliers are present, use **Spearman**.

## Matrix Orientation
`cor(X)` and `cov(X)` treat **columns as variables and rows as observations**. A matrix stored the other way round gives an observation-by-observation matrix; transpose it first.

## See Also
- [Diagnostics](diagnostics.md) · [Correlation](correlation.md) · [Decision Guide](decision-guide.md)
