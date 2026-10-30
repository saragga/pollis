# Assumptions

## The Model Structure
Each model assumes a way the series is generated:
- **Structural models** (local level, local linear trend, basic structural, unobserved components): the observation is a sum of components, level, slope, seasonal and noise, each evolving as a random walk with its own variance.
- **ETS**: a level, trend and season updated by exponential weights on each new error.
- **ARIMA**: after d differences, the series is a stationary ARMA(p, q) process.
The structure matters more than the estimation: a model without a seasonal component cannot forecast seasonality.

## Gaussian Errors
The likelihood and the prediction intervals assume normally distributed, independent disturbances with constant variance. Skewed or heavy-tailed errors leave the point forecasts usable but make the 95% intervals wrong in the tails. Variance that grows with the level is often fixed by modelling the logarithm of the series.

## Stable Parameters
The variances, smoothing weights or ARMA coefficients are assumed constant over the sample and the horizon. Structural breaks, a new regime or a policy change violate this; the backtest exposes it when the error grows at recent origins.

## Regular Spacing
Observations are equally spaced and in order, oldest first, with the seasonal **Period** in observations. Missing values can be handled by the Kalman filter as NaN, but irregular dates cannot.

## Diffuse Start
The initial states are unknown and given a diffuse prior: the first few observations, one per nonstationary state, are used to initialise the filter and are left out of the likelihood. Models with different numbers of nonstationary states have likelihoods on different samples, which matters when comparing them.

## LOESS
LOESS assumes only a smooth trend; it has no stochastic model, so no likelihood or prediction interval, and its extrapolation assumes the last local slope continues.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
