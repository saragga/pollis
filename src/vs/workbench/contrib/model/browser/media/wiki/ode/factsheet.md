# Parameter Estimation for ODEs: Factsheet

The panel's tabs, inputs, functions and sources at a glance.

## Tabs

| Tab | Output | Main function |
|---|---|---|
| **Single-Start** | Negative log-likelihood, iterations, convergence and estimates | `calibrate` |
| **Multi-Start** | Best negative log-likelihood, number of starts within 0.1 of it, estimates | `calibrate_multistart` |
| **Profile Likelihood** | Confidence interval and return codes of every parameter | `ProfileLikelihoodProblem`, `LikelihoodProfiler.solve` |

Every tab runs on the built-in problem below unless **PEtab YAML (Optional)** names another, and prints its estimates or interval ends on the linear scale.

## Inputs

| Input | Default | Tabs |
|---|---|---|
| **PEtab YAML (Optional)** | empty: the built-in problem | all |
| **Seed** | 1 | all |
| **Optimizer** | Optim IPNewton | single, multi, profile |
| **Gradient Method** | ForwardDiff | all |
| **n Starts** | 50 | multi, profile |
| **Confidence Level** | 0.95 | profile |

## The built-in problem

| Item | Value |
|---|---|
| Reactions | S + E → SE (c1), SE → S + E (c2), SE → P + E (c3 = 3) |
| Initial values | S = S0, E = 50, SE = 0, P = 0 |
| Observables | S + E, noise sd 3; P, noise sd σ |
| True values | c1 = 1, c2 = 10, S0 = 100, σ = 1 |
| Data | 21 times, 0 to 10 in steps of 0.5 |
| Estimation scale | log10, bounds [10⁻³, 10³] |
| ODE solver | `Rodas5P()` |

## Key results

| Result | Source |
|---|---|
| A standard format for estimation problems, in SBML and tables linked by YAML | [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) |
| Profile likelihood detects structural and practical non-identifiability and gives confidence intervals | [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) |
| Confidence intervals by constrained optimisation, in LikelihoodProfiler.jl | [Borisov and Metelkin (2020)](#ref-BM2020a) |
| Multi-start local optimisation with Latin hypercube starts outperformed the other methods compared | [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) |

## Further sources

| Topic | Work |
|---|---|
| Benchmarks of optimisation methods for kinetic models | [Villaverde, Fröhlich, Weindl, Hasenauer and Banga (2019)](#ref-VFWHB2019a) |
| Trust-region optimisation for ODE models | [Fröhlich and Sorger (2022)](#ref-FS2022a) |
| Nonlinear regression | [Bates and Watts (1988)](#ref-BW1988a) |
| PEtab.jl, Catalyst.jl and ModelingToolkit | [Persson, Fröhlich, Grein, Loman, Ognissanti, Hasselgren, Hasenauer and Cvijovic (2025)](#ref-PFGLO...2025a), [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), [Ma, Gowda, Anantharaman, Laughman, Shah and Rackauckas (2021)](#ref-MGALS...2021a) |

## References

<a id="ref-BW1988a"></a>Bates, D. M., & Watts, D. G. (1988). *Nonlinear Regression Analysis and Its Applications*. Wiley. [doi:10.1002/9780470316757](https://doi.org/10.1002/9780470316757)

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-FS2022a"></a>Fröhlich, F., & Sorger, P. K. (2022). Fides: Reliable Trust-Region Optimization for Parameter Estimation of Ordinary Differential Equation Models. *PLOS Computational Biology* 18(7), e1010322. [doi:10.1371/journal.pcbi.1010322](https://doi.org/10.1371/journal.pcbi.1010322)

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C., & Isaacson, S. A. (2023). Catalyst: Fast and Flexible Modeling of Reaction Networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

<a id="ref-MGALS...2021a"></a>Ma, Y., Gowda, S., Anantharaman, R., Laughman, C., Shah, V., & Rackauckas, C. (2021). ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling. [doi:10.48550/arXiv.2103.05244](https://doi.org/10.48550/arXiv.2103.05244)

<a id="ref-PFGLO...2025a"></a>Persson, S., Fröhlich, F., Grein, S., Loman, T., Ognissanti, D., Hasselgren, V., Hasenauer, J., & Cvijovic, M. (2025). PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling. *Bioinformatics* 41(9). [doi:10.1093/bioinformatics/btaf497](https://doi.org/10.1093/bioinformatics/btaf497)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-VFWHB2019a"></a>Villaverde, A. F., Fröhlich, F., Weindl, D., Hasenauer, J., & Banga, J. R. (2019). Benchmarking Optimization Methods for Parameter Estimation in Large Kinetic Models. *Bioinformatics* 35(5), 830-838. [doi:10.1093/bioinformatics/bty736](https://doi.org/10.1093/bioinformatics/bty736)
## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](../odeident/identifiability.md)
