# Diagnostics

## Fitted Values
**Fitted Values** overlays on the data the one-step-ahead predictions, the data minus the Kalman filter innovations, or the LOESS trend. The first two predictions are left out as part of the diffuse start. One-step predictions that lag the data by one step are typical of a random-walk level: the model is mostly following the last value.

## Components
**Components** plots the smoothed states, up to three: level, slope, and the first seasonal state, or the LOESS trend and remainder. A slope that wanders strongly, or a seasonal state that changes shape, says the components are stochastic; if they barely move, a deterministic version may be enough.

## Residual Analysis
**Residual Analysis** plots the standardised residuals, the innovations divided by their standard deviations, over time and as a histogram. They should look like white noise with unit variance: no trend, no change in spread, roughly normal. Outliers beyond 3 point to unusual observations or breaks.

## Ljung-Box and ACF
**Ljung-Box and ACF** tests the residuals for autocorrelation up to 20 lags, or a quarter of the sample, and plots their autocorrelations with 95% bands +-1.96 / sqrt(n). For ARIMA, the degrees of freedom are reduced by the number of ARMA coefficients. A small p-value, or a spike at the seasonal lag, means structure left in the residuals: a missing seasonal component or too few AR lags.

## Rolling-Origin Backtest
**Rolling-Origin Backtest** refits the model at 8 origins from 70% of the sample to the end, forecasts up to 12 steps from each, and plots the mean absolute error by horizon. Error should grow smoothly with the horizon; a model whose error at step 1 is much worse than its in-sample fit is overfitting.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Fitted values | Track the data | Systematic gaps |
| Residuals | White noise | Trends, changing spread |
| Ljung-Box | p > 0.05 | p < 0.05, seasonal spike |
| Components | Plausible movement | Erratic or frozen |
| Backtest | Error grows smoothly | Large at short horizons |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
