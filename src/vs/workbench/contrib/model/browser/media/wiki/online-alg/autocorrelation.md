# Autocorrelation

The **Autocorrelation** tab of the Online Statistics panel estimates the autocovariances and autocorrelations of a stream at lags 0 to **Lags**, with `AutoCov` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)). The observations must arrive in time order, because each lag relates an observation to those that came before it.

## How AutoCov updates the autocovariances

`AutoCov(k)` keeps the last k observations in a circular buffer, with running averages of the products of each new observation with each of them, and running means of the observations at each lag. Each new observation updates these averages in a fixed amount of work for a given k, and earlier observations are not stored beyond the last k. `autocov(o)` computes the autocovariances at lags 0 to k from the averages and the overall mean, and `autocor(o)` divides them by the autocovariance at lag 0, the variance, so the autocorrelation at lag 0 is 1.

## Choosing the number of lags

**Lags** sets the largest lag k, and the tab prints k + 1 values, for lags 0 to k. More lags show dependence further back, at the cost of a little more memory and work per observation. The estimate at a lag k uses the pairs of observations k steps apart, of which there are k fewer than observations, so lags close to the length of the stream or of the window rest on few pairs. The **Autocorrelation Plot** action draws the autocorrelations as bars against the lag, a correlogram.

## The four kinds of memory on the Autocorrelation tab

| Memory | Code | What the autocorrelations cover |
|---|---|---|
| **Incremental** | `AutoCov(lags)` | Every observation so far, equally weighted |
| **Rolling Window** | `MovingWindow(span, Float64)`, then an `AutoCov` fitted to its values in order | The last **Window or span** observations |
| **Time Window** | `MovingTimeWindow(period; timetype=DateTime, valtype=Float64)`, then an `AutoCov` fitted to its values in time order | The observations within **Time window** of the latest time stamp |
| **Exponentially Weighted** | `AutoCov(lags, weight=ExponentialWeight(span))` | Every observation, recent ones weighted more |

## Lags count observations, not time

A lag of one is the previous observation, whatever time separates the two. For observations at regular intervals, such as one per second or per day, a lag is therefore a fixed length of time. For observations that arrive irregularly, such as quotes, the same lag can mean a fraction of a second in a busy period and minutes in a quiet one, so their autocorrelations describe the order of the observations more than their timing. `AutoCov` has no merge, so autocorrelations of separate parts of a stream cannot be combined into one estimate.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
