# Online Statistics: Diagnostics

Checks that the estimates of the Online Statistics panel are what they should be, and what to look at when they are not.

## Checking online estimates against batch values

On a sample small enough to keep, the batch values are the reference. The **vs Batch Statistics** action prints the online mean and variance next to `mean` and `var` of `Statistics`: with **Incremental** memory they agree to rounding, as the update of [Welford (1962)](#ref-Wel1962a) is exact. The quantile and histogram estimates are approximations, so compare the **Quantile** estimate with `quantile` on the stored sample and expect a small difference, which shrinks as the stream grows.

## Watching an estimate settle

**Running Mean** and **Quantile Convergence** plot an estimate after each observation. With **Incremental** memory the line should wander at first and then settle, more slowly for quantiles than for the mean. A line that keeps trending is a sign that the stream itself drifts, in which case **Rolling Window** or **Exponentially Weighted** memory describes it better than **Incremental**. The **Incremental, Rolling and Exponential** action shows such a drift as a widening gap between the incremental line and the other two.

## How many observations were used

The **Observation Count** action prints `nobs`, the number of observations a statistic has processed. A `Series` reports the count of its first statistic. With **Rolling Window** memory the summary is computed from at most **Window or span** observations, however long the stream, so its precision is set by the window rather than by the length of the stream. With **Exponentially Weighted** memory `nobs` still counts every observation, although the oldest carry almost no weight.

## The start-up of exponential weights

An **Exponentially Weighted** mean starts near 0 and approaches the level of the stream over the first few spans. The **Incremental, Rolling and Exponential** action shows the start-up: the exponentially weighted line rises from below while the other two begin at the first observation. Discard the start-up period before reading the estimates, or compare them with the **Incremental** estimate over the same observations.

## Quantile and histogram accuracy

`P2Quantile` stores the first five observations as they are, so its first estimates are those of five values. Quantiles far in the tails need many observations before the markers around them settle. On the **Histogram** tab, more bins in `KHist` follow the distribution more closely; when the density or the quantiles read from 20 bins look coarse, try 50 or 100.

## Checking the regression

Call `coef(o)` before `predict`, because predictions use the coefficients of the last call. The errors of **One-Step-Ahead Predictions** measure out-of-sample accuracy, since each response is predicted before the model sees it. On a stored sample, `X \ y` gives the batch least squares coefficients to compare with **Regression Coefficients**. Coefficients that swing widely between successive calls of `coef`, long after the start, suggest nearly collinear predictors; the ridge penalty of `coef(o, λ)` steadies them.

## References

<a id="ref-Wel1962a"></a>Welford, B. P. (1962). Note on a Method for Calculating Corrected Sums of Squares and Products. *Technometrics* 4(3), 419-420. [doi:10.1080/00401706.1962.10490022](https://doi.org/10.1080/00401706.1962.10490022)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md)
