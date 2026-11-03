# Incremental, Rolling and Exponentially Weighted Statistics

Four kinds of memory decide which observations an online estimate reflects. The **Memory** input of the Online Statistics panel chooses among them on the **Running Summary**, **Linear Regression**, **Correlation** and **Autocorrelation** tabs, and **Window or span** sets how far back the rolling and exponentially weighted estimates look.

## How OnlineStats.jl updates an estimate

`OnlineStats.jl` updates most of its estimates by smoothing: after observation t, the new value is the old value moved a fraction γ(t) of the way towards what observation t alone would give, `smooth(a, b, γ) = a + γ * (b - a)`. A weight object supplies γ(t). This weighting mechanism, which lets new observations have more influence than old ones, is part of the design described by [Day and Zhou (2020)](#ref-DZ2020a). Incremental and exponentially weighted memory are two choices of the weight; rolling and time windows work differently, by keeping the observations themselves.

## Incremental statistics: every observation counts equally

**Incremental** memory uses `EqualWeight()`, with γ(t) = 1/t, the default of every `OnlineStats.jl` estimator. Each observation then has the same weight, so the incremental mean, variance, moments and least squares coefficients equal their batch values on the same data, up to rounding. Incremental estimates suit a stream whose distribution does not change: the longer the stream, the more precise they become, and the more slowly they react to a change.

## Rolling statistics: the last n observations

**Rolling Window** keeps the most recent n observations in `MovingWindow(n, Float64)`, a circular buffer, and summarises them on request. Each observation counts fully while it is in the window and not at all once n newer ones have arrived. The memory needed grows with n, unlike the fixed memory of incremental and exponentially weighted estimates. Sliding windows of this kind are a standard model of a data stream in [Leskovec, Rajaraman and Ullman (2020)](#ref-LRU2020a).

## Time windows: the last period of time

**Time Window** keeps the observations of a recent period, set by **Time window**, such as `Minute(30)`, with `MovingTimeWindow` of `OnlineStats.jl`. Each observation comes with a time stamp from **Time stamps**, and after each new one the window drops every observation more than the period older than the latest time stamp. The window is counted back from the data, not from the clock, so historical observations replay as they would have arrived. The number of observations in the window varies: a busy period holds many, a quiet one few. Unlike **Rolling Window**, which keeps a fixed count, a time window suits observations that arrive at irregular intervals, such as quotes.

## Exponentially weighted statistics: older observations count less

**Exponentially Weighted** memory uses `ExponentialWeight`, with a constant γ(t) = λ. `ExponentialWeight(s)`, with an integer span s, sets λ = 2/(s + 1), and **Window or span** is that s. Every observation keeps some weight, and the weight shrinks by the factor 1 − λ with each newer observation, so the estimate follows a drifting level with fixed memory. [Leskovec, Rajaraman and Ullman (2020)](#ref-LRU2020a) call this a decaying window and use it to keep counts that favour recent elements of a stream.

## The start of an exponentially weighted estimate

`ExponentialWeight` gives the first observation the weight λ rather than 1, so an exponentially weighted estimate starts from an implicit value: the documentation of `OnlineStats.jl` notes that `Mean` starts from 0. The early estimates are therefore pulled towards that starting value until enough observations have arrived, roughly a few spans. `McclainWeight(α)` starts with equal weights and decreases into the constant α, which avoids the pull; the panel uses `ExponentialWeight` because its span is the usual way to state an exponentially weighted average.

## Which tabs of Online Statistics offer which memory

| Tab | Incremental | Rolling Window | Time Window | Exponentially Weighted |
|---|---|---|---|---|
| **Running Summary** | Yes | Yes | Yes | Yes, except **Extrema** |
| **Quantile** | Yes | No | No | No |
| **Histogram** | Yes | No | No | No |
| **Linear Regression** | Yes | No | No | Yes |
| **Correlation** | Yes | Yes | Yes | Yes |
| **Autocorrelation** | Yes | Yes | Yes | Yes |

`P2Quantile` and `KHist` take no weight, and `LinReg` keeps sums rather than observations, so it has no window to roll. `Extrema` records the smallest and largest values ever seen under every kind of memory except **Rolling Window** and **Time Window**, where the summary is computed from the window alone.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-LRU2020a"></a>Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.). Cambridge University Press. [Online](http://www.mmds.org)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
