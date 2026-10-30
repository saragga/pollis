# Interpretation

## Model Parameters
**Model Parameters** gives each estimated parameter with its standard error: the variances of the components for structural models, the smoothing weights for ETS, the AR and MA coefficients for ARIMA. For LOESS, the span and degree, and how many observations each local fit uses.

## Adaptiveness
**Adaptiveness** says how fast the model reacts to new data:
- **Structural models**: each component variance relative to the noise variance, the signal-to-noise ratio. A ratio near 0 gives a nearly fixed component; a large ratio, one that follows the data closely.
- **ETS**: each smoothing weight and its memory, about 1 / weight observations. A level weight of 0.1 averages roughly the last 10 observations; 0.9, the last one.
- **ARIMA**: the persistence of the AR part and the half-life of a shock, on the differenced series; with d of 1 or more every shock also shifts the level permanently.
- **LOESS**: the window size: larger windows react more slowly.

## Forecast with Intervals
**Forecast with Intervals** plots the forecast h steps ahead with its prediction bands from the state-space form. They widen with the horizon, fast for random-walk components and ARIMA with differencing, slowly for stationary or deterministic ones. LOESS draws a straight extrapolation, without a band.

## Forecast Table
**Forecast Table** lists the mean forecast and the 95% interval, mean +-1.96 standard deviations, at each step. The interval covers the future value 95% of the time only if the model and its Gaussian errors are right; the backtest shows whether that is plausible.

## Information Criteria
**Information Criteria** fits a local level, a local linear trend, a basic structural model, the best ETS and the best ARIMA, and lists AIC, AICc and BIC with the number of observations in each likelihood. Lower is better, but only rows with the same number of observations are comparable: models with more diffuse states leave out more start-up observations. Across them, the backtest is the fair comparison.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
