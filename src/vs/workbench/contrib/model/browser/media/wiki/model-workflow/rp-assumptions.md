# Assumptions

The metrics of Regression Performance are arithmetic and can always be computed. What needs assumptions is reading them as a guide to future errors, or relying on error patterns such as Normality.

## What the Test Cases Must Satisfy in Regression Performance

A metric generalises only if the test cases resemble the cases the model will meet and played no part in fitting or in choosing the model. If they were used for tuning, or if the features leak the target, the metrics come out too good. For data ordered in time, a random split lets the model train on the future, so test cases should come after the training period. The panel cannot detect any of these faults, because it sees only the numbers entered. The usual sign is a drop in performance on genuinely new cases.

## What Regression Performance Needs from Its Input Vectors

**Predicted Values** and **Actual Values** must have one entry per case, in the same order. A length mismatch raises a dimension error, but a wrong order does not: the metrics are then computed on mispaired values, and they degrade with no message. **Training Targets** should come from the same target on the same scale, since the R² baseline is its mean; a log-scale prediction scored against raw values gives meaningless figures. **No. of Predictors** counts the features used to train the model, and affects Adjusted R² only. Missing values pass through to the results, so they should be removed in pairs first.

## What Happens if Regression Residuals Are Not Normal

RMSE, MAE and R² do not assume Normal errors. Normality matters for what is built on them, such as prediction intervals based on the Normal distribution and small-sample t-tests. Heavy tails make such intervals too narrow, and they let a few cases dominate RMSE. **Q-Q Plot** shows the departure as points leaving the reference line. The plot standardises the residuals by their own mean and standard deviation, so it cannot reveal bias. A formal test is that of [Shapiro and Wilk (1965)](#ref-SW1965a), which the panel does not run; on large samples it rejects for departures too small to matter.

## What Happens if the Spread of Regression Errors Changes

A single RMSE or MAE assumes that one average describes all the cases. When the spread of the errors grows with the size of the prediction, the summary overstates the error at one end of the range and understates it at the other, and intervals of constant width are wrong in both places. **Residual Plot** shows this as a funnel. For a formal check on a linear model, the test of [Breusch and Pagan (1979)](#ref-BP1979a) is available outside the panel. [White (1980)](#ref-Whi1980a) gives standard errors for regression coefficients that remain consistent under this condition. A log or square-root transform of the target can also stabilise the spread.

## What Happens if Regression Errors Are Correlated

Metric values remain valid averages when errors are correlated, but correlated errors carry less information than their count suggests, so the metrics vary more than an independent sample of that size would. Correlation arises in time series, in repeated measures on one unit, and in spatial data. The panel offers no check for this. The statistic of [Durbin and Watson (1950)](#ref-DW1950a) tests for first-order serial correlation in least squares residuals, and a plot of residual autocorrelations covers more lags. Under autocorrelation, comparing models or building intervals calls for standard errors such as those of [Newey and West (1987)](#ref-NW1987a).

## What Each Regression Metric Assumes About the Target

| Metric | Condition for a sound reading | How to tell |
|---|---|---|
| RMSE | The conditional mean is the target, and large errors should weigh more | Stated purpose of the model |
| MAE | The conditional median is the target | Stated purpose of the model |
| R² | **Training Targets** give a fair baseline, and the actual values vary | Near-constant actual values make R² unstable |
| Adjusted R² | Scored in-sample, with n well over p | **Actual Values** are the training targets |
| MAPE | Positive values on a scale with a meaningful zero | Look for the panel's warning on skipped values |
| All five | Residuals centred on zero, with no pattern | **Error Distribution** and **Residual Plot** |

## References

<a id="ref-BP1979a"></a>Breusch, T. S. and Pagan, A. R. (1979). A simple test for heteroscedasticity and random coefficient variation. *Econometrica* 47(5), 1287. [doi:10.2307/1911963](https://doi.org/10.2307/1911963)

<a id="ref-DW1950a"></a>Durbin, J. and Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. *Biometrika* 37(3-4), 409–428. [doi:10.1093/biomet/37.3-4.409](https://doi.org/10.1093/biomet/37.3-4.409)

<a id="ref-NW1987a"></a>Newey, W. K. and West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. *Econometrica* 55(3), 703–708. [doi:10.2307/1913610](https://doi.org/10.2307/1913610)

<a id="ref-SW1965a"></a>Shapiro, S. S. and Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). *Biometrika* 52(3-4), 591–611. [doi:10.1093/biomet/52.3-4.591](https://doi.org/10.1093/biomet/52.3-4.591)

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

## See Also

- [Overview](rp-overview.md) · [Metric Guide](rp-metric-guide.md) · [Interpretation](rp-interpretation.md)
