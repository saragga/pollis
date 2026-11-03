# Online Statistics: Factsheet

A quick reference for the **Online Statistics** panel: the six tabs, their inputs, the memory each tab offers and what each action computes. Every tab runs on `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)).

## The six tabs side by side

| Tab | Type | Memory | State kept | Merge of two estimates |
|---|---|---|---|---|
| **Running Summary** | `Series(Mean(), Variance(), Extrema(), Moments())` | Incremental, Rolling Window, Time Window, Exponentially Weighted | A few numbers; the window for Rolling Window and Time Window | Yes, with Incremental |
| **Quantile** | `P2Quantile(0.5)` | Incremental | Five markers per quantile | No |
| **Histogram** | `KHist(20)` | Incremental | At most 20 bins | Yes |
| **Linear Regression** | `LinReg()` | Incremental, Exponentially Weighted | Sums of cross-products of x and y | Yes, with Incremental |
| **Correlation** | `CovMatrix()` | Incremental, Rolling Window, Time Window, Exponentially Weighted | Averages of each row and its cross-products; the window for Rolling Window and Time Window | Yes, with Incremental |
| **Autocorrelation** | `AutoCov(10)` | Incremental, Rolling Window, Time Window, Exponentially Weighted | Averages of products with the last 10 observations; the window for Rolling Window and Time Window | No |

## Inputs of the Online Statistics panel and their defaults

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Data stream** | `data`: 10,000 draws from Exponential(1); an AR(1) stream on Autocorrelation | All but Correlation | The observations; on **Linear Regression**, the response |
| **Covariate matrix (X)** | `X`: a column of ones and one standard normal predictor | Linear Regression | One row of predictors per observation |
| **Variables matrix** | `vars`: 10,000 rows of three correlated standard normal variables | Correlation | One row per observation, one column per variable |
| **Memory** | Incremental | Running Summary, Linear Regression, Correlation, Autocorrelation | Which observations the estimates reflect |
| **Window or span** | 100 | Running Summary, Linear Regression, Correlation, Autocorrelation | Window length for Rolling Window, span for Exponentially Weighted |
| **Time stamps** | `times`: one per second from 2 January 2026, 09:30 | With Time Window | A `DateTime` for each observation |
| **Time window** | `Minute(30)` | With Time Window | How far back from the latest time stamp the window reaches |
| **Lags** | 10 | Autocorrelation | The largest lag estimated |

## What each tab of Online Statistics prints

| Tab | Printed values |
|---|---|
| **Running Summary** | Mean, Variance, Std dev, Extrema, Skewness, Kurtosis (excess) |
| **Quantile** | The median, then the three quartiles |
| **Histogram** | Bin centres and counts, and the share of the stream at or below 1.0 |
| **Linear Regression** | Coefficients, in the order of the columns of X |
| **Correlation** | Means, standard deviations, covariance matrix, correlation matrix |
| **Autocorrelation** | Lags, autocovariances and autocorrelations |

Every value is computed from the state the estimator keeps. Printing again after more observations have been added with `fit!` gives the updated values without reading the earlier observations again.

## Next Steps actions of Online Statistics

| Group | Action | Output |
|---|---|---|
| Visualise | **Running Mean** | The mean after each observation |
| Visualise | **Online Histogram** | A plot of a 30-bin `KHist` |
| Visualise | **Quantile Convergence** | The median estimate after each observation |
| Visualise | **Correlation Over Time** | The exponentially weighted correlation of columns 1 and 2 after each row |
| Visualise | **Autocorrelation Plot** | The autocorrelations against the lag, as bars |
| Diagnose | **vs Batch Statistics** | Online and batch mean and variance side by side |
| Diagnose | **Observation Count** | Observations processed and the current mean |
| Diagnose | **vs Batch Correlation** | Largest differences from the batch covariance and correlation matrices |
| Predict | **Regression Predictions** | A prediction for one new row of predictors |
| Predict | **One-Step-Ahead Predictions** | Each response predicted before the model sees it |
| Compare | **Merge Parallel Streams** | The mean of two halves, merged with `merge!` |
| Compare | **Incremental, Rolling and Exponential** | The running mean under the three kinds of memory |
| Interpret | **Summary Statistics** | Mean, variance, skewness, kurtosis and extrema |
| Interpret | **Regression Coefficients** | Coefficients and the number of observations |

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
