# Generalized Linear Models — Factsheet

A **generalized linear model** relates a response to covariates through a link function g: g(mean) = b0 + b1 x1 + ... + bp xp, with the response drawn from an exponential-family distribution. It extends linear regression to binary, count and positive skewed responses, keeping the fitted means in their natural range (probabilities between 0 and 1, positive counts and amounts).

| | |
|---|---|
| **Purpose** | Model how covariates change the mean of a non-normal response |
| **Input** | A table with the response and the covariates; for the Binomial, successes and trials; for clustered errors, a cluster variable |
| **Core packages** | [GLM.jl](https://github.com/JuliaStats/GLM.jl), [CovarianceMatrices.jl](https://github.com/gragusa/CovarianceMatrices.jl) |
| **Families** | Bernoulli, Binomial, Poisson, Negative Binomial, Geometric, Gamma, Inverse Gaussian, Normal |
| **Output** | Coefficients with standard errors, z statistics, p-values and intervals; deviance, log-likelihood, AIC and BIC |
| **Key choice** | The family (from the kind of response and how its variance grows with the mean) and the link (canonical, or one easier to interpret) |

## When to Use

- The response is **binary, a proportion, a count or a positive amount**, and a linear model would predict impossible values or have the wrong variance.
- You want effects on an interpretable scale: **odds ratios** (logit), **rate ratios** (log link for counts), **multiplicative effects** (log link for amounts).
- The **variance depends on the mean** in a way a family describes.

## What It Is Not

A GLM still assumes one linear predictor, independent observations (or a robust correction for clusters) and the right variance function. It does not handle repeated measures or random effects (see the mixed models), excess zeros beyond what the family allows, or censored responses (see Time-to-Event Analysis). Its coefficients are associations unless the design makes them causal.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
