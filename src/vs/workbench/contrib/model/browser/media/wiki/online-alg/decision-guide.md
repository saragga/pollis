# Online Statistics: Decision Guide

Which tab of the Online Statistics panel answers a question, which **Memory** to choose, and when another panel is the better choice.

## Which tab of Online Statistics answers the question

| Question | Tab |
|---|---|
| What are the level, spread and shape of the stream? | **Running Summary** |
| What is the median, or another percentile? | **Quantile** |
| What does the whole distribution look like? | **Histogram** |
| How does a response depend on predictors? | **Linear Regression** |
| Do several variables move together? | **Correlation** |
| Does each observation depend on those before it? | **Autocorrelation** |

All tabs but **Correlation** read the same **Data stream**, so one pass can feed several of them: a `Series` holds any mix of statistics, as the **Running Summary** tab shows with four of them.

## Which memory to choose

| Situation | Memory |
|---|---|
| The stream comes from one distribution, and precision matters most | **Incremental** |
| Only the latest observations matter, and each should count fully while it does | **Rolling Window** |
| Only a recent period of time matters, however many observations it holds | **Time Window** |
| The level drifts, and recent observations should count more with fixed memory | **Exponentially Weighted** |
| The estimate must equal a batch statistic on the same data | **Incremental** |

[Leskovec, Rajaraman and Ullman (2020)](#ref-LRU2020a) treat sliding windows and decaying windows as the two standard ways to favour recent data in a stream.

## Choosing the window or span

**Window or span** sets the trade-off between reacting and settling. A short window or span follows changes quickly but leaves the estimate noisy; a long one gives a steadier estimate that lags behind changes. `ExponentialWeight(s)` gives each new observation the weight 2/(s + 1), the convention by which an exponentially weighted average with span s is compared with a rolling window of s observations. The **Incremental, Rolling and Exponential** action plots the three kinds of memory together and shows the trade-off for a chosen span.

## When estimates of several streams must be combined

`merge!` combines two estimates built on separate parts of a stream, for example on separate processors or files, as the **Merge Parallel Streams** action shows. With **Incremental** memory, `Mean`, `Variance`, `CovMatrix` and `LinReg` merge exactly, and `KHist` merges its bins. `P2Quantile` cannot be merged, so quantiles of partitions are better read from merged `KHist` histograms. Merges are meant for **Incremental** memory: an exponentially weighted estimate depends on the order of its observations, which two separate partitions do not share.

## When to use the Descriptive Statistics panel instead

When the whole sample fits in memory and will not grow, the Descriptive Statistics panel gives exact quantiles and frequency tables of the sample, with no approximation, and correlations by Spearman as well as Pearson. The Online Statistics panel is the choice when observations keep arriving, when the sample is too large to hold, or when recent observations should count more than old ones. The two panels sit together under Explore > Descriptive and Online Statistics.

## References

<a id="ref-LRU2020a"></a>Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.). Cambridge University Press. [Online](http://www.mmds.org)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
