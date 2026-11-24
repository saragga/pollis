# Bayesian Inference for ODEs: Sampling

How Bayesian Inference for ODEs samples the posterior: the priors, the two samplers, the checks of convergence and the reading of the summaries.

## Priors and posterior sampling

Bayesian Inference for ODEs places log-normal priors on c1, c2 and σ and a prior with median about 90 on S0. The posterior combines them with the likelihood, so priors that do not reflect real knowledge pull the posterior towards themselves. The PEtab.jl documentation notes that its Bayesian workflow infers the posterior distribution of the parameters given the data when prior knowledge is available.

Sampling assumes that the chains have reached the posterior; [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a) recommend at least four chains, an R-hat under 1.01 and an effective sample size over 400 before the draws are used.

## NUTS or HMC

The tabs **NUTS** and **HMC** run the two samplers of AdvancedHMC.jl, by [Xu, Ge, Tebbutt, Tarek, Trapp and Ghahramani (2020)](#ref-XGTTT...2020a). [Hoffman and Gelman (2014)](#ref-HG2014a) describe NUTS as an extension of HMC that eliminates the need to set a number of steps L, with a method for adapting the step size on the fly based on primal-dual averaging. **Target Acceptance** sets the acceptance rate the adaptation of NUTS aims for, 0.8 by default.

**HMC** takes its **Step Size** and its number of **Leapfrog Steps** as given, 0.05 and 10 by default. In both tabs, **n Samples** draws are kept after 500 adaptation draws, in **n Chains** chains; four chains, the default, is the minimum that [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a) recommend.

## Sampler convergence

The summary of the Example Code prints the effective sample size and R-hat of each parameter. [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a) propose rank-normalised and folded versions of R-hat, recommend using the draws only if R-hat is under 1.01, which is much tighter than the earlier 1.1, and require a rank-normalised effective sample size over 400. They also recommend at least four chains, since several chains are more likely to reveal multimodality and poor adaptation or mixing.

**n Chains** starts each chain from a draw from the prior, and its tooltip notes that several chains are needed for R-hat. **Trace Plots** draws the traces, which should overlap.

## Posterior summaries

The summary gives the posterior mean, standard deviation, effective sample size and R-hat of each parameter. The thresholds of [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a), R-hat under 1.01 and an effective sample size over 400, decide whether the summaries can be used.

The correlation matrix of **Posterior Correlation** shows which parameters move together in the posterior: a correlation close to ±1 means the data determine a combination of the two better than either alone. Posterior means and credible intervals are on the linear scale, since `to_chains` returns the draws to the scale of the priors, as the PEtab.jl documentation explains.

## Predictions from the posterior

**New Condition** predicts product formation with E(0) = 25, half the measured enzyme, as the median and a 90% band over 200 posterior draws. The band shows the spread that the uncertainty in c1, c2 and S0 carries into the prediction; measurement noise is not added to it. The draws are taken at random from all chains together, with the random number generator of **Seed**, and each is solved with `Rodas5P()` from time 0 to 10. **New Condition** is written for the species of the built-in problem, and stops with a message when **PEtab YAML (Optional)** names a problem of one's own.

## References

<a id="ref-HG2014a"></a>Hoffman, M. D., & Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-VGSCB2021a"></a>Vehtari, A., Gelman, A., Simpson, D., Carpenter, B., & Bürkner, P.-C. (2021). Rank-Normalization, Folding, and Localization: An Improved R̂ for Assessing Convergence of MCMC. *Bayesian Analysis* 16(2), 667-718. [doi:10.1214/20-BA1221](https://doi.org/10.1214/20-BA1221)

<a id="ref-XGTTT...2020a"></a>Xu, K., Ge, H., Tebbutt, W., Tarek, M., Trapp, M., & Ghahramani, Z. (2020). AdvancedHMC.jl: A Robust, Modular and Efficient Implementation of Advanced HMC Algorithms. *Proceedings of The 3rd Symposium on Advances in Approximate Bayesian Inference* 118, 1-10.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [PEtab Format](../ode/petab-format.md)
