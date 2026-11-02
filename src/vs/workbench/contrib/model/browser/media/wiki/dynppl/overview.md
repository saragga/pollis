# Overview

A probabilistic programming language lets a modeller write down how data are generated and leaves the inference to general algorithms. Turing.jl does this within ordinary Julia code, so a model can use any Julia function and can be changed by editing a few lines.

## Where Probabilistic Programming and MCMC Come From

Bayesian inference needs the posterior p(theta | y), proportional to p(y | theta) p(theta), and its normalising constant is rarely available. Markov chain Monte Carlo avoids that constant. [Metropolis, Rosenbluth, Rosenbluth, Teller and Teller (1953)](#ref-MRRTT1953a) gave the first accept-or-reject chain, and [Hastings (1970)](#ref-Has1970a) generalised it to asymmetric proposals. [Duane, Kennedy, Pendleton and Roweth (1987)](#ref-DKPR1987a) brought Hamiltonian dynamics into the proposal. [Hoffman and Gelman (2014)](#ref-HG2014a) removed the hardest tuning choice with the No-U-Turn Sampler. Turing.jl itself is described by [Ge, Xu and Ghahramani (2018)](#ref-GXG2018a).

## How a Model Is Written in Turing.jl

A function marked with `@model` lists the random quantities. A line with `~` states a distribution: `mu ~ Normal(0, 1)` is a prior if `mu` has no value, and `y .~ Normal(mu, sigma)` is a likelihood when `y` holds data. The macro turns this into a function for the log density of any parameter values. **Model Name** and **Data Variable** fill in the names in the code, and the priors and likelihood are edited there. The dot in `.~` applies the distribution to each element of the vector.

## How the Sampler Tabs Differ

**Metropolis-Hastings** proposes values and accepts them with a probability based on the density ratio. Plain `MH()` in Turing.jl draws proposals from the prior, so it needs no gradient and no tuning, and it gets poor as the posterior narrows relative to the prior. **Hamiltonian Monte Carlo** uses gradients to move far across the posterior in a single proposal, and its **Step Size (epsilon)** and **Leapfrog Steps (L)** are set by hand. **No-U-Turn Sampler** builds on the same dynamics and chooses the path length as it runs, and it tunes the step size during warm-up. All three run **Chains** chains through `MCMCThreads()`, so starting Julia with several threads makes them run at once.

## A Common Workflow for Probabilistic Programming

1. Write the model, with priors chosen for the problem.
2. Run **Prior Predictive** to see what the priors imply for the parameters.
3. Fit with the **No-U-Turn Sampler** tab, unless gradients are not available.
4. Read **R-hat** and **Effective Sample Size**, then **Trace Plot**. Do not read results until these look sound.
5. Use **Posterior Predictive** to compare simulated data with the real data.
6. Read **Summary Statistics**, and check **Prior Sensitivity** for the parameters that matter.

[Gabry, Simpson, Vehtari, Betancourt and Gelman (2019)](#ref-GSVBG2019a) set out checks of this kind as a workflow, with a graphical check for each stage.

## What Sampling Cannot Fix

A sampler explores the model it is given. Clean diagnostics show that the chains probably describe the posterior, and they do not show that the model is right. Convergence checks can also miss a part of the posterior that no chain reached. A slow or badly mixing sampler often points to a problem in the model itself, so reparameterising or rethinking priors usually helps more than running for longer. [Gelman, Carlin, Stern, Dunson, Vehtari and Rubin (2013)](#ref-GCSDV...2013a) treat model checking and the wider theory at length.

## References

<a id="ref-DKPR1987a"></a>Duane, S., Kennedy, A. D., Pendleton, B. J. and Roweth, D. (1987). Hybrid Monte Carlo. *Physics Letters B* 195(2), 216–222. [doi:10.1016/0370-2693(87)91197-X](https://doi.org/10.1016/0370-2693(87)91197-X)

<a id="ref-GSVBG2019a"></a>Gabry, J., Simpson, D., Vehtari, A., Betancourt, M. and Gelman, A. (2019). Visualization in Bayesian workflow. *Journal of the Royal Statistical Society Series A* 182(2), 389–402. [doi:10.1111/rssa.12378](https://doi.org/10.1111/rssa.12378)

<a id="ref-GXG2018a"></a>Ge, H., Xu, K. and Ghahramani, Z. (2018). Turing: A language for flexible probabilistic inference. *Proceedings of Machine Learning Research* 84, 1682-1690. [proceedings.mlr.press/v84/ge18b](https://proceedings.mlr.press/v84/ge18b.html)

<a id="ref-GCSDV...2013a"></a>Gelman, A., Carlin, J. B., Stern, H. S., Dunson, D. B., Vehtari, A. and Rubin, D. B. (2013). Bayesian Data Analysis. CRC Press (3rd ed.).

<a id="ref-Has1970a"></a>Hastings, W. K. (1970). Monte Carlo sampling methods using Markov chains and their applications. *Biometrika* 57(1), 97–109. [doi:10.1093/biomet/57.1.97](https://doi.org/10.1093/biomet/57.1.97)

<a id="ref-HG2014a"></a>Hoffman, M. D. and Gelman, A. (2014). The No-U-Turn Sampler: Adaptively setting path lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-MRRTT1953a"></a>Metropolis, N., Rosenbluth, A. W., Rosenbluth, M. N., Teller, A. H. and Teller, E. (1953). Equation of state calculations by fast computing machines. *Journal of Chemical Physics* 21(6), 1087–1092. [doi:10.1063/1.1699114](https://doi.org/10.1063/1.1699114)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
