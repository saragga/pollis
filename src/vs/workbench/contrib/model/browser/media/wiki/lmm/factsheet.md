# Linear Mixed-Effects Models — Factsheet

A **linear mixed-effects model** writes the response as y = X beta + Z b + e, with fixed effects beta shared by all observations and random effects b ~ N(0, Sigma) specific to each group. The random effects capture the correlation of observations within a group, and their covariance Sigma is estimated with the fixed effects by maximum likelihood (or REML). The panel also fits the fixed-effects alternative, which absorbs a separate intercept for each group instead.

| | |
|---|---|
| **Purpose** | Estimate effects in grouped, clustered or panel data, allowing for the correlation within groups and measuring how much the groups differ |
| **Input** | A table with a continuous response, predictors and a grouping factor; for the fixed-effects models, a time variable; for IV, instruments |
| **Core packages** | [MixedModels.jl](https://github.com/JuliaStats/MixedModels.jl), [FixedEffectModels.jl](https://github.com/FixedEffects/FixedEffectModels.jl) |
| **Models** | Mixed-Effects, Panel Fixed-Effects, Two-Way Fixed-Effects, IV / 2SLS |
| **Output** | Fixed-effect coefficients and standard errors; variance components and random-effect predictions (BLUPs); for fixed effects, within R-squared and robust or clustered standard errors |
| **Key choice** | Random or fixed group effects: random effects are more efficient and estimate the between-group variance, fixed effects stay consistent when the group effects are correlated with the predictors |

## When to Use

- Observations come in **groups** (pupils in schools, measurements on patients, firms over years), and the groups matter.
- You want the **variance components**: how much of the variation is between groups, and how much the slopes differ across groups.
- Some groups have **few observations**: random effects borrow strength across groups, shrinking unreliable group estimates toward the mean.
- The groups are **crossed or nested** (subjects and items, pupils in classes in schools).

## What It Is Not

A mixed model does not remove confounding by unobserved group characteristics: if the group effects are correlated with the predictors, the random-effects estimates are biased, and the fixed-effects models are the remedy. The random effects must be normal and the response continuous; for binary or count responses see Generalized Linear Mixed-Effects Models. For two-stage least squares without fixed effects, and its full diagnostics, see Two-Stage Least Squares.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
