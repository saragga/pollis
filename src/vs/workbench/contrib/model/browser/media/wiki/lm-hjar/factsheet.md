# Factsheet

The Linear Models with Heteroskedasticity + AR(1) panel fits a linear regression to data ordered in time when the errors are autocorrelated and their variance changes as well. Two tabs estimate the same model in different ways, and each runs once or until it settles.

## What the Heteroskedasticity + AR(1) Panel Does

| Item | Description |
|---|---|
| **Purpose** | Coefficients and standard errors of a linear regression with first-order autocorrelated errors and a modelled variance |
| **Julia stack** | HARE.jl for the estimators and the Harvey test, GLM.jl for the OLS baseline, HypothesisTests.jl for the Durbin-Watson test, Plots.jl for the charts |
| **Mean equation** | y_t = x_t' beta + u_t |
| **Error equation** | u_t = rho u_(t-1) + sigma_t e_t, with e_t standard normal |
| **Variance equation** | log(sigma_t^2) = z_t' gamma |
| **Tabs** | **Sequential**, **Joint** |
| **Key choice** | Whether to correct one problem after the other or to estimate rho and gamma together |

## Which Inputs the Heteroskedasticity + AR(1) Panel Takes

| Input | Shape | Note |
|---|---|---|
| **Covariate matrix (X)** | T by k | No column of ones, as HARE.jl adds the intercept |
| **Response vector (y)** | T by 1 | Must be in time order, since rows are read as consecutive periods |
| **Variance regressors (Z) — optional** | T by q | No column of ones. The default `nothing` uses **Covariate matrix (X)** with its intercept |
| **Method** | **Two-Step** or **Iterated** | Sets how often the estimates are updated |

The first entry of gamma is always the intercept of the variance equation. The tolerance of 1e-8 and the limit of 100 iterations of **Iterated** are HARE.jl defaults and have no inputs in the panel.

## Which HARE.jl Function Each Tab and Method Calls

| Tab and **Method** | Function | How rho and gamma are found | When the estimation stops |
|---|---|---|---|
| **Sequential**, **Two-Step** | `two_step_sequential` | Regression of OLS residuals on their lag, then regression of log squared residuals on Z | After one pass |
| **Sequential**, **Iterated** | `iterated_sequential` | The same regressions, with rho refreshed from the latest coefficients | When beta and rho change by less than 1e-8, or after 100 passes |
| **Joint**, **Two-Step** | `two_step_joint` | Likelihood with beta concentrated out, maximised by L-BFGS | When the optimiser stops |
| **Joint**, **Iterated** | `iterated_joint` | Likelihood with beta held fixed, alternating with a GLS step for beta | When beta and rho change by less than 1e-8, or after 100 passes |

## What the Result of a HARE.jl Fit Contains

| Field or call | Content |
|---|---|
| `coeftable(result)` | Coefficients with their standard errors, which the panel displays |
| `result.rho` | Estimated autocorrelation of the regression errors, which the panel prints |
| `result.gamma` | Variance equation coefficients, intercept first, which the panel prints |
| `result.gamma_vcov` | Covariance matrix of gamma, not printed |
| `result.converged`, `result.iterations` | Convergence flag and number of passes, not printed |
| `residuals(result)`, `fitted(result)` | Regression errors y - X beta and the fitted values X beta, in the original units |
| `result.loglik` | Log-likelihood, without its constant, on **Joint** only |

## See Also

- [Overview](overview.md) · [Sequential Method](sequential.md) · [Joint Method](joint.md)
