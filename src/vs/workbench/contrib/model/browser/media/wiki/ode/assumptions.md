# ODE Inference Methods: Assumptions

What the five models take for granted: a correct model structure, a known noise model, independent normal errors, known initial values where stated, parameters within their bounds, and, for the Bayesian model, priors that express real knowledge.

## A correct model structure

Every estimation model fits the reaction network as written. [Borisov and Metelkin (2020)](#ref-BM2020a) describe the setting: an ODE system with known rate laws, observation functions that map states to measured quantities, and unknown parameters to estimate. If the structure is wrong, the estimates are the best values for the wrong model, and the residuals show the misfit.

The structural model checks the same equations, so its verdict applies to them and to the chosen outputs, not to the system that generated real data.

## The noise model

The observables of the built-in problem have additive normal noise: a known standard deviation of 3 for S + E, and an estimated σ for P. The PEtab.jl tutorial notes that measurements are assumed normally distributed by default, with other distributions available, and the PEtab format of [Schmiester, Schälte, Bergmann, Camba, Dudkin, Egert, Fröhlich, Fuhrmann, Hauber, Kemmer, Lakrisenko, Loos, Merkt, Müller, Pathirana, Raimúndez, Refisch, Rosenblatt, Stapor, Städter, Wang, Wieland, Banga, Timmer, Villaverde, Sahle, Kreutz, Hasenauer and Weindl (2021)](#ref-SSBCD...2021a) supports noise models including normal and Laplace distributions, with observables on a linear or logarithmic scale.

[Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) stress that a realistic choice of the variance components is crucial for reliable estimates of the parameters and of their uncertainties. For additive error with known variance, [Borisov and Metelkin (2020)](#ref-BM2020a) write the objective as a sum of squared residuals, each divided by its standard deviation.

## Independent measurements

The likelihood is the product of the densities of the individual measurements, so each measurement contributes its own term to the negative log-likelihood. Errors that are correlated over time, or between the two observables, fall outside this form; the standardised residuals of **Residual Analysis** would then show runs or patterns rather than scatter.

The PEtab.jl tutorial describes the measurement table as tidy, one row per measurement, with replicates at the same time entered as separate rows.

## Known initial values and constants

E, SE and P start at the known values 50, 0 and 0, c3 = 3 is known, and only S0 among the initial values is estimated. **Structural Identifiability** makes the same assumptions: c3 is substituted and E, SE and P are passed as `known_ic`. The StructuralIdentifiability.jl documentation describes `known_ic` as an experimental feature in which the listed initial conditions are assumed known while the others stay generic.

[Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a) assume, for structural identifiability, the absence of noise and sufficiently exciting inputs.

## Bounds and scales

All four parameters are estimated on a log10 scale within [10⁻³, 10³], the PEtab.jl defaults, which its documentation reports typically improve estimation. A parameter whose true value lies outside its bounds cannot be recovered, and a fit that ends at a bound is a sign that the bounds constrain it.

The Latin-hypercube starts of **Multi-Start** are drawn within the bounds, and the profiles of **Profile Likelihood** stay within them as well, so a profile can be open on a side because it reaches a bound before the threshold.

## Asymptotic intervals

The profile-likelihood interval uses the χ² quantile of the likelihood ratio test, and the Wald interval of **Confidence Intervals** uses the Fisher information at the best fit with ±1.96 standard errors on the log10 scale. [Borisov and Metelkin (2020)](#ref-BM2020a) note that researchers often use different asymptotic methods to estimate confidence intervals, and that these can give different estimates. They add that different methods of estimating confidence intervals may lead to different definitions of identifiability, and describe the profile likelihood as one of the most common and robust ways to construct them.

## Priors and posterior sampling

**Bayesian Inference** places log-normal priors on c1, c2 and σ and a prior with median about 90 on S0. The posterior combines them with the likelihood, so priors that do not reflect real knowledge pull the posterior towards themselves. The PEtab.jl documentation notes that its Bayesian workflow infers the posterior distribution of the parameters given the data when prior knowledge is available.

Sampling assumes that the chains have reached the posterior; [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a) recommend at least four chains, an R-hat under 1.01 and an effective sample size over 400 before the draws are used.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-SSBCD...2021a"></a>Schmiester, L., Schälte, Y., Bergmann, F. T., Camba, T., Dudkin, E., Egert, J., Fröhlich, F., Fuhrmann, L., Hauber, A. L., Kemmer, S., Lakrisenko, P., Loos, C., Merkt, S., Müller, W., Pathirana, D., Raimúndez, E., Refisch, L., Rosenblatt, M., Stapor, P. L., Städter, P., Wang, D., Wieland, F.-G., Banga, J. R., Timmer, J., Villaverde, A. F., Sahle, S., Kreutz, C., Hasenauer, J., & Weindl, D. (2021). PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology. *PLOS Computational Biology* 17(1), e1008646. [doi:10.1371/journal.pcbi.1008646](https://doi.org/10.1371/journal.pcbi.1008646)

<a id="ref-VGSCB2021a"></a>Vehtari, A., Gelman, A., Simpson, D., Carpenter, B., & Bürkner, P.-C. (2021). Rank-Normalization, Folding, and Localization: An Improved R̂ for Assessing Convergence of MCMC. *Bayesian Analysis* 16(2), 667-718. [doi:10.1214/20-BA1221](https://doi.org/10.1214/20-BA1221)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](identifiability.md)
