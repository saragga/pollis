# Interpretation

## Three Estimates of the Same State
- **Prediction** x(t|t-1): the state at t, given the measurements up to t-1. It is what the model expects before the new measurement arrives.
- **Filtered estimate** x(t|t): the state at t, given the measurements up to t. It is what can be known in real time.
- **Smoothed estimate** x(t|T): the state at t, given all the measurements, including the later ones. It is only available offline, and its variance is never larger than the filtered one.

In the package's solution object these are `sol.x`, `sol.xt` and, after `smooth`, `xT`; their covariances are `sol.R`, `sol.Rt` and `RT`.

## Uncertainty
The covariance of the filtered estimate is the filter's own statement of how well it knows the state; its diagonal holds the variance of each component. Shown by **State Uncertainty**:

- it starts at Sigma0 and, for a well-posed linear model, settles to a steady value after a few steps;
- it grows where measurements are missing or uninformative, and in components the measurements do not reach;
- it is only as trustworthy as Q and R: an overconfident filter (see [Diagnostics](diagnostics.md)) reports small variances around wrong estimates.

## Q and R: Trusting the Model or the Data
The filter weighs the prediction against the measurement through the **Kalman gain**. What matters is the ratio of Q to R, more than either alone:

- **Q large relative to R**: the state is expected to move a lot, so each measurement pulls the estimate strongly. Estimates are responsive and noisy.
- **Q small relative to R**: the state is expected to be stable and measurements noisy, so the estimate follows the model and moves slowly. Estimates are smooth but lag behind real changes.

When Q and R are not known, the values that maximise the log-likelihood are the usual estimates.

## The Log-Likelihood
The filter computes log p(y(1), ..., y(T) | model) as the sum of the log densities of the innovations. Its value alone means little: it depends on the number of observations and on the units of y. Differences between models fitted to the same data are what count. For particle filters it is a random estimate, unbiased for the likelihood itself, not for its logarithm.

## Nonlinear Models
With a nonlinear model the posterior may be skewed or have several modes. The extended and unscented filters still report a single mean and covariance, which can sit between two modes, where the state never is. A particle filter's weighted particles show the whole distribution, and their mean is only one summary of it.

## See Also
- [Diagnostics](diagnostics.md) · [Kalman Filter](kalman-filter.md) · [Overview](overview.md)
