# Online Statistics: Factsheet

A quick reference for the **Online Statistics** panel: the four tabs, their inputs, the memory each tab offers and what each action computes. Every tab runs on `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)).

## The four tabs side by side

| Tab | Type | Memory | State kept | Merge of two estimates |
|---|---|---|---|---|
| **Running Summary** | `Series(Mean(), Variance(), Extrema(), Moments())` | Incremental, Rolling Window, Exponentially Weighted | A few numbers; the window for Rolling Window | Yes, with Incremental |
| **Quantile** | `P2Quantile(0.5)` | Incremental | Five markers per quantile | No |
| **Histogram** | `KHist(20)` | Incremental | At most 20 bins | Yes |
| **Linear Regression** | `LinReg()` | Incremental, Exponentially Weighted | Sums of cross-products of x and y | Yes, with Incremental |

## Inputs of the Online Statistics panel and their defaults

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Data stream** | `data`: 10,000 draws from Exponential(1) | All | The observations; on **Linear Regression**, the response |
| **Covariate matrix (X)** | `X`: a column of ones and one standard normal predictor | Linear Regression | One row of predictors per observation |
| **Memory** | Incremental | Running Summary, Linear Regression | Which observations the estimates reflect |
| **Window or span** | 100 | Running Summary, Linear Regression | Window length for Rolling Window, span for Exponentially Weighted |

## What each tab of Online Statistics prints

| Tab | Printed values |
|---|---|
| **Running Summary** | Mean, Variance, Extrema, Skewness, Kurtosis (excess) |
| **Quantile** | The median, then the three quartiles |
| **Histogram** | Bin centres and counts, and the density at 1.0 |
| **Linear Regression** | Coefficients, in the order of the columns of X |

Every value is computed from the state the estimator keeps. Printing again after more observations have been added with `fit!` gives the updated values without reading the earlier observations again.

## Next Steps actions of Online Statistics

| Group | Action | Output |
|---|---|---|
| Visualise | **Running Mean** | The mean after each observation |
| Visualise | **Online Histogram** | A plot of a 30-bin `KHist` |
| Visualise | **Quantile Convergence** | The median estimate after each observation |
| Diagnose | **vs Batch Statistics** | Online and batch mean and variance side by side |
| Diagnose | **Observation Count** | Observations processed and the current mean |
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
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md)
