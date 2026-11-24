# Parameter Estimation for ODEs: Decision Guide

Which tab to run, in which order, and how to set the optimiser and the gradient method.

## Choosing a tab

| Question | Tab |
|---|---|
| A quick point estimate | **Single-Start** |
| A point estimate that does not depend on one start | **Multi-Start** |
| Confidence intervals and practical identifiability | **Profile Likelihood** |

The panel's decision table gives the same order: a point estimate, a robust point estimate, and intervals with identifiability. Two questions belong to other panels: whether the parameters can be recovered at all from the chosen outputs, which Structural Identifiability of ODEs answers before any fitting, and the full posterior with prior knowledge, which Bayesian Inference for ODEs samples.

## A workflow

1. Check the model in Structural Identifiability of ODEs, with the outputs that can be measured.
2. Fit with **Multi-Start** and look at **Waterfall Plot**: a long first plateau means the best fit is found repeatedly.
3. Check the fit with **Observed vs. Simulated** and **Residual Analysis**.
4. Run **Profile Likelihood** for intervals, and read **Identifiability** for parameters with open profiles.
5. With prior knowledge, go on to Bayesian Inference for ODEs.

[Fröhlich and Sorger (2022)](#ref-FS2022a) stress that reliable model calibration is essential for uncertainty analysis, model comparison and biological interpretation.

## One start or many

[Villaverde, Fröhlich, Weindl, Hasenauer and Banga (2019)](#ref-VFWHB2019a) found in their benchmarks that a multi-start of gradient-based local methods is often a successful strategy, thanks to recent advances in the calculation of parametric sensitivities, while a hybrid metaheuristic can perform better. [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) found that multi-start deterministic optimisation with sensitivity equations and Latin-hypercube starts outperformed the other methods they compared.

**Single-Start** is fast and useful for a first look, but its result depends on one start; **Multi-Start** with **n Starts** = 50 shows, through the waterfall, how often the best minimum is reached.

## The optimiser

The PEtab.jl documentation recommends an optimiser by model size:

| Model size | Recommendation |
|---|---|
| Small: under 10 ODEs and under 20 parameters | `Optim.IPNewton()` with the exact Hessian |
| Medium: about 10 to 20 ODEs and under 75 parameters | `Fides.CustomHessian()` with a Gauss-Newton Hessian |
| Large: over 20 ODEs or over 75 parameters | (L)BFGS methods, such as Ipopt or `Fides.BFGS()` |

**Optimizer** offers Fides with the exact Hessian, Fides with BFGS, Optim IPNewton and Optim LBFGS. [Fröhlich and Sorger (2022)](#ref-FS2022a) implemented the trust-region method of Fides with several Hessian approximations. **Compare Optimizers** runs all four from the same starts and reports how often each reaches the best value.

## The gradient method

The PEtab.jl documentation describes forward-mode automatic differentiation with ForwardDiff as often the fastest for small models, and reports that benchmarks often find adjoint sensitivities most efficient for large models. **Gradient Method** offers ForwardDiff, forward sensitivity equations and adjoints; the adjoint method needs SciMLSensitivity, which the panel loads.

**Compare Gradients** computes the gradient with all three at a start point away from the optimum, and prints the largest relative difference from ForwardDiff and the time of each.

## Your own problem

**PEtab YAML (Optional)** loads a problem in the PEtab format of [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) instead of the built-in one: an SBML model and tables of conditions, observables, measurements and parameters, linked by a YAML file. The fits and profiles work as before; **Parameter Values** then has no true values to compare with, and **New Condition**, written for the Michaelis–Menten species, asks to be adapted.

## References

<a id="ref-FS2022a"></a>Fröhlich, F., & Sorger, P. K. (2022). Fides: Reliable Trust-Region Optimization for Parameter Estimation of Ordinary Differential Equation Models. *PLOS Computational Biology* 18(7), e1010322. [doi:10.1371/journal.pcbi.1010322](https://doi.org/10.1371/journal.pcbi.1010322)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-VFWHB2019a"></a>Villaverde, A. F., Fröhlich, F., Weindl, D., Hasenauer, J., & Banga, J. R. (2019). Benchmarking Optimization Methods for Parameter Estimation in Large Kinetic Models. *Bioinformatics* 35(5), 830-838. [doi:10.1093/bioinformatics/bty736](https://doi.org/10.1093/bioinformatics/bty736)
## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](../odeident/identifiability.md)
