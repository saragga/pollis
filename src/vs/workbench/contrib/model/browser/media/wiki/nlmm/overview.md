# Overview

Repeated measurements on many subjects share a common process, yet each subject follows that process in its own way. Nonlinear mixed models describe both levels at once, and the **Nonlinear Mixed Models** panel fits them with `NoLimits.jl`.

## What a Nonlinear Mixed Model Is

A nonlinear mixed model has two levels. The first level gives each subject's expected response as a nonlinear function of time, covariates and that subject's parameters. The second level says how those parameters vary across subjects: a typical value, set by fixed effects, plus a random effect drawn from a distribution. [Lindstrom and Bates (1990)](#ref-LB1990a) set out the general model for repeated measures, and [Davidian and Giltinan (2003)](#ref-DG2003a) review its development and its uses. The textbook of [Pinheiro and Bates (2000)](#ref-PB2000a) treats linear and nonlinear mixed models together.

## Why Random Effects Make Nonlinear Models Hard to Fit

The likelihood of one subject integrates over that subject's random effects. In a linear mixed model with normal errors the integral has a closed form. In a nonlinear mixed model the random effects sit inside a nonlinear function, so the integral has no closed form and every estimator has to approximate or simulate the integral. The nonlinearity also means that the response of a typical subject differs from the average response across subjects, so the fixed effects describe the typical subject and not the population mean curve.

## What the Four Tabs of the Nonlinear Mixed Models Panel Cover

The tabs differ in how the first level is written. **Nonlinear Curves** uses a closed-form formula. **ODE Dynamics** uses differential equations with discrete inputs such as doses. **Markov Models** uses a process that moves between discrete states, here hidden behind a noisy signal. **Neural Components** puts a small network inside the model to learn a part whose form is unknown. All four tabs simulate a table with a fixed seed, so the Example Code runs as it stands.

## How One Interface Connects the Models and Estimators

[Huth, Arruda, Schmid, Gusinow, Wieland, Peiter and Hasenauer (2026)](#ref-HASGW...2026a) built `NoLimits.jl` so that model structures and estimators can be combined freely. A model is declared with `@Model`, bound to a table with `DataModel` and fitted with `fit_model`. The **Estimation** input changes only the method passed to `fit_model`. Comparing estimators on one model therefore means changing one argument, and **Compare Two Estimators** does that directly.

## How Long a First Run of the Nonlinear Mixed Models Panel Takes

Installing and compiling `NoLimits.jl` and its dependencies can take well over ten minutes the first time, on every tab. Each estimator also compiles on its first fit, which is why a first fit of a small model can take minutes while a repeat of the same fit is much faster. MCMC adds `Turing.jl`, and the plots add `CairoMakie.jl`, each with its own compilation.

## References

<a id="ref-DG2003a"></a>Davidian, M. and Giltinan, D. M. (2003). Nonlinear models for repeated measurement data: An overview and update. *Journal of Agricultural, Biological, and Environmental Statistics* 8(4), 387–419. [doi:10.1198/1085711032697](https://doi.org/10.1198/1085711032697)

<a id="ref-HASGW...2026a"></a>Huth, M., Arruda, J., Schmid, N., Gusinow, R., Wieland, V., Peiter, C. and Hasenauer, J. (2026). NoLimits.jl: Flexible and Composable Nonlinear Mixed-Effects Modeling in Julia. [doi:10.48550/arXiv.2606.24427](https://doi.org/10.48550/arXiv.2606.24427)

<a id="ref-LB1990a"></a>Lindstrom, M. J. and Bates, D. M. (1990). Nonlinear Mixed Effects Models for Repeated Measures Data. *Biometrics* 46(3), 673–687. [doi:10.2307/2532087](https://doi.org/10.2307/2532087)

<a id="ref-PB2000a"></a>Pinheiro, J. C. and Bates, D. M. (2000). *Mixed-Effects Models in S and S-PLUS*. Springer New York. [doi:10.1007/978-1-4419-0318-1](https://doi.org/10.1007/978-1-4419-0318-1)

## See Also

- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Estimation Methods](estimation-methods.md) · [Assumptions](assumptions.md)
