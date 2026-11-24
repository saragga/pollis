# Bayesian Inference for ODEs: Factsheet

The panel's tabs, inputs, problem and sources at a glance.

## What do the tabs of Bayesian Inference for ODEs run?

| Tab | Sampler | Output |
|---|---|---|
| **NUTS** | `NUTS(target_acceptance)` of AdvancedHMC.jl on a `PEtabLogDensity` | Posterior mean, sd, effective sample size and R-hat |
| **HMC** | `HMC(step_size, leapfrog_steps)` on the same density | The same summary |

Both draw 500 adaptation samples, which are discarded, before the samples kept, and return the draws to the linear scale of the priors with `to_chains`.

## What are the inputs of Bayesian Inference for ODEs?

| Input | Default | Tabs |
|---|---|---|
| **PEtab YAML (Optional)** | empty: the built-in problem | both |
| **Seed** | 1 | both |
| **Gradient Method** | ForwardDiff | both |
| **Target Acceptance** | 0.8 | NUTS |
| **Step Size** | 0.05 | HMC |
| **Leapfrog Steps** | 10 | HMC |
| **n Samples** | 1000, after 500 adaptation draws | both |
| **n Chains** | 4 | both |

## Which problem does Bayesian Inference for ODEs solve?

| Item | Value |
|---|---|
| Reactions | S + E → SE (c1), SE → S + E (c2), SE → P + E (c3 = 3) |
| Initial values | S = S0, E = 50, SE = 0, P = 0 |
| Observables | S + E, noise sd 3; P, noise sd σ |
| Priors | LogNormal(0, 2) on c1 and c2, LogNormal(4.5, 0.5) on S0, LogNormal(0, 1) on σ |
| True values | c1 = 1, c2 = 10, S0 = 100, σ = 1 |
| Data | 21 times, 0 to 10 in steps of 0.5 |
| ODE solver | `Rodas5P()` |

## Which results does Bayesian Inference for ODEs build on?

| Result | Source |
|---|---|
| The No-U-Turn sampler, with its path length and step size adapted | [Hoffman and Gelman (2014)](#ref-HG2014a) |
| R-hat under 1.01, at least four chains and an effective sample size over 400 | [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a) |
| HMC samplers in Julia | [Xu, Ge, Tebbutt, Tarek, Trapp and Ghahramani (2020)](#ref-XGTTT...2020a) |
| PEtab.jl and its log-posterior density | [Persson, Fröhlich, Grein, Loman, Ognissanti, Hasselgren, Hasenauer and Cvijovic (2025)](#ref-PFGLO...2025a) |
| A standard format for estimation problems, with priors in its parameter table | [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) |
| Catalyst.jl and ModelingToolkit | [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), [Ma, Gowda, Anantharaman, Laughman, Shah and Rackauckas (2021)](#ref-MGALS...2021a) |

## References

<a id="ref-HG2014a"></a>Hoffman, M. D., & Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C., & Isaacson, S. A. (2023). Catalyst: Fast and Flexible Modeling of Reaction Networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

<a id="ref-MGALS...2021a"></a>Ma, Y., Gowda, S., Anantharaman, R., Laughman, C., Shah, V., & Rackauckas, C. (2021). ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling. [doi:10.48550/arXiv.2103.05244](https://doi.org/10.48550/arXiv.2103.05244)

<a id="ref-PFGLO...2025a"></a>Persson, S., Fröhlich, F., Grein, S., Loman, T., Ognissanti, D., Hasselgren, V., Hasenauer, J., & Cvijovic, M. (2025). PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling. *Bioinformatics* 41(9). [doi:10.1093/bioinformatics/btaf497](https://doi.org/10.1093/bioinformatics/btaf497)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-VGSCB2021a"></a>Vehtari, A., Gelman, A., Simpson, D., Carpenter, B., & Bürkner, P.-C. (2021). Rank-Normalization, Folding, and Localization: An Improved R̂ for Assessing Convergence of MCMC. *Bayesian Analysis* 16(2), 667-718. [doi:10.1214/20-BA1221](https://doi.org/10.1214/20-BA1221)

<a id="ref-XGTTT...2020a"></a>Xu, K., Ge, H., Tebbutt, W., Tarek, M., Trapp, M., & Ghahramani, Z. (2020). AdvancedHMC.jl: A Robust, Modular and Efficient Implementation of Advanced HMC Algorithms. *Proceedings of The 3rd Symposium on Advances in Approximate Bayesian Inference* 118, 1-10.

## See Also

- [Overview](overview.md) · [Sampling](sampling.md) · [PEtab Format](../ode/petab-format.md)
