# Diagnostics — Linear Models with Autocorrelation

Some checks here run before the correction and ask whether one is needed. Others run after the fit and ask whether AR(1) removed the dependence.

## How to Test for Serial Correlation Before Correcting a Regression

**Serial Correlation Tests** works on OLS residuals. The statistic of [Durbin and Watson (1950)](#ref-DW1950a) is close to 2 under no autocorrelation, and `HypothesisTests.jl` gives a two-sided p-value, by an exact algorithm up to 100 observations and a normal approximation above that. The tests of [Breusch (1978)](#ref-Bre1978a) and [Godfrey (1978)](#ref-God1978a) are reported at lags 1 and 4. Small p-values support a correction. The **reading** column reports only which side of 2 the statistic lies on, and prints a direction even when **dw_p** is large, so read the p-value first. Use the Breusch-Godfrey columns when X includes lagged y, as Durbin-Watson is not valid then.

## How to Read the Correlograms of an AR(1) Regression

**ACF and PACF** shows three plots to lag 20 with bands at 1.96/sqrt(n): the autocorrelations and partial autocorrelations of the residuals, and the autocorrelations of the innovations. An AR(1) residual has a geometrically fading autocorrelation and one partial spike at lag 1. After a good fit, the innovation plot stays inside the bands, apart from the occasional crossing expected by chance. Spikes at several lags point to a higher order, and a spike at the seasonal lag points to a seasonal pattern. The panel has no model for either.

## How to Check Whether AR(1) Removed the Dependence

**Is AR(1) Enough?** computes v_t = e_t − rho e_(t−1) and applies the test of [Ljung and Box (1978)](#ref-LB1978a) over 10 lags. A large **ljung_box_innovations_p** means no dependence was detected, which is weaker than showing that none exists. A small value calls for a richer error model or a change of specification. The test runs without a degrees-of-freedom adjustment for the estimated rho, which makes it somewhat conservative. The same Next Step adds **jarque_bera_p**, using the normality test of [Jarque and Bera (1987)](#ref-JB1987a) on the innovations. A small value matters most for **Beach-MacKinnon** and for short samples.

## How to Check for Heteroskedasticity in an AR(1) Regression

**harvey_heteroskedasticity_p** in **Is AR(1) Enough?** reports a test for exponential heteroskedasticity. The test uses OLS residuals with X as the variance drivers, so it is computed before the correction and strong autocorrelation can affect its size. A small value suggests moving to **Linear Models with Heteroskedasticity + AR(1)**. For a view of the corrected model, read the innovation series in **Residuals over Time**: clusters of large values or a widening band point to a changing variance that this check may miss. The panel offers no variance test on the innovations, so a user who needs one can regress v_t squared on the suspected drivers.

## How to Read Residuals over Time After an AR(1) Fit

**Residuals over Time** plots the structural residuals e_t = y_t − x_t' b together with the innovations v_t = e_t − rho e_(t−1). Long runs of one sign are normal in the structural series when rho is positive and should vanish in the innovations. Runs that remain in the innovations suggest an omitted trend, a shift in level or a missing variable. Isolated large spikes deserve a check of the data, as they can move rho on their own.

## How to Test Sensitivity to the Choice of AR(1) Estimator

**All AR(1) Estimators** fits six estimators on the same data: both forms of Prais-Winsten and of Cochrane-Orcutt, **Hildreth-Lu** and **Beach-MacKinnon**. Close values of rho and coefficients show that the answer does not hinge on the method. A gap between the Prais-Winsten and Cochrane-Orcutt lines suggests that the first observation has leverage, which is common with trended regressors. A gap between iterated and two-step lines suggests a first-stage rho that is imprecise. This Next Step includes the Prais-Winsten fits, so it stops with a `DomainError` if their moment estimate of rho passes one in absolute value.

## References

<a id="ref-Bre1978a"></a>Breusch, T. S. (1978). Testing for autocorrelation in dynamic linear models. *Australian Economic Papers* 17(31), 334–355. [doi:10.1111/j.1467-8454.1978.tb00635.x](https://doi.org/10.1111/j.1467-8454.1978.tb00635.x)

<a id="ref-DW1950a"></a>Durbin, J. and Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. *Biometrika* 37(3-4), 409–428. [doi:10.1093/biomet/37.3-4.409](https://doi.org/10.1093/biomet/37.3-4.409)

<a id="ref-God1978a"></a>Godfrey, L. G. (1978). Testing against general autoregressive and moving average error models when the regressors include lagged dependent variables. *Econometrica* 46(6), 1293. [doi:10.2307/1913829](https://doi.org/10.2307/1913829)

<a id="ref-JB1987a"></a>Jarque, C. M. and Bera, A. K. (1987). A test for normality of observations and regression residuals. *International Statistical Review* 55(2), 163. [doi:10.2307/1403192](https://doi.org/10.2307/1403192)

<a id="ref-LB1978a"></a>Ljung, G. M. and Box, G. E. P. (1978). On a measure of lack of fit in time series models. *Biometrika* 65(2), 297–303. [doi:10.1093/biomet/65.2.297](https://doi.org/10.1093/biomet/65.2.297)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
