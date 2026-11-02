# Factsheet — Linear Models with Autocorrelation

**Linear Models with Autocorrelation** fits a regression whose errors carry memory from one period to the next, using the first-order autoregressive estimators of `HARE.jl`. Every tab estimates the same model and differs in how it finds rho.

## What the Linear Models with Autocorrelation Panel Does

| Item | Detail |
|---|---|
| Purpose | Estimate regression coefficients and the error autocorrelation rho from a time series, with standard errors that allow for AR(1) errors |
| Julia stack | `HARE.jl` for estimators and tests, `GLM.jl` for least squares, `HypothesisTests.jl`, `StatsBase.jl` and `Plots.jl` for the Next Steps |
| Model | y_t = x_t' beta + u_t and u_t = rho u_(t−1) + v_t, where v_t is uncorrelated with constant variance |
| Input shape | **Regressors (X)** is a T x k matrix in time order without a column of ones, and **Response (y)** is a vector of length T |
| Intercept | Added by `HARE.jl` in every tab |
| Forecast input | **Future regressors**, one row per step ahead; the default `Xm[end-4:end, :]` is a placeholder for real future values |
| Key choice | How rho is estimated, and whether the first observation stays in the sample |

## How the Tabs of the Autocorrelation Panel Differ

| Tab | Function | How rho is found | First observation | Stopping rule |
|---|---|---|---|---|
| **Prais-Winsten (2-Step)** | `two_step_prais_winsten` | Moment estimate from OLS residuals, once | Kept, scaled by sqrt(1 − rho²) | One pass |
| **Prais-Winsten (Iterated)** | `iterated_prais_winsten` | Moment estimate recomputed from each fit | Kept, scaled by sqrt(1 − rho²) | Rho moves by less than 1e-8, at most 100 passes |
| **Hildreth-Lu** | `hildreth_lu` | Smallest residual sum of squares over 200 values from −0.99 to 0.99 | Dropped | End of the grid |
| **Beach-MacKinnon** | `beach_mackinnon` | Exact concentrated likelihood, searched by Brent's method over (−0.999, 0.999) | Kept, scaled by sqrt(1 − rho²) | Absolute tolerance 1e-10 |

## Which Next Steps the Autocorrelation Panel Offers

| Group | Next Step | What it reports |
|---|---|---|
| Visualise | **Residuals over Time** | Structural residuals and innovations in time order |
| Visualise | **ACF and PACF** | Correlograms to lag 20 with bands at 1.96/sqrt(n) |
| Diagnose | **Serial Correlation Tests** | Durbin-Watson and Breusch-Godfrey at lags 1 and 4, on OLS residuals |
| Diagnose | **Is AR(1) Enough?** | Ljung-Box and Jarque-Bera on innovations, Harvey on OLS residuals |
| Predict | **One-Step Predictions** | In-sample error with and without the rho term |
| Predict | **Forecast** | Point forecasts with 95% intervals |
| Compare | **Compare with OLS** | OLS and corrected estimates with their standard errors |
| Compare | **All AR(1) Estimators** | Six estimators side by side |
| Interpret | **Autocorrelation Strength** | Rho, its interval, half-life, effective sample size |
| Interpret | **Coefficients** | Estimates, t, p and 95% intervals |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
