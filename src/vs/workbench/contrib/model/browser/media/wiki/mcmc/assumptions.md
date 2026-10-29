# Assumptions

## All Samplers
- **A proper target.** The density must integrate to a finite value. An improper posterior (from an improper prior and too few data) has no distribution to converge to, and the chains drift.
- **Ergodicity.** The chain can reach every region of the target from every other. A target with well-separated modes may be ergodic in theory but not in practice: a chain stays in one mode for the whole run.
- **Warm-up is discarded.** The first draws depend on the starting point; the summaries assume they have been dropped.
- **Enough draws.** The precision of every estimate depends on the effective sample size, not the number of draws.

## NUTS and HMC
- **Continuous parameters** on an unconstrained space. Turing transforms constrained parameters (a positive sigma, a probability) automatically; with AdvancedHMC, the log density must be defined on all of R^d, so constrained parameters need a transformation, with its log-Jacobian added.
- **A differentiable log density**, with gradients from automatic differentiation. Discontinuities and kinks break the Hamiltonian dynamics.
- **Moderate curvature.** A single step size must work everywhere. Regions of high curvature, such as the neck of a funnel, cause **divergent transitions**.

## Metropolis-Hastings
- **A proposal that matches the target's scale.** Proposals that are too wide are almost always rejected; too narrow, they are accepted but move little. Either way the chain mixes slowly.
- **Few parameters.** The efficiency of a random-walk proposal falls quickly as the dimension grows.
- **The default proposal.** Turing's MH() with no arguments proposes each parameter from its prior, independently of the current point. This works when the posterior is close to the prior, and badly when the data have narrowed it. A covariance matrix, MH(Sigma), gives a random-walk proposal instead.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
