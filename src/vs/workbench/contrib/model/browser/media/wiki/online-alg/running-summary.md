# Running Summary

The **Running Summary** tab of the Online Statistics panel computes the mean, variance, standard deviation, extrema, skewness and kurtosis of a stream in one pass, with `Series(Mean(), Variance(), Extrema(), Moments())` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)). A `Series` passes each observation to every statistic it holds, so the stream is read once.

## How the running variance is updated

`Variance` updates the mean and the sum of squared deviations together as each observation arrives, in the form given by [Welford (1962)](#ref-Wel1962a). The sum of squares of deviations is corrected step by step instead of being computed as the sum of squares minus a squared total, which avoids the loss of digits that subtraction causes when the values are large compared with their spread. `value` returns the variance with the correction n/(n − 1), so with **Incremental** memory it equals the sample variance `var` of `Statistics`. The tab prints the standard deviation as its square root.

## How skewness and kurtosis are computed in the Running Summary

`Moments` keeps the running averages of x, x², x³ and x⁴ and computes skewness and kurtosis from them when asked. `kurtosis` returns the excess kurtosis, which is 0 for a normal distribution. Skewness is 0 for a symmetric distribution, positive when the right tail is longer and negative when the left tail is. The **Summary Statistics** action prints the same five values from a fresh `Series`, without the **Memory** choice of the tab.

## The three kinds of memory on the Running Summary tab

| Memory | Code | What the summary covers |
|---|---|---|
| **Incremental** | `Series(Mean(), Variance(), Extrema(), Moments())` | Every observation so far, equally weighted |
| **Rolling Window** | `MovingWindow(span, Float64)`, then a `Series` fitted to its values | The last **Window or span** observations |
| **Exponentially Weighted** | `Mean(weight=w)`, `Variance(weight=w)`, `Moments(weight=w)` with `w = ExponentialWeight(span)` | Every observation, recent ones weighted more |

## Extrema under each memory

`Extrema` takes no weight, so with **Exponentially Weighted** memory it still reports the smallest and largest values of the whole stream. With **Rolling Window** memory the summary is computed from the window, so the extrema are those of the last **Window or span** observations. `extrema(s[3])` returns the minimum and maximum as a pair, and `value(s[3])` adds how many times each has occurred.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-Wel1962a"></a>Welford, B. P. (1962). Note on a Method for Calculating Corrected Sums of Squares and Products. *Technometrics* 4(3), 419-420. [doi:10.1080/00401706.1962.10490022](https://doi.org/10.1080/00401706.1962.10490022)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md)
