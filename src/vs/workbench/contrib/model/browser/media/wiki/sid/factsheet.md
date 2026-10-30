# Sampling from Intractable Distributions — Factsheet

A distribution is **intractable** when its density can be evaluated up to a constant but neither normalised nor sampled directly: most Bayesian posteriors, and models in statistical physics. MCMC samples it with a Markov chain, but a single chain can stay trapped in one mode for a very long time. **Parallel tempering** (PT) runs chains on a path of distributions from an easy reference to the target and swaps their states, so that the target chain can jump between modes. Pigeons.jl implements non-reversible PT with an adaptive schedule.

| | |
|---|---|
| **Purpose** | Sample a multimodal or otherwise difficult target, and estimate its normalising constant |
| **Input** | The log-density log p(x), its dimension, a Gaussian reference, the number of rounds and of chains, and a seed |
| **Core packages** | [Pigeons.jl](https://github.com/Julia-Tempering/Pigeons.jl), [MCMCDiagnosticTools.jl](https://github.com/TuringLang/MCMCDiagnosticTools.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [LogExpFunctions.jl](https://github.com/JuliaStats/LogExpFunctions.jl) |
| **Models** | One run: a single slice-sampler chain beside parallel tempering on the same target |
| **Output** | Draws from both runs, the barrier Lambda, round trips, tempered restarts, ESS and log Z |
| **Key choice** | The number of chains, guided by Lambda, and a reference wide enough to cover every mode |

## When to Use

- **Multimodal posteriors**: mixtures, label switching, phylogenetics, change points.
- **Normalising constants** for Bayes factors and model evidence.
- **Checking** whether a single-chain MCMC result reflects the whole target.

## What It Is Not

Not a fitting tool for a given statistical model: it samples whatever log-density is written. Not needed for unimodal, well-conditioned targets, where one chain of a gradient-based sampler such as NUTS is cheaper.

## See Also
- [Overview](overview.md) · [Parallel Tempering](parallel-tempering.md) · [Decision Guide](decision-guide.md)
