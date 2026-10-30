# Time-Series Forecasting — Overview

**Data variable** is the series, a vector of Float64, and **Horizon** the number of steps to forecast, 12 by default.

## The Models
- **LOESS**: locally weighted regression on time, with **Span**, the share of the data in each local fit, and **Degree**, linear or quadratic. Its forecast extrapolates the last local slope: an exploratory tool, not a forecasting model.
- **Local Level / Trend**: the **Model Type** **Local Level** is a random-walk level plus noise; **Local Linear Trend** adds a stochastic slope.
- **Seasonal Model**: the basic structural model, level plus slope plus a seasonal component of **Period** 12 for monthly, 4 for quarterly data.
- **ETS Framework**: exponential smoothing in state-space form. **Trend** is **None** (simple exponential smoothing), **Additive** (Holt) or **Damped**, a trend that flattens over the horizon; **Period** 0 means no seasonality.
- **ARIMA**: **Order (p, d, q)**, autoregressive lags, differences and moving-average lags, (1, 1, 1) by default.
- **Unobserved Components**: a chosen **Trend**, Local Level, Random Walk, Local Linear Trend or Smooth Trend, and **Seasonality**, Stochastic, Deterministic or None.

Every model but LOESS is fitted by maximum likelihood through the Kalman filter and printed with print_results.

## Common Workflow

1. Set the **Data variable** and the **Horizon**; explore with **LOESS**.
2. Choose a model and its settings; fit.
3. Look at the **Fitted Values** and the **Components**.
4. Run the **Residual Analysis** and the **Ljung-Box and ACF**.
5. Compare the **Information Criteria** and the **Rolling-Origin Backtest**.
6. Read the **Forecast with Intervals**, the **Forecast Table**, the **Model Parameters** and the **Adaptiveness**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
