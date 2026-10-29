# Markov Chain Monte Carlo — Factsheet

**Markov Chain Monte Carlo** samples from a distribution p(x) that can be evaluated only up to a normalising constant, as a Bayesian posterior can: the prior times the likelihood is known, its integral is not. A Markov chain with p as its stationary distribution is simulated, and its draws, after warm-up, are used like a (correlated) sample from p.

| | |
|---|---|
| **Purpose** | Draw from a posterior or any unnormalised density, to estimate expectations, intervals and probabilities |
| **Input** | A Turing @model body (NUTS, Metropolis-Hastings) or a log-density function and its dimension (HMC); the number of samples, warm-up steps or leapfrog steps |
| **Core packages** | [Turing.jl](https://github.com/TuringLang/Turing.jl), [AdvancedHMC.jl](https://github.com/TuringLang/AdvancedHMC.jl), [MCMCChains.jl](https://github.com/TuringLang/MCMCChains.jl) |
| **Samplers** | NUTS, HMC, Metropolis-Hastings |
| **Output** | Chains of draws; summaries (mean, standard deviation, quantiles); R-hat, ESS, autocorrelations; WAIC and LOO-CV |
| **Key choice** | The sampler: gradient-based (NUTS, HMC) when the parameters are continuous and the density differentiable, Metropolis-Hastings otherwise |

## When to Use

- The posterior has **no closed form** and **too many dimensions for numerical integration**.
- You want **exact inference in the limit**: with enough draws, MCMC estimates converge to the true posterior quantities, unlike variational approximations.
- You are **choosing or tuning a sampler** for a model and want to see how they compare.

## What It Is Not

MCMC gives no guarantee after a finite number of draws: convergence must be checked, and diagnostics can show problems but never prove their absence. It is slow for large data sets, and the gradient-based samplers cannot handle discrete parameters directly. For fast approximate posteriors see variational inference; for the modelling side, with priors and posterior checks, see Sampling-Based Bayesian Inference.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
