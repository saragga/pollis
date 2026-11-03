# Online Statistics: Interpretation

How to read what each tab of the Online Statistics panel prints, and how the choice of **Memory** changes the meaning of the numbers.

## Reading the Running Summary

**Mean** is the centre of the stream, **Variance** its spread and **Std dev** the square root of the variance, in the units of the data, with the correction n/(n − 1) applied by `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)). **Extrema** are the smallest and largest values. **Skewness** measures asymmetry, positive for a long right tail. **Kurtosis** is the excess kurtosis, 0 for a normal distribution and positive for tails heavier than normal. Mean and extrema are in the units of the data and variance in their square, while skewness and kurtosis have no units.

## What the Memory choice means for the numbers

With **Incremental** memory a value describes the whole stream so far. With **Rolling Window** it describes the last **Window or span** observations, and changes abruptly when a large value enters or leaves the window. With **Exponentially Weighted** it describes the recent stream, with a smooth emphasis on the latest observations. The same stream can show a stable incremental mean and a moving exponentially weighted mean: the first answers "what is the level overall", the second "what is the level now".

## Reading a quantile estimate

The **Quantile** tab prints the median and then the first quartile, median and third quartile. Each is an approximation by the P² algorithm of [Jain and Chlamtac (1985)](#ref-JC1985a), close to the sample quantile of a long stream but not equal to it. The interquartile range, the third quartile minus the first, measures spread in a way that a few extreme values do not move.

## Reading the histogram

The **Histogram** tab prints the centres of the bins and the number of observations each holds. The centres are not evenly spaced: following [Ben-Haim and Tom-Tov (2010)](#ref-BT2010a), bins sit closer together where the data are dense. The share printed at 1.0 is the fraction of the stream at or below 1.0, read from the bins, comparable with the distribution function of a known distribution at the same point. The counts add up to the number of observations, which `nobs(o)` also returns.

## Reading the covariance and correlation matrices

The **Correlation** tab prints the means and standard deviations of the variables, then two p by p matrices in the order of the columns of **Variables matrix**. The diagonal of the covariance matrix holds the variances, and each other entry is the covariance of a pair, in the product of their units. The correlation matrix has ones on its diagonal and, elsewhere, values between −1 and 1 without units: near 1 when two variables rise and fall together, near −1 when one rises as the other falls, and near 0 when they show no linear relation. A correlation describes linear co-movement only, and says nothing about which variable drives the other.

## Reading the autocorrelations

The **Autocorrelation** tab prints the lags 0 to **Lags**, then the autocovariance and autocorrelation at each. The autocorrelation at lag 0 is always 1, and at lag k it measures how strongly an observation is related to the one k steps before it, between −1 and 1. Values that fall slowly with the lag point to persistent dependence, as in a series that wanders; values near 0 at every lag but 0 point to a stream with no linear memory of its past. Lags count observations, not time, so for observations at irregular intervals one lag is not a fixed length of time.

## Reading the regression coefficients

With **Incremental** memory the coefficients are the ordinary least squares estimates on all observations so far, in the order of the columns of **Covariate matrix (X)**: the first, against the column of ones, is the intercept. With **Exponentially Weighted** memory they describe the recent relationship between the response and the predictors, and they move when that relationship changes. No standard errors are reported, so the coefficients alone do not say whether an effect is distinguishable from zero.

## References

<a id="ref-BT2010a"></a>Ben-Haim, Y., & Tom-Tov, E. (2010). A Streaming Parallel Decision Tree Algorithm. *Journal of Machine Learning Research* 11(28), 849-872. [Online](https://www.jmlr.org/papers/v11/ben-haim10a.html)

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-JC1985a"></a>Jain, R., & Chlamtac, I. (1985). The P² Algorithm for Dynamic Calculation of Quantiles and Histograms Without Storing Observations. *Communications of the ACM* 28(10), 1076-1085. [doi:10.1145/4372.4378](https://doi.org/10.1145/4372.4378)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md) · [Autocorrelation](autocorrelation.md)
