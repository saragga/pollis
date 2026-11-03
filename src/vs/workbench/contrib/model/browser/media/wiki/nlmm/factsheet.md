# Factsheet

**Nonlinear Mixed Models** fits longitudinal models whose parameters vary by subject, using `NoLimits.jl`. The tabs set the structure of the model, and **Estimation** sets how it is fitted.

## What the Nonlinear Mixed Models Panel Does

| Item | Detail |
|---|---|
| Purpose | Estimate typical parameters, their spread between subjects, and each subject's deviation |
| Julia stack | `NoLimits.jl` for models and estimators, `Distributions.jl` for distributions, `OrdinaryDiffEq.jl` for solvers, `Turing.jl` for MCMC, `CairoMakie.jl` for plots |
| Workflow | `@Model`, then `DataModel`, then `fit_model` |
| Input shape | A long table with one row per observation or event, in any Tables.jl form |
| Required columns | A subject identifier and a time column, plus the outcome and any covariates the model names |
| Julia versions | The `NoLimits.jl` documentation lists Julia 1.10 to 1.12 |

## How the Tabs of the Nonlinear Mixed Models Panel Differ

| Tab | Structure of the first level | Key `NoLimits.jl` parts | Extra columns in the table |
|---|---|---|---|
| **Nonlinear Curves** | Closed-form formula | `@formulas` | None |
| **ODE Dynamics** | Differential equations with dosing | `@preDifferentialEquation`, `@DifferentialEquation`, `@initialDE`, `set_solver_config` | `EVID`, `AMT`, `RATE`, `CMT` |
| **Markov Models** | Continuous-time hidden Markov model | `ContinuousTimeDiscreteStatesHMM` | `dt` |
| **Neural Components** | Formula containing a feed-forward network | `FFNNParameters` | The network's input, here `x` |

## How the Estimation Options of the Nonlinear Mixed Models Panel Differ

| **Estimation** option | `NoLimits.jl` method | Treatment of the random effects | Uses priors | Result |
|---|---|---|---|---|
| **Laplace** | `NoLimits.Laplace()` | Second-order approximation at the mode | No | Point estimates and empirical Bayes modes |
| **FOCEI** | `NoLimits.FOCEI()` | The same form with Fisher-information curvature | No | Point estimates and empirical Bayes modes |
| **SAEM** | `NoLimits.SAEM()` | Simulation with stochastic approximation | No | Point estimates and sampled random effects |
| **MCEM** | `NoLimits.MCEM()` | Simulation inside each EM step | No | Point estimates and sampled random effects |
| **MCMC** | `NoLimits.MCMC(...)` | Sampled with the parameters | Yes, on all free fixed effects | Posterior chains |

## Which Estimators Work on Which Tab of the Nonlinear Mixed Models Panel

**FOCEI** covers common outcome families, such as `Normal`, `Poisson` and `Bernoulli`, and refuses Markov outcomes, so **Markov Models** does not offer it. `NoLimits.Laplace()` is the estimation method and differs from the `Laplace` distribution of `Distributions.jl`. MCMC needs `import Turing`: the `using` form brings in names that clash with `NoLimits.jl`. The fitted scale of each parameter comes from its `scale` keyword, such as `:log` for a positive parameter and `:logit` for a probability.

## See Also

- [Overview](overview.md) · [Estimation Methods](estimation-methods.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
