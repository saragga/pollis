# Assumptions

Weighting helps only when the mean equation and the variance form are close to the truth. The panel's checks can reveal failures of the variance form more readily than failures of the mean.

## Why Weighted Regression Needs a Correct Mean Equation

The tabs assume that y is linear in X and that the regressors are uncorrelated with the errors. A missing curve in the mean leaves residuals that fan out, and this looks like heteroskedasticity, so a variance model may then absorb a mean problem. Under endogeneity OLS and weighted least squares aim at different quantities, and a large gap between them in **Compare with OLS** can be the sign. The panel has no specification test. Plot residuals against each regressor, and try adding squares or interactions to **Regressors (X)**.

## What Happens When the Variance Form Is Wrong

With exogenous regressors a wrong variance form does not make the weighted estimates inconsistent, but it costs efficiency and invalidates standard errors that rest on that form. **Maximum likelihood** can suffer more: [Carroll and Ruppert (1982)](#ref-CR1982a) showed that it is more sensitive than generalised least squares to small misspecifications of the variance function, in a model where the variances depend on the regression parameter and not on separate drivers. Warnings include a small **breusch_pagan_standardised_p** and a band in **Standardised Residuals** that is still uneven. [Romano and Wolf (2017)](#ref-RW2017a) recommend weighted least squares with heteroskedasticity-consistent standard errors for this reason. The panel does not provide those for the weighted fit.

## Which Conditions Variance Drivers Must Meet

**Variance drivers (Z)** must be known for every row, with no column of ones, as the code adds the intercept. **Power** takes logarithms, so its drivers must be non-zero. A dummy variable in X, used through the default `nothing`, breaks this requirement. The package clips abs(z) at 1e-10 in the fit, while the panel's own `variance(Z)` function has no clip and gives log(0) for a zero driver. Collinear drivers make gamma unstable. For **Predict at New Values**, the drivers must also be available at the new rows.

## Why the Heteroskedasticity Panel Assumes Independent Errors

The weights handle a changing variance but not correlation between errors. With time series or clustered data, the weighted standard errors are then wrong, and the variance tests can respond to dependence as well. The panel offers no check for this. In time-ordered data, a user can compute `durbin_watson_test(Xm, yv)`, which `HARE.jl` exports, or plot the autocorrelations of the residuals. If dependence appears, **Linear Models with Heteroskedasticity + AR(1)** treats both features, under the exponential form only.

## Where Normal Errors Matter in Heteroskedastic Regression

**Maximum likelihood** assumes normal errors. So do several constants in FWLS: 1.2704 in **Exponential** and **Power** and sqrt(pi/2) in **Quadratic**. Under other distributions those constants scale the fitted variance wrongly, and the weights keep their relative sizes only as long as the error shape does not vary across observations. Coefficients then remain usable, but level-dependent output suffers, including the 1.96 intervals and the envelope of **Residual Spread**. **jarque_bera_p** in **Remaining Heteroskedasticity** tests normality of the standardised residuals.

## Why Fitted Variances Must Stay Positive in the Linear and Quadratic Tabs

**Linear** and **Quadratic** can produce negative fitted values for some rows. No weight exists for such a row, so `HARE.jl` stops with an error that gives the number of rows and points to **Exponential**, **Power** or OLS with robust standard errors. A value below 1e-6 of the mean fitted value counts as zero.

## References

<a id="ref-CR1982a"></a>Carroll, R. J. and Ruppert, D. (1982). A comparison between maximum likelihood and generalized least squares in a heteroscedastic linear model. *Journal of the American Statistical Association* 77(380), 878–882. [doi:10.1080/01621459.1982.10477901](https://doi.org/10.1080/01621459.1982.10477901)

<a id="ref-RW2017a"></a>Romano, J. P. and Wolf, M. (2017). Resurrecting weighted least squares. *Journal of Econometrics* 197(1), 1–19. [doi:10.1016/j.jeconom.2016.10.003](https://doi.org/10.1016/j.jeconom.2016.10.003)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
