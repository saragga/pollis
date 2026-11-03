# Uncertainty Quantification

A point estimate of a nonlinear mixed model says little without a measure of its precision. `NoLimits.jl` computes uncertainty with `compute_uq`, whose backends differ in their assumptions and their cost.

## Which Uncertainty Methods compute_uq Offers

| `method` | Typical source fit | Output | Main assumption |
|---|---|---|---|
| `:wald` | **Laplace**, **SAEM**, **MCEM** and other point estimators | Covariance and normal intervals | The likelihood is close to quadratic near the optimum |
| `:chain` | **MCMC** and variational fits | Intervals from posterior draws | The chains have mixed, and the priors are acceptable |
| `:profile` | `MLE`, `MAP`, **Laplace** | Profile-likelihood intervals | The approximate likelihood is accurate along each profile |
| `:mcmc_refit` | Point estimators | Intervals from a new posterior run | Priors on the fixed effects |

With no `method` given, `compute_uq` uses `:chain` after **MCMC** and `:wald` otherwise. **Uncertainty Intervals** uses that default.

## How Wald Intervals Work in a Nonlinear Mixed Model

Wald intervals invert the curvature of the log-likelihood at the optimum to get a covariance matrix, then report the estimate plus or minus a normal quantile times the standard error. The computation is done on the transformed scale, so an interval on a log-scale parameter stays positive when mapped back. Wald intervals are cheap, needing only the curvature at one point, and they are a reasonable default for well-identified parameters. They can mislead near a boundary, such as a between-subject spread close to zero.

## When to Use a Sandwich Covariance

The Hessian covariance assumes that the model is correct. `vcov=:sandwich` in `compute_uq` uses the robust form of [White (1982)](#ref-Whi1982a), which stays valid for the parameter values closest to the truth under a misspecified model. A large gap between the two forms is itself a warning about the model. With few subjects, the sandwich form can be noisy, so an agreement between the two is more informative than a choice of one over the other.

## When Profile Likelihood Is Better Than Wald Intervals

A profile fixes one parameter at a series of values and reoptimizes the others, and the interval comes from the drop in likelihood. Profile intervals can be asymmetric and need no quadratic shape, so they suit parameters near a boundary or along a ridge. A profile that never falls far enough to close an interval shows that the data do not bound the parameter, the identifiability check of [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a). The `:profile` method needs `LikelihoodProfiler.jl` and `OptimizationNLopt.jl`, and each profile takes many fits.

## How to Read Posterior Intervals From MCMC

Posterior intervals come directly from the draws, with no quadratic assumption, and they carry through to any function of the parameters: a half-life drawn from the chains already has its interval. They are credible intervals under the chosen priors, so a sensitivity check with wider priors is worthwhile when the data are thin. **Posterior Chain Summary** shows whether the draws can be trusted, and the short default run in the Example Code is only a demonstration.

## How Uncertainty in Random Effects Differs From Uncertainty in Fixed Effects

`compute_uq` covers fixed effects, including omega and sigma. **Random Effects per Subject** reports point estimates, and each one has its own uncertainty, large for a subject with few observations or with high shrinkage. A standard error for omega also tends to be unreliable with few subjects, because omega measures spread across subjects and only that number of subjects informs it. Whichever backend is used, the number of subjects limits the precision of population parameters, more than the number of observations does.

## References

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U. and Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923–1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

<a id="ref-Whi1982a"></a>White, H. (1982). Maximum Likelihood Estimation of Misspecified Models. *Econometrica* 50(1), 1–25. [doi:10.2307/1912526](https://doi.org/10.2307/1912526)

## See Also

- [Estimation Methods](estimation-methods.md) · [Diagnostics](diagnostics.md) · [Factsheet](factsheet.md) · [ODE Dynamics](ode-dynamics.md)
