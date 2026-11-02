# Factsheet

**Linear Models with Heteroskedasticity** fits a regression in which the error variance changes with a set of drivers, using `HARE.jl`. The tabs set the shape of that variance, and **Estimation** sets how the shape and the coefficients are fitted.

## What the Linear Models with Heteroskedasticity Panel Does

| Item | Detail |
|---|---|
| Purpose | Estimate a mean equation by weighting, together with an equation for the error variance |
| Julia stack | `HARE.jl` for estimators and tests, `GLM.jl` for least squares, `HypothesisTests.jl` and `Plots.jl` for the Next Steps |
| Model | y_i = x_i' beta + u_i, with independent errors of variance sigma_i² that depends on z_i |
| Input shape | **Regressors (X)** is n x k and **Variance drivers (Z)** is n x q, both without a column of ones; **Response (y)** has length n |
| Default drivers | `nothing`, which uses X as the drivers |
| Prediction inputs | **New regressors** and **New variance drivers** |
| Key choices | The variance form, and the **Estimation** method |

## How the Variance Tabs of the Heteroskedasticity Panel Differ

| Tab | Variance form | Auxiliary regression in FWLS | Limit in the fit |
|---|---|---|---|
| **Exponential** | sigma_i² = exp(gamma_0 + z_i' gamma) | log(e²) + 1.2704 on z | Positive by construction |
| **Power** | sigma_i² = exp(gamma_0) × product of abs(z_ij)^gamma_j | log(e²) + 1.2704 on log abs(z) | abs(z) clipped at 1e-10 |
| **Quadratic** | sigma_i = gamma_0 + z_i' gamma, so the variance is its square | abs(e) on z, scaled by sqrt(pi/2) | Error if a fitted sigma_i reaches zero |
| **Linear** | sigma_i² = gamma_0 + z_i' gamma | e² on z | Error if a fitted sigma_i² reaches zero |

## How the Estimation Options of the Heteroskedasticity Panel Differ

| **Estimation** option | Function suffix | Procedure | Coefficient standard errors |
|---|---|---|---|
| **Two-step FWLS** | `_fwls` | OLS residuals, one auxiliary regression, one weighted fit | From the weighted fit, with sum(w e²) / (n − k) as the estimated variance |
| **Iterated FWLS** | `_ifwls` | Repeats until coefficients move by less than 1e-8, at most 100 passes | The same as two-step |
| **Maximum likelihood** | `_mle` | L-BFGS on the normal likelihood of both equations | Inverse observed information |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
