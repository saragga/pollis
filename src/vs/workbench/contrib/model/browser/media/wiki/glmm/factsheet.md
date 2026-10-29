# Generalized Linear Mixed-Effects Models — Factsheet

A **GLMM** models g(E[y | b]) = X beta + Z b, where g is the link function, beta the fixed effects, and b ~ N(0, Sigma) the random effects of the groups; given the random effects, y follows an exponential-family distribution. It extends the generalized linear model to grouped data, as the linear mixed model extends linear regression.

| | |
|---|---|
| **Purpose** | Model binary, count or positive responses in grouped, clustered or longitudinal data |
| **Input** | A table with the response, predictors and one or more grouping factors |
| **Core packages** | [MixedModels.jl](https://github.com/JuliaStats/MixedModels.jl) |
| **Families** | Bernoulli, Binomial, Poisson, NegativeBinomial, Gamma, InverseGaussian, Normal |
| **Output** | Fixed effects on the link scale, variance components, random-effect predictions, log-likelihood, AIC and BIC |
| **Key choice** | The family and link, and a random-effects structure the data can support |

## When to Use

- The response is **binary, a count or a proportion**, and observations are grouped (patients in hospitals, pupils in schools, repeated measures on subjects).
- You want effects **for a typical group** with the correlation within groups allowed for, or estimates of how much groups differ.
- Groups have **few observations**, and estimating a fixed effect per group would be noisy or impossible (a group whose outcomes are all 0).

## What It Is Not

A GLMM gives **conditional** (group-specific) effects: under a nonlinear link they are not the population-averaged effects, which are smaller in absolute value; for those, use a GLM with cluster-robust standard errors or GEE. The random effects are assumed normal and unrelated to the predictors. For a continuous response with normal errors, see Linear Mixed-Effects Models.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
