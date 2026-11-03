# Linear Regression

The **Linear Regression** tab of the Online Statistics panel estimates least squares coefficients from a stream of predictor rows and responses with `LinReg` from `OnlineStats.jl` ([Day and Zhou, 2020](#ref-DZ2020a)).

## What LinReg keeps from the stream

`LinReg` keeps a running average of the cross-products of each row x and response y: those of x with itself, of x with y, and of y with itself. Each observation updates these sums, and the observations themselves are not stored, so memory depends only on the number of predictors k. The coefficients are solved from the sums when `coef(o)` is called, as the solution of the normal equations, and with **Incremental** memory they equal ordinary least squares on all the observations so far.

## Updating least squares as observations arrive

[Plackett (1950)](#ref-Pla1950a) shows how least squares estimates can be updated when new observations are added, without solving again from the beginning. `LinReg` takes the other route open to a stream: it updates the sums of cross-products, which is cheap, and solves the k-by-k system only when coefficients are requested. Solving whenever a coefficient is needed costs a little more per request, and keeps each update to a fixed amount of work.

## Exponentially weighted least squares

With **Exponentially Weighted** memory, the tab builds `LinReg(weight=ExponentialWeight(span))`, so the sums weight recent observations more and the coefficients describe the recent relationship between y and x. A regression whose coefficients drift over time is followed by this weighting. **Rolling Window** is not offered, because `LinReg` keeps no observations to drop; a rolling regression would refit the last observations at every step.

## Intercept, predictors and the ridge penalty

`LinReg` adds no intercept: include a column of ones in **Covariate matrix (X)**, as the default does. The coefficients come in the order of the columns of X. The system can be solved only when there are more observations than coefficients and no column is an exact combination of the others. `coef(o, λ)` adds the ridge penalty λ to the diagonal, and `coef(o, v)` with a vector v adds a separate penalty for each coefficient.

## Predictions from LinReg

`predict(o, x)` multiplies x by the coefficients from the last call of `coef`, so call `coef(o)` after fitting and before predicting. **Regression Predictions** predicts the response for one new row. **One-Step-Ahead Predictions** predicts each response from the coefficients so far and only then updates the model with it, which gives honest out-of-sample errors. `LinReg` reports no standard errors.

## References

<a id="ref-DZ2020a"></a>Day, J., & Zhou, H. (2020). OnlineStats.jl: A Julia Package for Statistics on Data Streams. *Journal of Open Source Software* 5(46), 1816. [doi:10.21105/joss.01816](https://doi.org/10.21105/joss.01816)

<a id="ref-Pla1950a"></a>Plackett, R. L. (1950). Some Theorems in Least Squares. *Biometrika* 37(1-2), 149-157. [doi:10.1093/biomet/37.1-2.149](https://doi.org/10.1093/biomet/37.1-2.149)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Incremental, Rolling and Exponentially Weighted Statistics](memory.md) · [Running Summary](running-summary.md) · [Quantile](quantile.md) · [Histogram](histogram.md) · [Linear Regression](linreg.md) · [Correlation](correlation.md)
