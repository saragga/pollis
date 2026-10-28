# Decision Guide

The model decides the filter: how nonlinear the dynamics and the measurement are, and whether the noise and the state's distribution are close to Gaussian.

| Filter | Model | Cost | Strength | Weakness |
|---|---|---|---|---|
| **Kalman** | Linear, Gaussian | Lowest | Exact; gives the exact likelihood | Linear models only |
| **Extended Kalman** | Mildly nonlinear, differentiable | Low | Simple; one linearisation per step | Poor or divergent when the nonlinearity is strong over the state's spread |
| **Unscented Kalman** | Nonlinear, unimodal | Low (2 nx + 1 sigma points) | No derivatives; more accurate than the EKF at the same order of cost | Still a single Gaussian: cannot show skewness or several modes |
| **Particle** | Any; non-Gaussian noise, several modes | High (N particles per step) | Represents any distribution | Needs many particles as the state dimension grows; random results |
| **Rao-Blackwellised** | Part nonlinear, part linear-Gaussian | Medium | Particles only for the nonlinear part, exact Kalman updates for the rest | Needs that split in the model |

## Choosing
1. **Is the model linear with Gaussian noise?** Use the Kalman filter. Nothing does better.
2. **Nonlinear, but the posterior has one mode?** Use the unscented Kalman filter; the extended filter is the classical alternative when derivatives are cheap and the nonlinearity mild.
3. **Strongly nonlinear, or a posterior with several modes?** A measurement that loses information (a square, an absolute value, a threshold) is the usual cause. Use the particle filter.
4. **High-dimensional, but most of the state enters linearly?** Use the Rao-Blackwellised filter, which needs particles only for the nonlinear part.

## Checking the Choice
Run **Compare Filters**: on the same model and data, a linear model gives the same estimates from the Kalman, extended and unscented filters, and a nonlinear one shows where they part ways. When the data are simulated, it also gives each filter's error against the true state. Prefer the cheaper filter when the log-likelihoods are close.

## Filtering or Smoothing
Use the **filter** when estimates are needed as data arrive (control, tracking, live monitoring). Use the **smoother** when the whole record is available and the best estimate of the past is the goal (historical analysis, estimating parameters).

## See Also
- [Kalman Filter](kalman-filter.md) · [Extended and Unscented](nonlinear-kalman.md) · [Particle Filters](particle-filters.md)
