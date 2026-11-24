# Bayesian Inference for ODEs: Overview

**Bayesian Inference for ODEs** gives the parameters of an ordinary differential equation model a posterior distribution, from their priors and time-course data, sampled with NUTS or HMC through PEtab.jl and AdvancedHMC.jl.

## What does Bayesian inference add to fitting an ODE model?

Parameter Estimation for ODEs finds the parameters that maximise the likelihood, and gives intervals from profiles or the Fisher information. Bayesian inference adds priors, which express what is known about the parameters before the data, and returns the whole posterior distribution: every parameter value with its probability given the priors and the data.

From the posterior come credible intervals, the correlations between parameters, and predictions with bands that carry the uncertainty of the parameters into a new condition. The price is the sampling: many solutions of the ODE, and checks that the chains have converged before any draw is read.

## Which software does Bayesian Inference for ODEs use?

PEtab.jl, by [Persson, Fröhlich, Grein, Loman, Ognissanti, Hasselgren, Hasenauer and Cvijovic (2025)](#ref-PFGLO...2025a), builds the problem and turns it into a log-posterior density, `PEtabLogDensity`, on an unconstrained scale. AdvancedHMC.jl, by [Xu, Ge, Tebbutt, Tarek, Trapp and Ghahramani (2020)](#ref-XGTTT...2020a), samples it, with the No-U-Turn sampler of [Hoffman and Gelman (2014)](#ref-HG2014a) or with Hamiltonian Monte Carlo. MCMCChains.jl holds the draws and prints their summaries.

The model is a Catalyst.jl reaction network, by [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), built on ModelingToolkit, by [Ma, Gowda, Anantharaman, Laughman, Shah and Rackauckas (2021)](#ref-MGALS...2021a).

## Which problem does Bayesian Inference for ODEs solve?

The built-in problem is the Michaelis–Menten example of the PEtab.jl tutorial, the one Parameter Estimation for ODEs fits: S + E ⇌ SE → P + E, with rates c1 and c2, the known rate c3 = 3, the unknown initial substrate S0, and the noise σ of the measurements of P. Its data are simulated at known values, so **Parameter Values** sets each posterior mean beside the value that made the data.

**PEtab YAML (Optional)** replaces it with a problem in the PEtab format of [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a), whose parameter table then gives the priors.

## How is Bayesian Inference for ODEs organised?

| Group | Action | What it does |
|---|---|---|
| Visualise | **Observed vs. Simulated** | The measurements against the model at the posterior medians |
| Visualise | **Trace Plots** | The draws of every chain, and their densities |
| Diagnose | **Posterior Correlation** | Correlations between the parameters in the draws |
| Predict | **New Condition** | Product formation with half the enzyme, with a 90% band |
| Interpret | **Credible Intervals** | 95% equal-tailed intervals |
| Interpret | **Parameter Values** | Posterior means and standard deviations against the true values |

## References

<a id="ref-HG2014a"></a>Hoffman, M. D., & Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C., & Isaacson, S. A. (2023). Catalyst: Fast and Flexible Modeling of Reaction Networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

<a id="ref-MGALS...2021a"></a>Ma, Y., Gowda, S., Anantharaman, R., Laughman, C., Shah, V., & Rackauckas, C. (2021). ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling. [doi:10.48550/arXiv.2103.05244](https://doi.org/10.48550/arXiv.2103.05244)

<a id="ref-PFGLO...2025a"></a>Persson, S., Fröhlich, F., Grein, S., Loman, T., Ognissanti, D., Hasselgren, V., Hasenauer, J., & Cvijovic, M. (2025). PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling. *Bioinformatics* 41(9). [doi:10.1093/bioinformatics/btaf497](https://doi.org/10.1093/bioinformatics/btaf497)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-XGTTT...2020a"></a>Xu, K., Ge, H., Tebbutt, W., Tarek, M., Trapp, M., & Ghahramani, Z. (2020). AdvancedHMC.jl: A Robust, Modular and Efficient Implementation of Advanced HMC Algorithms. *Proceedings of The 3rd Symposium on Advances in Approximate Bayesian Inference* 118, 1-10.

## See Also

- [Factsheet](factsheet.md) · [Sampling](sampling.md) · [PEtab Format](../ode/petab-format.md)
- Parameter Estimation for ODEs: [Overview](../ode/overview.md) · Structural Identifiability of ODEs: [Overview](../odeident/overview.md)
