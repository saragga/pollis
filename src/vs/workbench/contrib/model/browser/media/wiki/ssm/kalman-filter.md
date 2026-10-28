# Kalman Filter

The Kalman filter (Kalman 1960) is the exact solution of the filtering problem for a linear model with Gaussian noise:

    x(t+1) = A x(t) + B u(t) + w(t),    w ~ N(0, Q)
    y(t)   = C x(t) + D u(t) + e(t),    e ~ N(0, R)

Because a linear transformation of a Gaussian is Gaussian, the state's distribution stays Gaussian, and its mean and covariance are all the filter needs to carry.

## One Step
**Predict** with the dynamics:

    xhat(t|t-1) = A xhat(t-1|t-1) + B u(t-1)
    P(t|t-1)    = A P(t-1|t-1) A' + Q

**Update** with the measurement:

    e(t) = y(t) - C xhat(t|t-1)          innovation
    S(t) = C P(t|t-1) C' + R             its covariance
    K(t) = P(t|t-1) C' S(t)^(-1)         Kalman gain
    xhat(t|t) = xhat(t|t-1) + K(t) e(t)
    P(t|t)    = (I - K(t) C) P(t|t-1)

The gain K decides how far the estimate moves towards the measurement: large when the prediction is uncertain (P large) and the measurement precise (R small), small otherwise.

## In the Package
`KalmanFilter(A, B, C, D, Q, R, d0)` builds the filter, with d0 the distribution of the initial state; the package calls the noise covariances R1 and R2. `forward_trajectory(kf, u, y)` runs it over the data and returns the predictions, the filtered estimates, their covariances, the innovations and the log-likelihood. `smooth(sol, kf)` runs the Rauch-Tung-Striebel smoother backwards over the result.

## The Local Level Model
The simplest useful case has one state and A = C = 1: the observed series is a level that follows a random walk, plus noise. Its filtered estimate is an exponentially weighted moving average whose weight is set by Q / R, and its log-likelihood estimates that ratio.

## See Also
- [Extended and Unscented](nonlinear-kalman.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
