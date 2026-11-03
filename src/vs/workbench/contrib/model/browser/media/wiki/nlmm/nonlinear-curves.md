# Nonlinear Curves

A closed-form curve is the simplest nonlinear mixed model: the mean response is a formula in time, covariates and each subject's parameters.

## What the Nonlinear Curves Tab Fits

The **Nonlinear Curves** tab fits an exponential decay in which each subject has its own baseline:

y_ij = A exp(eta_i) exp(-k t_ij) + e_ij, with eta_i ~ Normal(0, omega²) and e_ij ~ Normal(0, sigma²)

Here i indexes subjects and j their observations. A and k are the typical baseline and decay rate, omega is the spread of the baseline between subjects, and sigma is the residual spread. All four are fixed effects in `NoLimits.jl`, and eta is the random effect. The form follows the general model of [Lindstrom and Bates (1990)](#ref-LB1990a).

## How to Write a Nonlinear Curve in NoLimits.jl

`@fixedEffects` declares each parameter with a starting value and a scale, such as `RealNumber(0.5, scale=:log)` for a positive rate. `@covariates` names the columns the formula reads. `@randomEffects` names each random effect, its distribution and its grouping column. `@formulas` states the outcome's distribution, as in `y ~ Normal(mean, sigma)`, so changing the outcome type means changing that line: a count outcome could use `Poisson`, and a measurement below a limit of detection could use `censored(...)`.

## Why Multiplicative Random Effects Are Common in Nonlinear Curves

Writing a positive parameter as a typical value times `exp(eta)` keeps every subject's value positive and makes eta a proportional deviation. An omega of 0.25 means subjects typically differ by about 25 percent. The typical value A is then the median across subjects, not the mean, because the exponential skews the distribution. Random effects can enter any parameter: placing them on both A and k lets subjects differ in level and speed, though each one added needs enough observations per subject to be estimated.

## Which Curve Shapes Suit a Nonlinear Mixed Model

Common shapes include exponential decay for elimination and depreciation, logistic and Gompertz curves for growth with a ceiling, and the Emax form for dose-response relationships that saturate. [Pinheiro and Bates (2000)](#ref-PB2000a) work through many of them. A shape is a good choice when each of its parameters has a clear meaning, as a parameter the data barely inform leads to a fit that wanders along a ridge.

## How to Read the Results of the Nonlinear Curves Tab

`NoLimits.summarize` lists the estimates on their natural scale, with the objective value and a summary of the random effects. **Half-Life** turns the decay rate into the time for the curve to halve, log(2) / k. **Random Effects per Subject** shows how far each subject sits from the typical one, as a proportional deviation in this model. **Fitted Trajectories** should be the first plot to look at, before any of the numbers.

## References

<a id="ref-LB1990a"></a>Lindstrom, M. J. and Bates, D. M. (1990). Nonlinear Mixed Effects Models for Repeated Measures Data. *Biometrics* 46(3), 673–687. [doi:10.2307/2532087](https://doi.org/10.2307/2532087)

<a id="ref-PB2000a"></a>Pinheiro, J. C. and Bates, D. M. (2000). *Mixed-Effects Models in S and S-PLUS*. Springer New York. [doi:10.1007/978-1-4419-0318-1](https://doi.org/10.1007/978-1-4419-0318-1)

## See Also

- [Factsheet](factsheet.md) · [ODE Dynamics](ode-dynamics.md) · [Neural Components](neural-components.md) · [Diagnostics](diagnostics.md)
