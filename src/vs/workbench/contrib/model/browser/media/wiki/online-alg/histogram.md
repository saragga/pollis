# Histogram

The **Histogram** tab of the Online Statistics panel builds a histogram of a stream in a fixed number of bins with `KHist` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)), which follows the streaming histogram of [Ben-Haim and Tom-Tov (2010)](#ref-BT2010a).

## How KHist builds a histogram from a stream

`KHist(k)` keeps at most k bins, each a centre and a count. Each new observation becomes a bin of its own with count 1. When that makes more than k bins, the two bins whose centres are closest merge into one, whose count is the sum of the two and whose centre is their average weighted by the counts. The bins therefore crowd where the data are dense and spread out where they are sparse. The documentation of `OnlineStats.jl` notes one difference from [Ben-Haim and Tom-Tov (2010)](#ref-BT2010a): the bins of the minimum and the maximum never merge, so the extrema are kept exactly.

## Reading shares, quantiles and moments from KHist

`value(o)` returns the bin centres and their counts, not bin edges. `ecdf(o)` returns the empirical distribution function of the bins, so `ecdf(o)(x)` is the share of the stream at or below x, which the **Histogram** tab prints at 1.0. A density estimate also exists, `pdf`, which interpolates linearly between the counts of neighbouring centres; it belongs to `OnlineStatsBase` and is not part of the public names of `OnlineStats.jl`, so Julia warns when it is called as `OnlineStats.pdf`. The documentation of `OnlineStats.jl` lists `mean`, `var`, `std`, `quantile` and `median` of a `KHist`, all approximations computed from the bins. The **Online Histogram** action plots a 30-bin `KHist` with `Plots.jl`.

## Choosing the number of bins

The default of 20 bins gives a coarse picture with very little memory. More bins follow the shape of the distribution more closely, in particular in the tails, at the cost of more memory and a slower merge step, which searches all bins for the closest pair. `KHist` requires more than two bins. The **Online Histogram** action uses 30 bins, and its plot shows the bins crowding around the peak of the distribution.

## Why the Histogram tab has no memory options

`KHist` counts every observation equally, so the **Histogram** tab is incremental only. Two `KHist` estimates of separate partitions can be merged with `merge!`, which inserts the bins of one into the other: this is how [Ben-Haim and Tom-Tov (2010)](#ref-BT2010a) combine the histograms built on separate processors. `OnlineStats.jl` also has `Hist`, a histogram with fixed edges given in advance, and `ExpandingHist`, whose bins double in width as needed to contain every observation.

## References

<a id="ref-BT2010a"></a>Ben-Haim, Y., & Tom-Tov, E. (2010). A Streaming Parallel Decision Tree Algorithm. *Journal of Machine Learning Research* 11(28), 849-872. [Online](https://www.jmlr.org/papers/v11/ben-haim10a.html)

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
