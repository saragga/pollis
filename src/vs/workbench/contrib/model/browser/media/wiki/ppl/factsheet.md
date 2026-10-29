# Sampling-Based Bayesian Inference — Factsheet

**Bayesian inference** treats the unknown parameters as random, with a prior distribution that expresses what is known before the data, and updates it to a posterior with the likelihood of the data. Sampling-based inference represents the posterior by draws from it, made by MCMC. It gives the whole distribution of every parameter, of any function of them and of future observations, at the price of computation and of checking that the sampler worked.

| | |
|---|---|
| **Purpose** | Estimate parameters with full uncertainty, combine prior knowledge with data, and predict with honest intervals |
| **Input** | Observations y; covariates X for the regressions; group ids and the number of groups for the hierarchical model; the sampler and its settings |
| **Core packages** | [Turing.jl](https://github.com/TuringLang/Turing.jl), [MCMCChains.jl](https://github.com/TuringLang/MCMCChains.jl), [PosteriorStats.jl](https://github.com/arviz-devs/PosteriorStats.jl) |
| **Models** | Gaussian, Linear Regression, Logistic Regression, Hierarchical |
| **Output** | Chains of posterior draws; posterior means, standard deviations, credible and HPD intervals; R-hat and ESS; posterior predictive draws; LOO-CV |
| **Key choice** | The priors, and the sampler (NUTS unless there is a reason not to) |

## When to Use

- You want **probability statements about parameters**: "the slope is positive with probability 0.97".
- You have **prior information** to include, or few data, where a prior stabilises the estimates.
- The model is **hierarchical**: groups that should share information.
- You need **predictive distributions** for new observations, not just point predictions.

## What It Is Not

Sampling is slow compared with maximum likelihood or variational inference, and gets slower with large data and complex models (see the variational and message-passing panels). The posterior depends on the prior: with few data, a different prior gives a different answer. And the draws are only as good as the sampler's convergence, which must be checked every time.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
