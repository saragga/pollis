# Particle Filters

A particle filter (Gordon, Salmond and Smith 1993; Doucet, Godsill and Andrieu 2000) represents the state's distribution by **N weighted samples**, the particles, instead of a mean and a covariance. With enough particles it approximates any distribution: skewed, heavy-tailed or with several modes.

## The Bootstrap Filter
At each step:

1. **Propagate**: move each particle through the dynamics, adding a draw of the process noise.
2. **Weight**: multiply each particle's weight by the density of the new measurement given that particle.
3. **Resample**: when the weights become too uneven (the effective number of particles falls below a threshold), draw a new set of particles in proportion to the weights, so that the computation is not spent on particles with negligible weight.

The filtered estimate is the weighted mean of the particles (`mean_trajectory` in the package); their weighted covariance (`weighted_cov`) measures its uncertainty.

## In the Package
`ParticleFilter(N, dynamics, measurement, noise_dist, meas_dist, d0)` takes the dynamics and the measurement as functions, and the process noise, the measurement noise and the initial state as distributions, which need not be Gaussian. `forward_trajectory` returns the particles and their weights at every step. `smooth(pf, M, u, y)` draws M smoothed trajectories by forward-filtering backward-simulation.

## How Many Particles
The error of a particle estimate shrinks like 1 / sqrt(N), but the N needed grows quickly with the dimension of the state, and is larger when the measurements are precise (most particles then land where the measurement density is small). **Particle Count** shows the trade-off: the spread of the log-likelihood over repeated runs, against the time per run.

## The Rao-Blackwellised Filter
When the state splits into a nonlinear part xn and a part xl that is linear and Gaussian given xn, the **Rao-Blackwellised** (or marginalised) particle filter (Schon, Gustafsson and Nordlund 2005) samples only xn, and gives each particle its own Kalman filter for xl. Integrating xl out exactly reduces the variance of the estimates, so far fewer particles are needed than for the whole state. In the package it is `RBPF`, built from a `KalmanFilter` for the linear part and the nonlinear part's dynamics and measurement.

## Limits
- Results are random: set the random seed for repeatable runs, and check that conclusions hold across runs.
- The log-likelihood is an unbiased estimate of the likelihood, not of its logarithm, and it is noisy, which makes direct optimisation of parameters harder than with a Kalman filter.

## See Also
- [Extended and Unscented](nonlinear-kalman.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
