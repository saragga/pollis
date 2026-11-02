# No-U-Turn Sampler

The **No-U-Turn Sampler** is a form of Hamiltonian Monte Carlo that decides for itself how far each trajectory should travel. It removes the main tuning problem of plain **Hamiltonian Monte Carlo**, which is why it is the usual first choice for a differentiable model.

## What the No-U-Turn Sampler Computes

Like **Hamiltonian Monte Carlo**, it treats the negative log posterior as a landscape and simulates the motion of a particle over it, with a random momentum drawn at each iteration. [Hoffman and Gelman (2014)](#ref-HG2014a) build the trajectory by repeated doubling, forwards or backwards in time at random. Doubling stops when the path starts to turn back on itself, which is tested by the dot product of the momentum with the vector between the two ends. The next draw is picked from the states along the path, with a selection that keeps the posterior as the target. A dual-averaging rule tunes the step size during warm-up to reach the target acceptance.

## How the No-U-Turn Sampler Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Model Name** | `my_model` | Name of the function defined by `@model` |
| **Data Variable** | `y` | Name of the observed vector |
| **Samples (n)** | 1000 | Draws kept per chain |
| **Chains** | 4 | Number of chains |
| **Target Acceptance** | 0.65 | Average acceptance that the step size aims for |
| **Adaptation Steps** | 500 | Warm-up draws used for tuning, then dropped |

The code runs `sample(model, NUTS(adapt, accept), MCMCThreads(), n, chains; chain_type = MCMCChains.Chains)`. The default data are simulated with `Random.seed!(1)`, as 100 draws from `Normal(1, 2)`, so the fit can be seen to work before replacing them. `summarystats(chain)` follows.

## Where the No-U-Turn Sampler Works Well

Models with many continuous parameters, including correlated ones, suit it well, because gradients guide each move and trajectories match the local shape of the posterior. Autocorrelation is usually low, so **Effective Sample Size** can be close to the number of draws. Adaptation covers the step size and a diagonal mass matrix, so little hand-tuning is needed, and the same call works on many models. Its internal statistics also offer useful warnings, including divergent transitions.

## Where the No-U-Turn Sampler Misleads

Gradients are required, so discrete parameters are excluded, and any function with sharp jumps causes trouble. Hierarchical funnels can leave a region unexplored, which produces divergent transitions and a biased result even when **R-hat** looks fine. Separate modes stay separate, as trajectories rarely cross regions of low density. Each draw may require many gradient evaluations, up to 2^10 per draw at the default tree depth limit, so a slow model becomes much slower. Few **Adaptation Steps** can leave a poor step size in place for the whole run, because tuning stops after warm-up.

## What to Compare the No-U-Turn Sampler With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether self-tuning is doing its job | **Hamiltonian Monte Carlo** with similar settings | Agreement in means, with gaps in **Effective Sample Size** |
| Whether the gradients are worth the cost | **Compare Samplers** | Effective draws per second, not per iteration |
| Whether the result depends on settings | Higher **Target Acceptance** | Posterior means and intervals that stay in place |

## References

<a id="ref-HG2014a"></a>Hoffman, M. D. and Gelman, A. (2014). The No-U-Turn Sampler: Adaptively setting path lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

## See Also

- [Hamiltonian Monte Carlo](hmc.md) · [Metropolis-Hastings](metropolis-hastings.md) · [Diagnostics](diagnostics.md)
