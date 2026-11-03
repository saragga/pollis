# Quantile

The **Quantile** tab of the Online Statistics panel estimates the median and the quartiles of a stream with `P2Quantile` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)), an implementation of the P² algorithm of [Jain and Chlamtac (1985)](#ref-JC1985a).

## How the P-squared algorithm estimates a quantile

The P² algorithm keeps five markers for one quantile p: the minimum, the maximum, the current estimate of the p-quantile, and two markers between them. Each marker has a height, an estimate of a quantile, and a position, the number of observations below it. When an observation arrives, the positions are updated, and a marker that has drifted from its desired position is moved one step, with its height adjusted by a piecewise-parabolic formula, the "P²" of the name. The first five observations are stored as they are. Memory stays at five markers however long the stream is, and no observation is sorted or kept.

## Several quantiles from one stream

One `P2Quantile` estimates one quantile. The **Quantile** tab builds `Series(P2Quantile(0.25), P2Quantile(0.5), P2Quantile(0.75))` to estimate the three quartiles in the same pass, and `value` returns them in that order. `OnlineStats.jl` also offers `Quantile`, which estimates several quantiles at once from an `ExpandingHist` with `b` bins, more bins giving more accuracy at the cost of speed.

## How accurate the P-squared estimate is

[Jain and Chlamtac (1985)](#ref-JC1985a) present the P² algorithm as a heuristic and analyse its accuracy. Its estimate depends on the order in which the observations arrive, unlike a batch quantile of the same data. The **Quantile Convergence** action plots the estimate after each observation, and comparing it with `quantile` of `Statistics` on a stored sample shows the size of the error.

## Why the Quantile tab has no memory options

`P2Quantile` takes no weight, so the **Quantile** tab is incremental only: every observation so far shapes the markers. `OnlineStats.jl` does not merge two `P2Quantile` estimates either, so quantiles of separate partitions of a stream cannot be combined into one; `KHist` on the **Histogram** tab can be merged and gives quantiles from its bins. To follow a quantile that drifts, `quantile` of `Statistics` on the values of a `MovingWindow` gives a rolling quantile, at the cost of storing the window.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-JC1985a"></a>Jain, R., & Chlamtac, I. (1985). The P² Algorithm for Dynamic Calculation of Quantiles and Histograms Without Storing Observations. *Communications of the ACM* 28(10), 1076-1085. [doi:10.1145/4372.4378](https://doi.org/10.1145/4372.4378)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
