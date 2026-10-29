# Generalized Method of Moments (GMM) — Factsheet

The **GMM estimator** minimises Q(theta) = g(theta)' W g(theta), where g(theta) = (1/n) sum of z_i (y_i - x_i'theta) is the vector of sample moments and W a positive definite weighting matrix. With as many moments as parameters the solution sets g to zero and W does not matter; with more, W decides how the moments are traded off, and W = S^-1, the inverse covariance of the moments, is efficient.

| | |
|---|---|
| **Purpose** | Estimate parameters from moment conditions, here a linear model with endogenous regressors, efficiently under heteroskedasticity |
| **Input** | A Tables.jl table, the names of the response, the exogenous and endogenous regressors and the excluded instruments; a cluster column for the cluster bootstrap |
| **Core packages** | [GMMTools.jl](https://github.com/Gkreindler/GMMTools.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Estimators** | Two-Step Efficient GMM, One-Step GMM (2SLS Weights), Two-Step GMM with Cluster Bootstrap SEs |
| **Output** | Coefficients, sandwich or bootstrap standard errors, z statistics, p-values, intervals, Hansen's J |
| **Key choice** | The moment conditions (which instruments) and the weighting matrix |

## When to Use

- **Endogenous regressors with more instruments than needed**, and errors that may be heteroskedastic: two-step GMM is more efficient than 2SLS.
- **A test of the instruments** that is robust to heteroskedasticity: Hansen's J.
- **Models defined by moment conditions** rather than a likelihood: Euler equations, asset pricing, dynamic panels, structural models. Changing the moment function in the code extends the panel to them.

## What It Is Not

GMM does not make invalid instruments valid, and is as sensitive to weak instruments as 2SLS. With many moments and a small sample, the estimated optimal weight is noisy, and two-step GMM can be more biased than 2SLS with standard errors that are too small. For the instrumental-variables workflow with first-stage diagnostics and Anderson-Rubin intervals, see Two-Stage Least Squares.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
