# ODE Inference Methods: Overview

**ODE Inference Methods** estimates the parameters of an ordinary differential equation model from time-course data, and asks how well the data determine them: structural identifiability, fits from one or many starts, profile likelihoods and Bayesian posteriors, with PEtab.jl and its companion packages.

## Parameter estimation for ODE models

A kinetic model, in the form used by [Borisov and Metelkin (2020)](#ref-BM2020a), is an ODE system dx/dt = f(x(t), u(t), p) with states x, known inputs u and parameters p. Only some states are measured, through observation functions with measurement errors. The unknowns, rates, initial conditions and noise parameters, are estimated by fitting the simulated observables to the data, typically by maximum likelihood, that is, by minimising the negative logarithm of the likelihood.

[Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) draw lessons from their experience of such models in systems biology, and [Bates and Watts (1988)](#ref-BW1988a) treat nonlinear regression, the statistical setting of the fit, at book length.

## Five models

| Model | Question | Method |
|---|---|---|
| **Structural Identifiability** | Can the parameters be recovered from perfect data on these outputs? | StructuralIdentifiability.jl |
| **Single-Start** | What is a maximum likelihood estimate from one start? | `calibrate` |
| **Multi-Start** | Is the best fit found repeatedly? | `calibrate_multistart` from Latin-hypercube starts |
| **Profile Likelihood** | What are the confidence intervals, and are they finite? | LikelihoodProfiler.jl |
| **Bayesian Inference** | What is the posterior distribution of the parameters? | NUTS or HMC from AdvancedHMC.jl |

## The software

PEtab.jl, by [Persson, Fröhlich, Grein, Loman, Ognissanti, Hasselgren, Hasenauer and Cvijovic (2025)](#ref-PFGLO...2025a), builds the estimation problem and wraps the optimisers, profiles and samplers. The model is a Catalyst.jl reaction network, by [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), built on ModelingToolkit, by [Ma, Gowda, Anantharaman, Laughman, Shah and Rackauckas (2021)](#ref-MGALS...2021a). StructuralIdentifiability.jl implements the algorithm of [Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a), LikelihoodProfiler.jl the methods of [Borisov and Metelkin (2020)](#ref-BM2020a), and AdvancedHMC.jl, by [Xu, Ge, Tebbutt, Tarek, Trapp and Ghahramani (2020)](#ref-XGTTT...2020a), the No-U-Turn sampler of [Hoffman and Gelman (2014)](#ref-HG2014a).

The PEtab format of [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) lets a problem written in the standard format replace the built-in one.

## The built-in problem

All estimation models share one problem, the Michaelis–Menten example of the PEtab.jl tutorial: S + E ⇌ SE → P + E, with rates c1, c2 and a known c3 = 3, an unknown initial substrate S0, and measurements of S + E, with a known noise standard deviation of 3, and of P, with an unknown σ. The data are simulated at c1 = 1, c2 = 10, S0 = 100 and σ = 1, at 21 times from 0 to 10, with noise drawn using **Seed**.

Because the true values are known, **Parameter Values** can compare every estimate with the value that simulated the data.

## How the panel is organised

**Optimizer**, **Gradient Method** and **n Starts** control the fits; **Confidence Level** the profiles; **Sampler**, **Target Acceptance**, **n Samples** and **n Chains** the posterior sampling. **Observed Outputs** chooses the measurements of the structural model, and **PEtab YAML (Optional)** replaces the built-in problem.

The actions fall into five groups: Visualise shows the fit, the waterfall of the starts and the profiles; Diagnose examines the standardised residuals and identifiability; Predict simulates the fitted model and a new condition with half the enzyme; Compare sets optimisers and gradient methods side by side; and Interpret gives confidence or credible intervals and the estimates against the true values.

## References

<a id="ref-BW1988a"></a>Bates, D. M., & Watts, D. G. (1988). *Nonlinear Regression Analysis and Its Applications*. Wiley. [doi:10.1002/9780470316757](https://doi.org/10.1002/9780470316757)

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

<a id="ref-HG2014a"></a>Hoffman, M. D., & Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C., & Isaacson, S. A. (2023). Catalyst: Fast and Flexible Modeling of Reaction Networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

<a id="ref-MGALS...2021a"></a>Ma, Y., Gowda, S., Anantharaman, R., Laughman, C., Shah, V., & Rackauckas, C. (2021). ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling. [doi:10.48550/arXiv.2103.05244](https://doi.org/10.48550/arXiv.2103.05244)

<a id="ref-PFGLO...2025a"></a>Persson, S., Fröhlich, F., Grein, S., Loman, T., Ognissanti, D., Hasselgren, V., Hasenauer, J., & Cvijovic, M. (2025). PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling. *Bioinformatics* 41(9). [doi:10.1093/bioinformatics/btaf497](https://doi.org/10.1093/bioinformatics/btaf497)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-XGTTT...2020a"></a>Xu, K., Ge, H., Tebbutt, W., Tarek, M., Trapp, M., & Ghahramani, Z. (2020). AdvancedHMC.jl: A Robust, Modular and Efficient Implementation of Advanced HMC Algorithms. *Proceedings of The 3rd Symposium on Advances in Approximate Bayesian Inference* 118, 1-10.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](identifiability.md)
