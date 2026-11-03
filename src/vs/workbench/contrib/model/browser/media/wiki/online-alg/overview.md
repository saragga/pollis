# Online Statistics

The Online Statistics panel computes statistics of a data stream in a single pass. Each observation updates the estimates and can then be discarded, so the memory the estimates need does not grow with the length of the stream. The panel runs on `OnlineStats.jl`, described by [Day and Zhou (2020)](#ref-DZ2020a), and its menu item is Explore > Descriptive and Online Statistics > Online Statistics.

## What online statistics are for

Online statistics suit data that arrive one observation at a time, such as quotes, sensor readings or log events, and data too large to hold in memory at once. A batch statistic needs the whole sample and must be computed again when an observation arrives. An online statistic keeps a small summary of what it has seen and updates that summary with each new observation. Streams of this kind, and the algorithms that summarise them with bounded memory, are the subject of the data stream chapter of [Leskovec, Rajaraman and Ullman (2020)](#ref-LRU2020a).

## The four tabs of the Online Statistics panel

| Tab | What it estimates | OnlineStats.jl type |
|---|---|---|
| **Running Summary** | Mean, variance, extrema, skewness and kurtosis | `Series` of `Mean`, `Variance`, `Extrema`, `Moments` |
| **Quantile** | The median and other quantiles | `P2Quantile` |
| **Histogram** | The distribution, in a fixed number of bins | `KHist` |
| **Linear Regression** | Least squares coefficients of a response on predictors | `LinReg` |

Each tab prints its estimates, and the Next Steps actions plot, check, predict and compare them.

## Incremental, rolling and exponentially weighted memory

The **Memory** input decides which observations an estimate reflects. **Incremental** weighs every observation so far equally. **Rolling Window** keeps only the most recent observations, as many as **Window or span**. **Exponentially Weighted** keeps every observation but gives older ones geometrically smaller weights. The **Running Summary** tab offers all three, **Linear Regression** offers **Incremental** and **Exponentially Weighted**, and **Quantile** and **Histogram** are incremental only. The page [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) compares the three.

## How Online Statistics differs from Descriptive Statistics

The Descriptive Statistics panel works on a complete sample held in memory and gives exact quantiles, frequencies and correlations of that sample. The Online Statistics panel gives the same kinds of summaries for data that keep arriving, at the price of approximation for quantiles and histograms. Mean, variance, moments, extrema and least squares coefficients are exact in both panels when the memory is **Incremental**.

## A common workflow with Online Statistics

1. Start from **Running Summary** with **Incremental** memory to see the level and spread of the stream.
2. Run **vs Batch Statistics** on a stored sample to confirm the estimates.
3. Run **Incremental, Rolling and Exponential** to see whether the level drifts; if it does, switch **Memory** to **Rolling Window** or **Exponentially Weighted** and choose **Window or span**.
4. Add **Quantile** and **Histogram** for the shape of the distribution.
5. Use **Linear Regression** when a response depends on predictors, with **One-Step-Ahead Predictions** to check how well it predicts.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-LRU2020a"></a>Leskovec, J., Rajaraman, A., & Ullman, J. D. (2020). *Mining of Massive Datasets* (3rd ed.). Cambridge University Press. [Online](http://www.mmds.org)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md)
