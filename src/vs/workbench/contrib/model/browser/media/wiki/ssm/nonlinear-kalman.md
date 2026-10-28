# Extended and Unscented Kalman Filters

For a nonlinear model, x(t+1) = f(x(t), u(t), t) + w(t) and y(t) = h(x(t), u(t), t) + e(t), the state's distribution is no longer Gaussian. The extended and unscented filters keep the Kalman filter's structure and approximate the distribution by a Gaussian at each step. They differ in how they push that Gaussian through f and h.

## Extended Kalman Filter
The EKF **linearises**: it replaces f and h by their first-order Taylor expansions around the current estimate, and applies the Kalman equations with the Jacobians in place of A and C.

- The Jacobians are computed by automatic differentiation (ForwardDiff) in LowLevelParticleFilters, so only f and h need to be written.
- It works well when f and h are close to linear over the spread of the state's uncertainty.
- It fails when they are not: the linearisation at a poor estimate can point the wrong way, and the filter may diverge. A measurement such as x squared, whose derivative is zero at x = 0 and which cannot tell x from -x, is the classic case.

## Unscented Kalman Filter
The UKF (Julier and Uhlmann 1997; Wan and van der Merwe 2000) **samples deterministically**: it picks 2 nx + 1 **sigma points** that have the mean and covariance of the current estimate, passes each through f or h, and computes the mean and covariance of the results.

- No derivatives are needed, and f and h may be non-differentiable.
- It captures the mean and covariance to second order, against first order for the EKF, at a similar cost.
- It still ends with one Gaussian, so it cannot represent a skewed or multimodal posterior.

## In the Package
`ExtendedKalmanFilter(dynamics, measurement, Q, R, d0; nu)` and `UnscentedKalmanFilter(dynamics, measurement, Q, R, d0; nu, ny)` take the dynamics and the measurement as Julia functions of (x, u, p, t). Both run with `forward_trajectory`, and both can be smoothed with `smooth`.

## Which One
Prefer the UKF unless the Jacobians are needed for something else, or the EKF is known to work for the model. When both struggle, the posterior probably has more than one mode: use a [particle filter](particle-filters.md).

## See Also
- [Kalman Filter](kalman-filter.md) · [Particle Filters](particle-filters.md) · [Decision Guide](decision-guide.md)
