# Penalised & Projection Regression — Factsheet

**Penalised regression** estimates beta by minimising the sum of squared residuals plus a penalty, lambda (alpha |beta|_1 + (1 - alpha)/2 |beta|_2^2): the lasso (alpha = 1) sets small coefficients exactly to zero, ridge (alpha = 0) shrinks all of them, and the elastic net mixes the two. **Projection regression** (PLSR) regresses the response on a few latent components of the predictors. Both trade a little bias for a large reduction in variance.

| | |
|---|---|
| **Purpose** | Predict well and select predictors when there are many, possibly more than observations, or when they are strongly correlated |
| **Input** | A table and a formula for the penalised models; a feature matrix and a response for PLSR, with an optional test matrix |
| **Core packages** | [Lasso.jl](https://github.com/JuliaStats/Lasso.jl), LinearAlgebra (PLSR) |
| **Models** | Lasso, ElasticNet, PLSR |
| **Output** | Coefficients along the path and at the chosen lambda, the selected predictors, deviance; for PLSR, the coefficients and predictions |
| **Key choice** | How strongly to penalise: lambda (and alpha), or the number of PLS components, chosen by AICc, BIC or cross-validation |

## When to Use

- **Prediction** with many candidate predictors, where least squares would overfit.
- **Variable selection**: a sparse model that names the few predictors that matter (lasso, elastic net).
- **More predictors than observations** (p > n), where least squares has no unique solution.
- **Strong multicollinearity**: ridge, the elastic net and PLSR stay stable where OLS coefficients swing.

## What It Is Not

The penalty biases the coefficients toward zero, and the usual standard errors and p-values do not apply after selection: the panel offers bootstrap intervals and selection frequencies instead, which describe stability, not classical inference. The lasso picks predictors that predict, not causes; among correlated predictors its choice can be arbitrary. For a linear model with few, well-chosen predictors, see Linear Regression.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
