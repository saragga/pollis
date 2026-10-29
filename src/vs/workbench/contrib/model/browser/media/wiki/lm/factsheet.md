# Linear Regression — Factsheet

**Linear regression** models a continuous response as y = X beta + e: a linear combination of predictors plus an error. Ordinary least squares estimates beta as the coefficients that minimise the sum of squared residuals, beta = (X'X)^-1 X'y. The method is simple, but its inference depends on what is assumed about the errors, and choosing the right standard errors is most of the work.

| | |
|---|---|
| **Purpose** | Estimate how the mean of a response changes with predictors, with valid confidence intervals and tests |
| **Input** | A table with a continuous response and predictors; for HAC, rows in time order; for clustered and Driscoll-Kraay, cluster, entity and time identifiers |
| **Core packages** | [GLM.jl](https://github.com/JuliaStats/GLM.jl), [Regress.jl](https://github.com/gragusa/Regress.jl), [CovarianceMatrices.jl](https://github.com/gragusa/CovarianceMatrices.jl) |
| **Models** | Standard, HC0-HC3, HAC, Clustered, Driscoll-Kraay |
| **Output** | Coefficients, standard errors, t statistics, p-values, confidence intervals, R-squared, F test |
| **Key choice** | The covariance estimator, which must match how the errors depart from independence and constant variance |

## When to Use

- The response is **continuous** and roughly linear in the predictors (after transformations such as logs, if needed).
- You want **interpretable effects**: each coefficient is the change in the mean response for a one-unit change in its predictor, the others held fixed.
- The data are **cross-sections, time series or panels**, with standard errors that allow for heteroskedasticity, autocorrelation or clustering.

## What It Is Not

Robust standard errors fix the inference, not the estimates: if the model omits a confounder or the relationship is not linear, the coefficients are biased whatever the standard errors. For binary, count or positive skewed responses see Generalised Linear Models; for many predictors and prediction, regularised regression; for fixed effects and instruments, the panel and IV methods.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
