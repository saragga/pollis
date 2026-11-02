# Factsheet

The Probabilistic Programming panel writes a Bayesian model as code and draws from its posterior with Turing.jl. Its three tabs fit the same model with different samplers, so the choice among them concerns efficiency and reliability, not the model itself.

## What the Probabilistic Programming Panel Does

| Item | Description |
|---|---|
| **Purpose** | Draw samples from the posterior of a model written with `@model` |
| **Julia stack** | Turing.jl for the model and samplers, MCMCChains.jl for chains and diagnostics, StatsPlots.jl for the charts |
| **Input** | **Model Name**, **Data Variable**, and the priors and likelihood edited in the code |
| **Output** | `chain`, the draws for every parameter from every chain |
| **Key choice** | The model comes first, and the sampler only serves it |

The default model has `mu ~ Normal(0, 1)`, `sigma ~ Exponential(1)` and observations from `Normal(mu, sigma)`. It is a starting template, so replace its priors and likelihood with those of the problem at hand.

## What Each Sampler Tab Runs

| Tab | Call | Needs gradients | Tuning |
|---|---|---|---|
| **No-U-Turn Sampler** | `NUTS(adapt, accept)` | Yes | Automatic, during **Adaptation Steps** |
| **Hamiltonian Monte Carlo** | `HMC(epsilon, L)` | Yes | By hand, with fixed settings |
| **Metropolis-Hastings** | `MH()` | No | None, as proposals come from the prior |

All three run through `sample` with `MCMCThreads()`, so the chains share Julia's threads, and start Julia with several threads to run them at once.

## Which Inputs Each Sampler Tab Takes

| Input | Tab | Default | Effect |
|---|---|---|---|
| **Samples (n)** | All | 1000, or 2000 for **Metropolis-Hastings** | Draws kept per chain |
| **Chains** | All | 4 | Number of chains run in parallel |
| **Target Acceptance** | **No-U-Turn Sampler** | 0.65 | Higher values lead to smaller steps |
| **Adaptation Steps** | **No-U-Turn Sampler** | 500 | Warm-up draws used for tuning |
| **Step Size (epsilon)** | **Hamiltonian Monte Carlo** | 0.01 | Size of each leapfrog step |
| **Leapfrog Steps (L)** | **Hamiltonian Monte Carlo** | 30 | Steps in each trajectory |

Both **Hamiltonian Monte Carlo** and **Metropolis-Hastings** drop their first 100 draws through `discard_initial = 100`.

## Which Next Steps the Probabilistic Programming Panel Offers

| Group | Next Steps |
|---|---|
| Visualise | **Trace Plot**, **Density Plot** |
| Diagnose | **R-hat**, **Effective Sample Size**, **Autocorrelation** |
| Predict | **Prior Predictive**, **Posterior Predictive** |
| Compare | **Compare Samplers**, **Prior Sensitivity** |
| Interpret | **Summary Statistics**, **Parameter Correlations** |

**Compare Samplers** and **Prior Sensitivity** run new fits with their own fixed settings, so they take longer than the other steps and ignore the inputs of the tab.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
