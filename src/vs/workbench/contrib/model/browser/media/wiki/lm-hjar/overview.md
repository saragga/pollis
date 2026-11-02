# Overview

Regression errors in time series can depend on their own past and can also grow and shrink in size. The panel models both features together, so that coefficients are weighted accordingly and their standard errors take both into account.

## Why a Regression Can Need Both an AR(1) and a Variance Correction

When the regressors are strictly exogenous, ordinary least squares remains unbiased with either problem present, but it is no longer efficient and its usual standard errors are wrong. A correction for autocorrelation alone still treats a volatile period and a calm one as equally informative. A correction for heteroskedasticity alone ignores what the previous error says about the current one. [Prais and Winsten (1954)](#ref-PW1954a) gave the transformation for the first problem that keeps the first observation. [Harvey (1976)](#ref-Har1976a) gave the log-linear variance model for the second, which keeps every fitted variance positive.

## What Model the Heteroskedasticity + AR(1) Panel Estimates

The regression is y_t = x_t' beta + u_t. Its error follows u_t = rho u_(t-1) + sigma_t e_t, and the variance of the innovation follows log(sigma_t^2) = z_t' gamma. The changing variance therefore belongs to the shock of each period, sigma_t e_t, and not directly to u_t. Dividing the quasi-differenced equation by sigma_t leaves errors that are independent with unit variance, when the model holds. Both tabs of the panel use this double transformation or an equivalent weighted fit. The first observation is scaled by sqrt(1 - rho^2) / sigma_1.

## How the Sequential and Joint Tabs Differ

**Sequential** treats the two problems in turn. Rho comes from a regression of residuals on their lag, gamma from a regression of log squared residuals on Z, and beta from weighted least squares on the quasi-differenced data. **Joint** writes down the Gaussian likelihood and chooses rho and gamma together, in the manner of the exact likelihood treatment of AR(1) errors by [Beach and MacKinnon (1978)](#ref-BM1978a). Beta then follows by GLS. **Joint** uses more of the information in the data if the errors are normal, and it depends on a numerical optimiser, where **Sequential** needs only least squares.

## What Two-Step and Iterated Mean in Each Tab

**Method** has a different effect in each tab. In **Sequential**, **Two-Step** stops after one pass, and **Iterated** repeats the pass with a refreshed rho until the changes are small. That limit is not a maximum of the likelihood, as gamma still comes from the log regression. In **Joint**, both settings aim at the same likelihood maximum. **Two-Step** reaches it directly, and **Iterated** by alternating between (rho, gamma) and beta. [Oberhofer and Kmenta (1974)](#ref-OK1974a) gave conditions under which such alternation reaches a maximum of the likelihood.

## How to Choose a Tab and Method for AR(1) with Heteroskedasticity

| Situation | Tab and **Method** | Why |
|---|---|---|
| A first estimate, or a large sample | **Sequential**, **Two-Step** | Uses least squares only, with no optimiser to fail |
| Coefficients still move when rho is updated | **Sequential**, **Iterated** | Carries the update through to a settled rho and beta |
| Errors plausibly normal and a likelihood is wanted | **Joint**, **Two-Step** | Estimates rho and gamma together, and reports `result.loglik` |
| Doubt about whether the optimiser found the best point | **Joint**, **Iterated** | Reaches the same target by a different route, as a cross-check |
| Only one problem is present | The panel for that problem | Fewer parameters to estimate |

Results that differ markedly across the tabs are a warning about the model or the sample, and no tab settles that by itself.

## A Common Workflow in the Heteroskedasticity + AR(1) Panel

Start with **Durbin-Watson Test**, **Harvey Test** and **Residual Diagnostics**, which look at OLS residuals and show whether both corrections are needed. Set **Variance regressors (Z) — optional** when something other than the regressors drives the variance, then choose a tab and a **Method** and run the generated code. **Estimated rho and gamma** reports the two sets of error parameters, and **Compare with OLS** shows how far the coefficients and standard errors moved. **Predictions** gives fitted values and a one-step forecast. Check `result.converged` by hand with **Iterated**, as the generated code does not print it.

## References

<a id="ref-BM1978a"></a>Beach, C. M. and MacKinnon, J. G. (1978). A maximum likelihood procedure for regression with autocorrelated errors. *Econometrica* 46(1), 51. [doi:10.2307/1913644](https://doi.org/10.2307/1913644)

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

<a id="ref-OK1974a"></a>Oberhofer, W. and Kmenta, J. (1974). A general procedure for obtaining maximum likelihood estimates in generalized regression models. *Econometrica* 42(3), 579. [doi:10.2307/1911792](https://doi.org/10.2307/1911792)

<a id="ref-PW1954a"></a>Prais, S. J. and Winsten, C. B. (1954). Trend estimators and serial correlation. Cowles Commission Discussion Paper.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
