# Assumptions

Every filter in the panel shares the assumptions of the state-space model; the Kalman-type filters add assumptions about the shape of the noise.

## The State-Space Model
- **Markov state**: the state at t+1 depends on the past only through the state at t (and the known input u). Anything else that drives the system must be in the state or in the input.
- **Measurements depend only on the current state**: given x(t), the measurement y(t) carries no further information about other times.
- **Known model**: the dynamics f, the measurement h and the noise covariances Q and R are given, not estimated by the filter. A wrong model gives wrong states with confident-looking uncertainties.
- **White noise**: the process noise w and the measurement noise e have zero mean, are independent over time and independent of each other. Correlated noise belongs in the state (an extra state that follows an autoregression, for example).
- **Initial state**: x(0) has a known distribution, N(mu0, Sigma0) in the panel. A wide Sigma0 says little is known, and the first measurements then dominate.

## Kalman-Type Filters
- **Kalman filter**: linear dynamics and measurement, Gaussian noise. Under these assumptions it is the exact posterior; with non-Gaussian noise it is still the best linear estimator, but its intervals are no longer exact.
- **Extended Kalman filter**: f and h differentiable, and close to linear over the spread of the state's uncertainty.
- **Unscented Kalman filter**: the state's distribution well summarised by its mean and covariance, so a unimodal posterior.

## Particle Filters
- **Particle filter**: it must be possible to sample the dynamics and to evaluate the density of each measurement given the state; no linearity or Gaussian shape is needed. The number of particles must be large enough for the dimension of the state.
- **Rao-Blackwellised filter**: the state splits into a nonlinear part and a part that, given the nonlinear part, is linear and Gaussian, and the noise of the nonlinear part is Gaussian when the linear part enters its dynamics.

## Observability
The measurements must carry enough information about the state. If two states always produce the same measurements (a measurement that depends on x squared cannot tell x from -x, for example), no filter can tell them apart, and the uncertainty in that direction does not shrink.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Factsheet](factsheet.md)
