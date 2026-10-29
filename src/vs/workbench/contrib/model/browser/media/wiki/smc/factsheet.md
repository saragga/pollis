# Sequential Monte Carlo — Factsheet

A **particle filter** approximates the filtering distribution p(x[t] | y[1:t]) of a state-space model by N weighted particles, updated at each time step by **propagation** through the dynamics, **weighting** by the observation likelihood, and **resampling** when the weights degenerate. The product over time of the average unnormalised weights estimates the likelihood p(y[1:T]) **without bias**.

| | |
|---|---|
| **Purpose** | Estimate hidden states and the likelihood of a state-space model; here, measure the accuracy of the particle approximation against the exact Kalman answer |
| **Input** | The model coefficients and noise variances, the initial distribution, the number of particles N and of steps T, the resampling threshold, the smoother trajectories M, and a seed |
| **Core packages** | [LowLevelParticleFilters.jl](https://github.com/baggepinnen/LowLevelParticleFilters.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [StaticArrays.jl](https://github.com/JuliaArrays/StaticArrays.jl) |
| **Models** | Particle Filter, Particle Smoother |
| **Output** | Filtering means and standard deviations, the log-likelihood estimate, the ESS at each step, smoothed trajectories; the exact Kalman values beside them |
| **Key choice** | The number of particles and the proposal; the resampling threshold |

## When to Use

- **Nonlinear or non-Gaussian state-space models**: tracking, stochastic volatility, epidemic models, population dynamics, robotics localisation, where the Kalman filter does not apply and its extensions approximate poorly.
- **Likelihood estimation** for parameter inference: the unbiased likelihood estimate drives particle marginal Metropolis-Hastings (PMMH) and other pseudo-marginal methods.
- **Online estimation**, where data arrive one at a time and the state must be updated as they do.

## What It Is Not

Not efficient for linear-Gaussian models, where the Kalman filter is exact and far cheaper; this panel uses one only to check the particles. Not suited, in its bootstrap form, to **high-dimensional states**: the number of particles needed grows exponentially with the dimension. Not a parameter estimator by itself: the parameters here are fixed inputs.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
