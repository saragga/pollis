# ODE Inference Methods: PEtab Format

PEtab is a standard format for parameter estimation problems with ODE models. The panel builds its problem in Julia with PEtab.jl, and also reads a problem written in the standard format.

## A format for estimation problems

[Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) introduced PEtab because estimation toolboxes used their own input formats, which made it hard to reuse a problem or reproduce its results in another tool. The format describes everything an estimation needs: the model, the experimental conditions, the observables and their noise models, the measurements, and the parameters to estimate.

The authors implemented support in eight systems biology toolboxes, among them COPASI, AMICI, pyPESTO, Data2Dynamics and MEIGO, and provide a Python library for validating problems and visualising results.

## The files

| File | Content |
|---|---|
| Model (SBML) | The biological process, in the Systems Biology Markup Language; any existing SBML model can be used without change |
| Conditions (TSV) | The conditions of each experiment, such as drug stimuli or genetic backgrounds, and the model properties they change |
| Observables (TSV) | Observation functions linking states and parameters to the data, and noise models, normal or Laplace, on a linear or log scale |
| Measurements (TSV) | The data, linked to conditions and observables by their identifiers |
| Parameters (TSV) | The parameters to estimate, with bounds, transformations and optional priors |
| Visualisation (TSV) | Optional instructions for plotting data and simulations |
| Problem (YAML) | The file that links all the others into one problem |

The parameter table's priors can inform starting points or serve Bayesian inference, as [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) note.

## PEtab.jl

[Persson, Fröhlich, Grein, Loman, Ognissanti, Hasselgren, Hasenauer and Cvijovic (2025)](#ref-PFGLO...2025a) describe PEtab.jl as a Julia importer for problems in the PEtab format that aims to support the whole modelling pipeline, from parameter estimation to identifiability analysis. Its documentation lists wrappers for Optim.jl, Ipopt.jl, Fides.jl and Optimization.jl, profile likelihoods through LikelihoodProfiler.jl, and Bayesian inference through AdvancedHMC.jl.

A problem can also be defined directly in Julia. The documentation lists its parts: a dynamic model, given as a Catalyst `ReactionSystem` or a ModelingToolkit system; `PEtabObservable`s with observable and noise formulas; `PEtabParameter`s for the parameters to estimate; a measurement table as a `DataFrame`; and optional simulation conditions. `PEtabModel` collects them, and `PEtabODEProblem` adds the solver and derivative settings.

## The built-in problem

The panel's default follows the PEtab.jl tutorial: Michaelis–Menten kinetics, S + E ⇌ SE → P + E, written as a Catalyst reaction network with rates c1, c2 and c3. With mass-action kinetics, the reactions give

dS/dt = c2·SE − c1·S·E,  dE/dt = (c2 + c3)·SE − c1·S·E

dSE/dt = c1·S·E − (c2 + c3)·SE,  dP/dt = c3·SE

E, SE and P start at 50, 0 and 0, S at the unknown S0, and c3 = 3 is known. Two observables are measured, S + E with known noise standard deviation 3 and P with unknown σ. The code simulates both at times 0, 0.5, …, 10 with c1 = 1, c2 = 10, S0 = 100 and σ = 1, adds normal noise drawn with **Seed**, and estimates c1, c2, S0 and σ.

## Scales, bounds and priors

By default, PEtab.jl gives every `PEtabParameter` the bounds [10⁻³, 10³] and estimates it on a log10 scale; its documentation notes that these defaults typically improve estimation. [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) likewise recommend a log scale for parameters that are non-negative by definition. The estimates come back on the estimation scale, as `log10_c1` and so on, and the panel's `linear()` maps them back.

**Bayesian Inference** gives each parameter a prior, which PEtab.jl evaluates on the linear scale: log-normal priors on c1, c2 and σ, and `LogNormal(4.5, 0.5)` on S0, whose median is about 90. Without a prior, the default is a uniform distribution over the bounds.

## A problem of one's own

**PEtab YAML (Optional)** takes the path of a problem in the standard format, which `PEtabModel(yaml)` then imports in place of the built-in one. Priors for **Bayesian Inference** then come from its parameter table.

As the tooltip of the input states, the comparisons with true values and the prediction under a new condition apply to the built-in problem only: **Parameter Values** prints true values only for it, and **New Condition** stops with an error for an imported problem, since it changes E(0), a species of the built-in model. Catalyst.jl, by [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), and ModelingToolkit, by [Ma, Gowda, Anantharaman, Laughman, Shah and Rackauckas (2021)](#ref-MGALS...2021a), provide the symbolic model systems on which PEtab.jl builds.

## References

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C., & Isaacson, S. A. (2023). Catalyst: Fast and Flexible Modeling of Reaction Networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

<a id="ref-MGALS...2021a"></a>Ma, Y., Gowda, S., Anantharaman, R., Laughman, C., Shah, V., & Rackauckas, C. (2021). ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling. [doi:10.48550/arXiv.2103.05244](https://doi.org/10.48550/arXiv.2103.05244)

<a id="ref-PFGLO...2025a"></a>Persson, S., Fröhlich, F., Grein, S., Loman, T., Ognissanti, D., Hasselgren, V., Hasenauer, J., & Cvijovic, M. (2025). PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling. *Bioinformatics* 41(9). [doi:10.1093/bioinformatics/btaf497](https://doi.org/10.1093/bioinformatics/btaf497)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Profile Likelihood](profile-likelihood.md) · [Identifiability](identifiability.md)
