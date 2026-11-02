# Assumptions — Linear Models with Autocorrelation

Each estimator in the panel replaces the assumption of uncorrelated errors with a specific alternative. The conditions that remain decide whether the corrected standard errors can be trusted.

## Why AR(1) Regression Requires Strictly Exogenous Regressors

Quasi-differencing mixes x_t with x_(t−1), and rho itself is computed from regression residuals, so the regressors must be uncorrelated with the errors at all leads and lags. A lagged dependent variable in **Regressors (X)** breaks this condition. OLS is then inconsistent when errors are autocorrelated, the first-stage residuals are contaminated, and every tab inherits the problem. Feedback from y to future x has a similar effect. The panel offers no test of exogeneity, so the argument has to come from how the data arise. For a regression with lags of y, read **breusch_godfrey_lag1_p** rather than **dw_p**, and consider a dynamic specification instead of this correction ([Greene (2018)](#ref-Gre2018a)).

## Why the AR(1) Form of the Errors Has to Be Right

All four tabs assume that one lag carries the whole dependence. Under AR(2), moving-average or seasonal errors, the estimate of rho summarises the wrong process and the GLS standard errors stay wrong. The usual signs are a significant Ljung-Box result in **Is AR(1) Enough?**, or innovation autocorrelations in **ACF and PACF** that leave the bands at lags beyond the first. The panel has no higher-order model. Options outside it are a richer error model, or OLS with the standard errors of [Newey and West (1987)](#ref-NW1987a), which do not assume a form for the dependence.

## Why AR(1) Estimators Assume Stationary Errors

The model needs the absolute value of rho to be less than one. A nearly non-stationary series gives a rho close to one and may indicate a spurious regression between trending variables, a case the correction does not cure. Behaviour at the limit differs by tab. The Prais-Winsten tabs stop with a `DomainError` when the moment estimate reaches one in absolute value, since sqrt(1 − rho²) then has no real value. **Hildreth-Lu** and **Beach-MacKinnon** return a value near the edge of their search range. Treat such a value as a warning, and consider differencing or testing the series for a unit root outside the panel.

## What Happens Under Non-Constant Innovation Variance in AR(1) Regression

The tabs assume that v_t has one variance throughout. Under heteroskedastic innovations the coefficients remain unbiased if the regressors are exogenous, but the standard errors from the transformed regression are unreliable and efficiency is lost. Look for periods of wide and narrow spread in **Residuals over Time**. The **harvey_heteroskedasticity_p** column in **Is AR(1) Enough?** gives a formal check, computed on OLS residuals before any correction. When the variance does change, the panel **Linear Models with Heteroskedasticity + AR(1)** handles both features together.

## Whether Normal Errors Are Needed for AR(1) Regression

Normality is part of the likelihood behind **Beach-MacKinnon**. The Prais-Winsten and **Hildreth-Lu** tabs do not need it in large samples, while their t and p values rest on approximate distributions in small ones. With non-normal errors, **Beach-MacKinnon** still gives a usable fit, though its likelihood is then a working approximation. **jarque_bera_p** in **Is AR(1) Enough?** tests the innovations. Heavy tails or a few outliers can distort rho, because a single large residual enters the sum of cross-products twice, so inspect **Residuals over Time** as well.

## Why Observations Must Be Equally Spaced for AR(1) Regression

Rho describes one step in the order of the rows, whatever the calendar says. Unsorted rows, missing periods or irregular spacing all give it a different meaning, and the panel does not check for them. Sort the data by time before fitting, and treat gaps explicitly. Structural breaks can also produce apparent autocorrelation, as a shift in level leaves long runs of same-signed residuals. An omitted trend or a wrong functional form does the same, so review the specification before accepting a correction.

## References

<a id="ref-Gre2018a"></a>Greene, W. H. (2018). *Econometric Analysis*, 8th ed. Pearson.

<a id="ref-NW1987a"></a>Newey, W. K. and West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. *Econometrica* 55(3), 703–708. [doi:10.2307/1913610](https://doi.org/10.2307/1913610)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
