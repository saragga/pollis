# Assumptions

## A Correct State-Space Model
The filter assumes the state is **Markov** (the next state depends on the past only through the current one) and the observations are **conditionally independent** given the states. The transition and observation densities must be correct: a misspecified model is filtered faithfully, and the particles track the wrong posterior. Here the model is the one the data were simulated from, which isolates the error of the approximation.

## Simulable Dynamics and Computable Likelihood
The bootstrap filter needs only to **simulate** from the transition and to **evaluate** the observation density p(y | x). The particle smoother also needs the **transition density**, to reweight particles backwards. Models whose transitions can be simulated but not evaluated need other smoothers.

## Overlap Between Proposal and Posterior
The bootstrap filter proposes from the dynamics, ignoring the new observation. It works when the observation is not much more informative than the prediction: the **Observation Noise Variance r** not much smaller than the predictive variance. A sharp likelihood (small r), an outlier, or a large jump in the state concentrates the weight on a few particles, and the estimate collapses. Guided or auxiliary filters, which propose using the observation, address this.

## Enough Particles
Particle estimates converge as N grows, with errors of order 1 / sqrt(N) at each step. For the likelihood, the variance of the log estimate grows roughly linearly with T at fixed N, so longer series need more particles: N of order T keeps it stable. For filtering, a few hundred to a few thousand particles usually suffice in one or two dimensions.

## Low State Dimension
The weights degenerate exponentially fast with the dimension of the state (or of the observation): the bootstrap filter is practical for states of a few dimensions. Higher dimensions need better proposals, Rao-Blackwellisation (filtering the linear part exactly) or other methods.

## Mixing of the State
The filter forgets its initial distribution and its errors over time when the state process **mixes**. A non-stationary state (a = 1, a random walk) or static parameters inside the state do not mix, and errors accumulate: path degeneracy then affects even the filter.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
