# State-Space Inference — Factsheet

**State-space inference** estimates the unobserved state of a dynamic system, one time step at a time, from a model of how the state evolves and of how it is measured. The Kalman filter (Kalman 1960) solves the problem exactly when the model is linear and the noise Gaussian; the extended and unscented Kalman filters approximate it for nonlinear models, and particle filters (Gordon, Salmond and Smith 1993) represent the state's distribution by weighted samples, for models where no Gaussian approximation will do.

| | |
|---|---|
| **Purpose** | Estimate hidden states, with their uncertainty, from noisy measurements |
| **Input** | Inputs u and measurements y, one vector per time step; the dynamics, the measurement, the noise covariances Q and R, and the distribution of the initial state |
| **Core package** | [LowLevelParticleFilters.jl](https://github.com/baggepinnen/LowLevelParticleFilters.jl) |
| **Filters** | Kalman, extended Kalman, unscented Kalman, particle (bootstrap), Rao-Blackwellised particle |
| **Output** | Filtered states x(t\|t) and predictions x(t\|t-1) with their covariances (or weighted particles), innovations, and the log-likelihood |
| **Key choices** | The filter, which the model's nonlinearity and noise decide; Q and R, which set how much the filter trusts the model against the data |

## When to Use

- **Tracking and navigation**: positions and velocities from radar, GPS or inertial sensors.
- **Signal extraction** in economics and the sciences: a trend or level behind a noisy series, a time-varying coefficient, a volatility.
- **Control and system identification**: states for a controller, and the likelihood for estimating a model's parameters.
- **Online estimation**: each new measurement updates the estimate at a fixed cost, without refitting the past.

## What It Is Not

A filter does not find the model: it assumes the dynamics, the measurement and the noise levels are known, and gives answers only as good as they are. Unknown parameters are estimated outside the filter, by maximising its log-likelihood or by Bayesian methods that call it. And a filter is not a forecasting method for a single series without a model; for that, see the time-series panels.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
