# Decision Guide

The sampler is rarely the first thing to decide. Start from the model, and pick the simplest sampler that can explore its posterior well.

## Which Sampler Tab Suits Which Situation

| Situation | Tab | Why |
|---|---|---|
| Continuous parameters, and a differentiable model | **No-U-Turn Sampler** | The default choice, as it tunes itself |
| Learning how the dynamics work, or running a controlled comparison | **Hamiltonian Monte Carlo** | Step size and path length are fixed in plain view |
| Model code that cannot be differentiated, and few parameters | **Metropolis-Hastings** | Uses density values only |
| Priors already close to the posterior | **Metropolis-Hastings** | Proposals from the prior are accepted often enough |
| Discrete parameters | None of the three alone | Sum them out in the likelihood, or use a combined sampler such as `Gibbs` in Turing.jl |

## How to Choose Settings for the No-U-Turn Sampler

Start at the defaults of **Target Acceptance** 0.65 and 500 **Adaptation Steps**. Divergent transitions are the main reason to change them, and raising **Target Acceptance** to 0.8 or 0.95 makes steps smaller, at the cost of more gradient evaluations per draw. Raise **Adaptation Steps** if the first draws after warm-up still show drift. Use 4 **Chains** so that **R-hat** has something to compare. Raise **Samples (n)** when **Effective Sample Size** is too low for the target quantity. If several of these changes fail to help, the model needs attention.

## How to Decide Between Sampling and Faster Approximations

| Need | Better option | Trade-off |
|---|---|---|
| Accurate posterior, moderate size | MCMC in this panel | Slower, but with diagnostics to check it |
| Very large data or many parameters | Variational inference in Turing.jl | Faster, but often understates uncertainty |
| Only a point estimate, for quick exploration | `maximum_likelihood` or `maximum_a_posteriori` in Turing.jl | No uncertainty is reported |
| Likelihood cannot be evaluated at all | Simulation-Based Inference panel | Needs many simulated data sets |

## When to Change the Model Instead of the Sampler

Bad diagnostics often point at the model and not at the sampler. **Parameter Correlations** that show a ridge suggest reparameterising or dropping a parameter. Funnels in hierarchical models call for a non-centred form. **R-hat** that remains high with labels swapping between chains suggests ordering constraints or a different structure. **Posterior Predictive** results that miss the data call for a new likelihood, and no sampler can change that. Rescaling the data so that parameters are about 1 in size often helps at once.

## How to Decide Whether Priors Should Change

| What the checks show | Action |
|---|---|
| **Prior Predictive** ranges are absurd in real units | Tighten the priors, before seeing results |
| **Prior Sensitivity** shows little change in the posterior | Report the priors, and proceed |
| **Prior Sensitivity** shows large changes | Report the range, and seek more data or outside evidence |
| Posterior piles up against a prior's limit | Check whether the limit is justified |

Choose priors on grounds other than the result wanted. Adjusting them until a conclusion appears is not a sensitivity analysis.

## How to Compare Samplers on One Model

**Compare Samplers** runs `NUTS(500, 0.65)` for 1000 draws and `MH()` for 2000, on one chain each, and prints `ess_rhat` for both. Compare effective draws per second as well as per iteration, since a gradient-based draw costs more. Fixed settings in that step ignore the inputs of the tab, so edit them for a fair comparison. Agreement between two sound samplers supports the result, and a disagreement means that at least one of them has not converged.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
