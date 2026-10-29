# Decision Guide

| Situation | Sampler | Why |
|---|---|---|
| Continuous parameters, model in Turing | **NUTS** | Tunes itself; nearly independent draws |
| A log density written by hand, full control | **HMC** (AdvancedHMC) | Choose the integrator, metric and trajectory |
| Studying the effect of the trajectory length | **HMC** | The number of leapfrog steps is fixed and visible |
| No gradient, or a few parameters | **Metropolis-Hastings** | Needs only density values |
| Discrete parameters | **Metropolis-Hastings**, or Gibbs combinations in Turing | Gradient samplers need continuous parameters |
| Many modes | Several chains from spread-out starts, or tempering methods | A single chain stays in one mode |

## Decision Flow

1. **Are all parameters continuous and the density differentiable?** Use NUTS. Otherwise, Metropolis-Hastings or a Gibbs combination.
2. **Run several chains** and check R-hat, ESS and divergences.
3. **Divergences?** Raise the target acceptance, then reparametrise (non-centred hierarchical models).
4. **Low ESS with Metropolis-Hastings?** Tune the proposal scale, or move to a gradient-based sampler.
5. **Compare samplers** by ESS per second, not by draws.

## Choosing the Settings
- **Warm-up**: as many as the draws kept is a safe default for NUTS; fewer may do for simple targets.
- **Leapfrog steps (HMC)**: too few and the sampler moves like a random walk; too many and it wastes gradient evaluations, or comes back to its start. NUTS removes this choice.
- **Samples**: enough for an ESS of a few hundred per chain for the quantities you report.

## Rules of Thumb
- **NUTS first**, always, for continuous models.
- **Check before reading**: no summary before R-hat and ESS.
- **ESS per second**, not draws per second.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
