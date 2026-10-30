# Time-Series Forecasting — Factsheet

**Time-series forecasting** predicts the future values of a series from its own past, with intervals that say how uncertain the predictions are. This panel puts the classical forecasting models in one **state-space** framework: local level and trend, basic structural, exponential smoothing (ETS), ARIMA and unobserved components models, all estimated by maximum likelihood with the Kalman filter in StateSpaceModels.jl. LOESS smoothing explores the trend without a model.

| | |
|---|---|
| **Purpose** | Forecast a univariate series h steps ahead with prediction intervals, and decompose it into trend and seasonality |
| **Input** | One series, oldest first; the horizon; the model and its trend, seasonality, order or smoothing settings |
| **Core packages** | [StateSpaceModels.jl](https://github.com/LAMPSPUC/StateSpaceModels.jl), [Loess.jl](https://github.com/JuliaStats/Loess.jl) |
| **Models** | LOESS, Local Level / Trend, Seasonal Model, ETS Framework, ARIMA, Unobserved Components |
| **Output** | Estimates with standard errors, smoothed components, forecasts with 95% intervals, residual diagnostics, information criteria and backtest errors |
| **Key choice** | How the trend and the seasonality evolve: fixed, stochastic, damped, or differenced away |

## When to Use

- **Demand, sales and workload** forecasts, monthly or quarterly.
- **Economic indicators**: a level and a trend that drift.
- **Seasonal series** whose pattern may change over time.

## What It Is Not

Not a model with explanatory variables: these models use the series alone. Not for many related series jointly, nor for volatility (see the GARCH panels). Long horizons extrapolate the last trend and seasonality: the intervals, which widen with the horizon, are part of the forecast.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
