# Online Statistics: Assumptions

What the estimates of the Online Statistics panel take for granted about the stream, and what each tab needs from its inputs. The estimators are those of `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)).

## What incremental estimates assume about the stream

An estimate with **Incremental** memory summarises every observation so far with equal weight. It describes a single distribution only when the stream comes from one: when the level or spread of the stream changes, the incremental mean or variance mixes the periods before and after the change and describes neither. **Rolling Window** and **Exponentially Weighted** memory relax this by letting old observations lose their influence, which suits a stream whose distribution drifts. The page [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) compares the three.

## Does the order of the observations matter

With **Incremental** memory, the mean, variance, moments, extrema and least squares coefficients do not depend on the order of the observations: any order gives the batch values, up to rounding. The **Quantile** and **Histogram** estimates do depend on it, because the P² markers of [Jain and Chlamtac (1985)](#ref-JC1985a) and the bin merges of [Ben-Haim and Tom-Tov (2010)](#ref-BT2010a) are decided one observation at a time. **Rolling Window** and **Exponentially Weighted** estimates depend on the order by design, as they favour the most recent observations.

## Dependence and the absence of standard errors

The panel prints point estimates only: no tab reports standard errors or confidence intervals. Observations of a time series are often correlated, and correlation makes a stream carry less information than the same number of independent observations, so a long stream does not by itself guarantee a precise estimate. `LinReg` on the **Linear Regression** tab reports coefficients without standard errors for the same reason.

## Missing values and the type of the data

`fit!` expects numbers, and a `missing` in **Data stream** raises an error. Wrapping a statistic in `SkipMissing`, as `SkipMissing(Mean())`, makes it skip missing values. The **Rolling Window** memory stores values in `MovingWindow(span, Float64)`, so the stream must convert to `Float64`. Values that are not missing but invalid, such as `NaN`, are not skipped: a single `NaN` turns the mean and variance into `NaN` for the rest of the stream, so filter such values before fitting.

## What Linear Regression needs from its inputs

`LinReg` adds no intercept, so **Covariate matrix (X)** needs a column of ones when the model should have one. Each row of X must pair with the response at the same position in **Data stream**. The coefficients can be solved only once there are more observations than columns of X, and only when no column of X is an exact combination of the others.

## The start of an exponentially weighted estimate

An estimate with **Exponentially Weighted** memory starts from an implicit value, 0 for the mean, because `ExponentialWeight` gives the first observation a weight below 1. The first estimates, roughly over the first few spans, are pulled towards that value and should not be read as estimates of the stream. **Incremental** and **Rolling Window** estimates have no such start-up, because their first estimate is the first observation itself.

## References

<a id="ref-BT2010a"></a>Ben-Haim, Y., & Tom-Tov, E. (2010). A Streaming Parallel Decision Tree Algorithm. *Journal of Machine Learning Research* 11(28), 849-872. [Online](https://www.jmlr.org/papers/v11/ben-haim10a.html)

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-JC1985a"></a>Jain, R., & Chlamtac, I. (1985). The P² Algorithm for Dynamic Calculation of Quantiles and Histograms Without Storing Observations. *Communications of the ACM* 28(10), 1076-1085. [doi:10.1145/4372.4378](https://doi.org/10.1145/4372.4378)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md)
