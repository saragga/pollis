# Overview

The State-Space Inference Methods panel estimates the **hidden state** of a dynamic system from noisy measurements. A state-space model has two parts:

    x(t+1) = f(x(t), u(t), t) + w(t)      dynamics: how the state moves
    y(t)   = h(x(t), u(t), t) + e(t)      measurement: what is observed

The state x is never seen directly: position and velocity behind radar returns, the true level of a river behind noisy gauge readings, a volatility behind returns. A **filter** combines what the dynamics predict with what each new measurement says, weighting each by its uncertainty, and returns at every time step an estimate of the state and of how uncertain it is.

## What the Panel Does
- Builds one of five filters from LowLevelParticleFilters.jl: the Kalman filter, the extended and unscented Kalman filters, the particle filter and the Rao-Blackwellised particle filter (see [Kalman Filter](kalman-filter.md), [Extended and Unscented](nonlinear-kalman.md) and [Particle Filters](particle-filters.md)).
- Runs it forward over the data with `forward_trajectory`, and prints the log-likelihood and the filtered state at the last time step.
- Takes the data as a named tuple with fields `u` (inputs) and `y` (measurements), each a vector with one vector per time step.

## Common Workflow

1. Write the model: the state and measurement dimensions, the dynamics, the measurement, and the noise covariances Q and R.
2. Run **Simulate Forward** before filtering: data simulated from the model should look like the real data.
3. Filter, then plot **State Estimates** and **State Uncertainty**.
4. Check the model with the **Innovation Sequence**: if the model is right, the innovations are white noise.
5. Tune Q and R, or compare models, by their **Log-Likelihood**.
6. For offline analysis, use **Filter vs Smoother** or **Smoothed States**: the smoother also uses the measurements that came later.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
