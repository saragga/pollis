# Factsheet

**AD Log-Likelihood** fits a model by writing its negative log-likelihood as ordinary Julia code and letting automatic differentiation supply the gradient for L-BFGS.

## What the AD Log-Likelihood Panel Does

| Item | Detail |
|---|---|
| Purpose | Maximum likelihood estimation with an exact gradient, and no derivative written by hand |
| Julia stack | `Enzyme.jl` or `ForwardDiff.jl` for gradients, `Optim.jl` for L-BFGS, `Distributions.jl` for densities, `DistributionsAD.jl` for differentiable rules, `GLM.jl` for a logistic reference |
| Tabs | **Distribution**, **Linear Regression**, **Logistic Regression** |
| Parameters | Unconstrained: positive parameters are held on the log scale |
| Output | Fitted distribution or coefficients, plus `res`, `p_hat` and `pnames` for the Next Steps |

## What the Inputs of the AD Log-Likelihood Panel Default To

| Input | Default | Tabs | Role |
|---|---|---|---|
| **AD Backend** | Enzyme | All | Reverse or forward mode |
| **Distribution** | Normal | **Distribution** | Family to fit |
| **Data (y)** | `simulated` | **Distribution** | 500 draws from a known law, or a vector |
| **Initial p[1]** | 0.0 | **Distribution** | First unconstrained start |
| **Initial p[2]** | 0.0 | **Distribution** | Second start, hidden for Exponential |
| **Design Matrix (X)** | `simulated` | Regressions | 200 rows with an intercept and two covariates, or a matrix |
| **Response (y)** | `y` | Regressions | Used only when X is not simulated |

## What the Fitted Parameters Mean by Family

| Family | p[1] | p[2] | Simulated law |
|---|---|---|---|
| Normal | mu | log sigma | Normal(2, 1.5) |
| LogNormal | mu | log sigma | LogNormal(0.5, 0.4) |
| Gamma | log alpha | log theta | Gamma(2, 1.5) |
| Beta | log alpha | log beta | Beta(2, 5) |
| Exponential | log theta | None | Exponential(2) |

Linear regression holds beta and log sigma, with simulated coefficients 1, 2 and -1 and noise of 0.5. Logistic regression holds beta alone, with simulated coefficients -0.5, 1.5 and -1. Every start in the regressions is zero.

## See Also

- [Overview](overview.md) · [Automatic Differentiation](autodiff.md) · [Distribution Estimation](distribution-estimation.md) · [Unconstrained Optimisation](unconstrained.md)
