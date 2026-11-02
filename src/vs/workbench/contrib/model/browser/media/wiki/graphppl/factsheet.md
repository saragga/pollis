# Factsheet

**Probabilistic Programming with RxInfer.jl** writes Bayesian models with `@model` and infers their posteriors by three forms of message passing, each shown on a model that suits it.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Bayesian inference by message passing on factor graphs |
| Julia stack | `RxInfer.jl`, `Distributions.jl`, `Plots.jl` |
| Tabs | **Belief Propagation**, **Variational Message Passing**, **Expectation Propagation** |
| Main call | `infer(model, data, returnvars, iterations, free_energy)` |
| Result | `result.posteriors`, `result.free_energy` |

The tabs do not share a model: each one defines its own, chosen to suit its algorithm.

## What the Inputs of the Panel Default To

| Tab | Input | Default |
|---|---|---|
| All | **Data Variable** | `y` |
| **Belief Propagation** | **Model Name** | `gaussian_mean` |
| **Belief Propagation** | **Known Variance** | 1.0 |
| **Variational Message Passing** | **Model Name** | `gaussian_mean_precision` |
| **Variational Message Passing** | **Iterations** | 50 |
| **Expectation Propagation** | **Model Name** | `probit_trend` |
| **Expectation Propagation** | **Iterations** | 20 |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Seed | 42 |
| **Belief Propagation** data | 30 draws, mean 1.5 |
| **Belief Propagation** prior | Normal, mean 0, variance 10 |
| **Variational Message Passing** data | 20 draws, mean 1.5, sd 0.8 |
| **Variational Message Passing** priors | mu with precision 0.1, tau with Gamma(1, 1) |
| **Expectation Propagation** data | 100 outcomes from a random walk |
| **Expectation Propagation** step | Random walk, sd 0.15 |
| **Iteration Sensitivity** | 1, 2, 5, 10, 20 iterations |
| **Approximate vs Exact** | Grid of 400 × 400, or 20000 sampled paths |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Posterior Mean** | Mean by iteration, or trend with a band |
| **Posterior Distribution** | Density of the final marginals |
| **Free Energy** | F against the exact value, or per iteration |
| **Convergence Check** | Change over the last iteration |
| **Prior Predictive** | Data from the priors, against the data |
| **Posterior Predictive** | Prediction of a new observation |
| **Approximate vs Exact** | Comparison with a closed form, grid or sampler |
| **Iteration Sensitivity** | Results with few iterations |
| **Posterior Summary** | Means and standard deviations |
| **Credible Interval** | 95% intervals |

## See Also

- [Overview](overview.md) · [Belief Propagation](bp.md) · [Variational Message Passing](vmp.md) · [Expectation Propagation](ep.md)
