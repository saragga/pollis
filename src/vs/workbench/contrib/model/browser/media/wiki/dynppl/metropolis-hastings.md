# Metropolis-Hastings

**Metropolis-Hastings** proposes a new value and accepts or rejects it by comparing densities, with no gradient involved. Its simplicity makes it a useful baseline, and in this tab it needs nothing beyond the ability to evaluate the model.

## What Metropolis-Hastings Computes

From the current value theta, draw a candidate theta* from a proposal q(theta* | theta), and accept it with probability min(1, [p(theta* | y) q(theta | theta*)] / [p(theta | y) q(theta* | theta)]). A rejected candidate means that the chain repeats its current value. The normalising constant of the posterior cancels in the ratio, which is what makes the method possible. [Metropolis, Rosenbluth, Rosenbluth, Teller and Teller (1953)](#ref-MRRTT1953a) used symmetric proposals, and [Hastings (1970)](#ref-Has1970a) added the correction that allows asymmetric ones.

## How the Metropolis-Hastings Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Model Name** | `my_model` | Name of the function defined by `@model` |
| **Data Variable** | `y` | Name of the observed vector |
| **Samples (n)** | 2000 | Draws kept per chain |
| **Chains** | 4 | Number of chains |

The code runs `sample(model, MH(), MCMCThreads(), n, chains; chain_type = MCMCChains.Chains, discard_initial = 100)`. Turing.jl documents plain `MH()` as drawing proposals from the model's prior, so each candidate ignores the current value. With such a proposal, the prior terms cancel and the acceptance probability becomes the likelihood ratio. There is no warm-up, so the first 100 draws are dropped.

## How the Random-Walk Form Differs

`MH(cov_matrix)` is a different sampler, which Turing.jl runs as a random walk: each candidate is the current value plus multivariate normal noise, in the transformed space where all parameters are unconstrained. Its covariance matrix needs to match the dimension of the parameters. It often beats prior proposals when data are informative, since it stays near the current position, but its scale has to be tuned. A scale that is too large rejects most candidates, and one that is too small accepts nearly all while hardly moving. To try it, edit `MH()` in the tab's code.

## Where Metropolis-Hastings Works Well

Models with few parameters and a cheap likelihood suit it, particularly if no gradient can be computed. Each draw costs a single density evaluation, so far more draws per second are possible than with **Hamiltonian Monte Carlo**. With prior proposals, it also works well when the data are weak, so that prior and posterior stay close. It is easy to reason about and makes a useful check against gradient-based results on simple models.

## Where Metropolis-Hastings Misleads

Prior proposals rarely land in the posterior when the data are informative, because the posterior is then much narrower than the prior. Most candidates get rejected, and **Trace Plot** shows long flat stretches. A chain that sticks for long can look stable, and short runs may understate the spread. The efficiency falls quickly as parameters are added. A high **R-hat** or a very low **Effective Sample Size** is the expected symptom, and more draws are only a partial remedy, as the problem grows with each added parameter.

## What to Compare Metropolis-Hastings With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether gradients pay off | **Compare Samplers** | **Effective Sample Size** for `MH()` and `NUTS`, per second |
| Whether the posterior is right | **No-U-Turn Sampler** | Means and intervals close to each other |
| Whether prior proposals are the limit | `MH(cov_matrix)` | A clear rise in **Effective Sample Size** |

A disagreement between these fits points to the sampler with the lower **Effective Sample Size** as the one to doubt first.

## References

<a id="ref-Has1970a"></a>Hastings, W. K. (1970). Monte Carlo sampling methods using Markov chains and their applications. *Biometrika* 57(1), 97–109. [doi:10.1093/biomet/57.1.97](https://doi.org/10.1093/biomet/57.1.97)

<a id="ref-MRRTT1953a"></a>Metropolis, N., Rosenbluth, A. W., Rosenbluth, M. N., Teller, A. H. and Teller, E. (1953). Equation of state calculations by fast computing machines. *Journal of Chemical Physics* 21(6), 1087–1092. [doi:10.1063/1.1699114](https://doi.org/10.1063/1.1699114)

## See Also

- [No-U-Turn Sampler](nuts.md) · [Hamiltonian Monte Carlo](hmc.md) · [Decision Guide](decision-guide.md)
