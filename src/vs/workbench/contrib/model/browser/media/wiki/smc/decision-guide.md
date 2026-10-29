# Decision Guide

| Situation | Method |
|---|---|
| Linear-Gaussian state-space model | **Kalman filter and smoother**: exact |
| Mildly nonlinear, near-Gaussian | Extended or unscented Kalman filter |
| Nonlinear or non-Gaussian, low-dimensional state | **Particle Filter** |
| States given all the data, whole paths | **Particle Smoother** (forward filtering, backward simulation) |
| Very informative observations, outliers | A guided or auxiliary particle filter, not the bootstrap |
| Partly linear model | A Rao-Blackwellised particle filter |
| Unknown static parameters | Particle MCMC (PMMH) using the likelihood estimate, or SMC squared |
| A static posterior, no time structure | An SMC sampler with tempering, or MCMC |

## Decision Flow

1. **Is the model linear-Gaussian?** Use the Kalman filter.
2. **Is the state low-dimensional?** If not, the bootstrap filter will need too many particles: look at Rao-Blackwellisation or ensemble methods.
3. **Run the bootstrap filter** with a few hundred to a few thousand particles and a threshold of 0.5.
4. **Check the ESS** at each step, and repeat runs to see the variability of the log-likelihood estimate.
5. **Increase N** until the estimates of interest are stable across runs; switch to a better proposal if the ESS keeps collapsing.
6. **For whole paths or early states**, run the backward-simulation smoother, not the filter's genealogy.

## Rules of Thumb

- **Threshold**: resample when ESS falls below N / 2; LowLevelParticleFilters defaults to 0.1.
- **N of order T** keeps the variance of the log-likelihood estimate bounded for parameter inference; aim for a standard deviation of about 1 to 2 in the log estimate for PMMH.
- **Systematic resampling**, the default, adds the least noise among the common schemes.
- **Small r relative to q** is the bootstrap filter's weak spot: the observation is sharp and the prior proposal broad.
- **M from 100 to a few hundred** backward trajectories suffices for smoothed means and bands; the cost is about M x N x T.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
