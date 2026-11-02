# Diagnostics

The Next Steps of the panel fall into two groups. Three look at OLS residuals before any correction, and three read the fitted model. No step checks the errors left over after the correction, so that check has to be done by hand.

## How to Read the Durbin-Watson Test Before Correcting for AR(1)

**Durbin-Watson Test** fits OLS with an intercept and applies the test of [Durbin and Watson (1950)](#ref-DW1950a) to its residuals. The statistic is close to 2(1 - rho), so a value near 2 suggests no first-order autocorrelation, and a value well under 2 suggests positive autocorrelation. A small p-value supports using an AR(1) correction. The test looks at the first lag only, and it is not valid with a lagged response among the regressors. Its reference distribution assumes constant variance, so with strong heteroskedasticity the p-value is only a rough guide.

## How to Read the Harvey Test for Exponential Heteroskedasticity

**Harvey Test** calls `harvey_test(X, y)`, a Lagrange multiplier test of gamma = 0 that follows [Harvey (1976)](#ref-Har1976a). OLS residuals are logged and squared, then regressed on the variance regressors, and the statistic is the explained sum of squares divided by pi^2 / 2. Under the null, it is chi-squared with one degree of freedom per variance regressor, not counting the intercept. A small p-value supports modelling the variance. The step always uses **Covariate matrix (X)** and ignores **Variance regressors (Z) — optional**, so call `harvey_test(X, y; Z=Z)` to test a chosen Z. Autocorrelated residuals make the chi-squared reference approximate.

## What to Look for in Residual Diagnostics

**Residual Diagnostics** draws two charts from OLS residuals. In the plot of residuals over time, long runs on one side of zero suggest positive autocorrelation, and rapid alternation suggests negative. In the plot of squared residuals against fitted values, a fan shape suggests that the variance moves with the level of the fit. A flat cloud does not rule out heteroskedasticity, since the variance may depend on a regressor unrelated to the fit. Also, because squared residuals inherit dependence from the errors, clusters of large values in time can come from either feature.

## How to Check Convergence of an Iterated Heteroskedasticity + AR(1) Fit

The generated code does not print whether **Iterated** finished, so `result.converged` and `result.iterations` need checking by hand. A value of `false` means that the 100 passes ran out, and the printed estimates are then only the last pass. Raising `maxiter` is the first remedy. In **Joint**, `result.converged` after **Two-Step** comes from the optimiser, and a `false` calls for different starting data or scaling. **Sequential** with **Two-Step** always reports `true`, which says nothing about the quality of the fit.

## How to Check the Errors Left After the Combined Correction

Neither tab reports a check of its corrected errors, and that check is the most direct test of the model. Compute e_t = (u_t - rho u_(t-1)) / sigma_t for t from 2, with u from `residuals(result)` and sigma_t^2 = exp(z_t' gamma), where z_t includes the intercept. If the model holds, e_t has no autocorrelation, its size does not change over time, and its distribution is near the standard normal. Remaining autocorrelation points to a need for more lags. A pattern in e_t^2 points to a wrong Z, and heavy tails show that normality fails.

## How to Read Estimated Rho and Gamma

**Estimated rho and gamma** refits the model and prints both. Rho close to 0 suggests the AR(1) part adds little, and rho near 1 or -1 raises the concerns of a near unit root. The first entry of gamma is the intercept, and `exp(gamma[1])` is the variance of the shock when all variance regressors are zero, which may be far outside the data. Each slope is the change in log variance for a unit change in its regressor, so a slope g multiplies the variance by exp(g). Standard errors of gamma are `sqrt.(diag(result.gamma_vcov))`, from `LinearAlgebra`.

## How to Read Compare with OLS

**Compare with OLS** displays the two coefficient tables one after the other. OLS standard errors assume independent errors of constant size, so they are not a sound benchmark if the corrections are needed. Coefficients should move only modestly when the regressors are strictly exogenous, as OLS and the corrected fit then estimate the same beta. A large shift points to a misspecified mean equation or to failed exogeneity, and it is a reason for doubt and not a gain from correcting. Standard errors can move in either direction, since positive autocorrelation with trending regressors tends to make the OLS ones too small.

## How to Read Predictions with AR(1) Errors

**Predictions** returns `y_hat`, equal to x_t' beta, and a one-step forecast of x' beta + rho u_T, where u_T is the last regression error. `X_new` is set to the last row of **Covariate matrix (X)** as a placeholder, so replace it with the known next-period regressors before reading the forecast. The fitted values leave out the AR(1) term. The panel gives no forecast interval. For one step ahead, the shock's variance is exp(z' gamma) at the next period's z, which excludes uncertainty about beta, rho and gamma.

## References

<a id="ref-DW1950a"></a>Durbin, J. and Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. *Biometrika* 37(3-4), 409–428. [doi:10.1093/biomet/37.3-4.409](https://doi.org/10.1093/biomet/37.3-4.409)

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

## See Also

- [Assumptions](assumptions.md) · [Sequential Method](sequential.md) · [Joint Method](joint.md)
