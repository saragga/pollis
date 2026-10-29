# Decision Guide

| Question | Model | Why |
|---|---|---|
| What are the mean and spread of one sample? | **Gaussian** | The simplest model; a good first check of a setup |
| How does a continuous outcome depend on a covariate? | **Linear Regression** | Bayesian least squares, with full uncertainty |
| How does a 0/1 outcome depend on a covariate? | **Logistic Regression** | Posterior of the log-odds |
| Several groups, some with few observations? | **Hierarchical** | Partial pooling between no pooling and complete pooling |

## Choosing the Sampler

| Situation | Sampler | Setting |
|---|---|---|
| Continuous parameters, default | **NUTS** | Target acceptance 0.65 to 0.8 |
| Divergent transitions | **NUTS** | Raise the target acceptance to 0.9 to 0.99 |
| Learning how HMC works, or a tuned problem | **HMC** | Choose epsilon and L by hand |
| No gradient available, few parameters | **MH** | Expect many more draws for the same ESS |

## Choosing the AD Backend
- **AutoForwardDiff** for models with up to a few dozen parameters.
- **A reverse-mode backend** (AutoEnzyme, AutoMooncake, AutoReverseDiff) for models with many parameters, such as hierarchical models with many groups.

## Decision Flow

1. **Write the model** with weakly informative priors on the scale of the data.
2. **Sample with NUTS**, at least 4 chains.
3. **Check** R-hat, ESS, divergences and the trace plots. If they fail, reparametrise or raise the target acceptance before reading any result.
4. **Check the fit** with the posterior predictive check.
5. **Compare** alternatives with LOO Compare, and report the posterior summaries of the chosen one.

## Rules of Thumb
- **Never read a posterior before checking convergence.**
- **Run several chains**, not one long one.
- **Look at the prior** next to the posterior when the data are few.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
