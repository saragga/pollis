# Correlation

The **Correlation** tab of the Online Statistics panel computes the covariance and correlation matrices of several variables from a stream of rows, with `CovMatrix` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)). Each row of **Variables matrix** is one observation of every variable, and the rows are read once, in order.

## How CovMatrix updates the covariance matrix

`CovMatrix` keeps two running averages: of each row x, and of its cross-products x times its own transpose. Each new row updates both, and the observations are not stored, so memory depends only on the number of variables p. `cov(o)` computes the covariance matrix from the two averages, with the correction n/(n − 1), so with **Incremental** memory it equals the sample covariance `cov` of `Statistics`. `cor(o)` divides each covariance by the two standard deviations, `mean(o)` returns the means and `var(o)` the variances. [Welford (1962)](#ref-Wel1962a) gives an update of corrected sums of products as well as of squares; `CovMatrix` keeps the uncorrected averages and corrects them when asked.

## Why the code copies the covariance and correlation matrices

`cov(o)` and `cor(o)` both return the matrix stored inside `CovMatrix`, and each call writes its result into that same matrix. A covariance matrix kept from `cov(o)` therefore changes into the correlation matrix as soon as `cor(o)` is called. The **Correlation** tab takes a `copy` of each result, and the **vs Batch Correlation** action compares the covariance before it asks for the correlation. Code that keeps both matrices, or keeps one while fitting more rows, needs the same copies.

## The three kinds of memory on the Correlation tab

| Memory | Code | What the matrices cover |
|---|---|---|
| **Incremental** | `CovMatrix()` | Every row so far, equally weighted |
| **Rolling Window** | `MovingWindow(span, Vector{Float64})`, then a `CovMatrix` fitted to its rows | The last **Window or span** rows |
| **Exponentially Weighted** | `CovMatrix(weight=ExponentialWeight(span))` | Every row, recent ones weighted more |

The rolling window stores each row as a `Vector{Float64}`, so its memory grows with **Window or span** times the number of variables, while the other two keep only p means and p by p cross-products.

## Correlations that change over time

The correlation between two series can rise and fall over time, and an incremental correlation averages such periods together. **Exponentially Weighted** memory gives a correlation that follows the recent co-movement, and **Correlation Over Time** plots the exponentially weighted correlation of the first two columns after each row. Its early values are unreliable: `ExponentialWeight` gives the first row a weight below 1, and the averages start from 0, so the matrices need a few spans of rows before they describe the stream.

## Checking the online matrices

With **Incremental** memory, `cov(o)` and `cor(o)` equal the batch matrices of `Statistics` up to rounding, which **vs Batch Correlation** checks by printing the largest difference in each. Two `CovMatrix` estimates built on separate parts of a stream merge exactly with `merge!` under **Incremental** memory. A variable that never changes has a standard deviation of 0, and its correlations are then not defined: `cor(o)` returns `NaN` in its row and column.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-Wel1962a"></a>Welford, B. P. (1962). Note on a Method for Calculating Corrected Sums of Squares and Products. *Technometrics* 4(3), 419-420. [doi:10.1080/00401706.1962.10490022](https://doi.org/10.1080/00401706.1962.10490022)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md)
