# Factsheet

**Canonical Correlation Analysis** finds linked patterns between two sets of variables, with classical, regularised and covariance-based tabs.

## What the Canonical Correlation Analysis Panel Does

| Item | Detail |
|---|---|
| Purpose | Find pairs of linear combinations of X and Y with high correlation or covariance |
| Julia stack | `MultivariateStats.jl` for classical CCA, `LinearAlgebra` for the others, `Distributions.jl` for **Bartlett Test**, `Plots.jl` for figures, `PollisDatasets.jl` for the default data |
| Tabs | **CCA**, **Regularised CCA**, **PLS** |
| Input shape | X with n rows and p columns, Y with n rows and q columns |
| Results | `rho`, `Zx`, `Zy`, `m`, the last holding `Ax`, `Ay`, `px` and `py` |
| Default data | Wine: 161 rows, 7 and 6 columns, and 17 held-out rows |

## What the Inputs of the Canonical Correlation Panel Default To

| Input | Default | Tabs | Role |
|---|---|---|---|
| **X (n × p)** | `X_train` | All | First data matrix |
| **Y (n × q)** | `Y_train` | All | Second data matrix, with the same rows |
| **k** | 2 | All | Number of dimensions, at most min(p, q) |
| **lambda (ridge)** | 0.1 | **Regularised CCA** | Added to the diagonal of both within-set covariances |
| **Scaling** | Standardise | **Regularised CCA**, **PLS** | Standardise or centre only |

## How the Tabs Compute Their Directions

| Tab | Matrix decomposed | Weights |
|---|---|---|
| **CCA** | Whitened cross-covariance, inside `fit(CCA, ...)` | `projection(M, :x)`, `projection(M, :y)` |
| **Regularised CCA** | Sxy whitened by Cholesky factors of Sxx + lambda I and Syy + lambda I | Whitened singular vectors mapped back |
| **PLS** | Sxy itself | Singular vectors, orthonormal |

`rho` reports the correlation of each pair in all three tabs, although **PLS** maximises covariance.

## Which Actions Depend on the Tab

| Action | Follows |
|---|---|
| **Bartlett Test** | Classical CCA in every tab |
| **Held-Out Correlations**, **vs Permuted Y** | `fit_cc` of the current tab |
| **Transform New Data** | Needs `X_new` and `Y_new` to exist |
| **Canonical Coefficients**, **Structure Correlations**, **Redundancy Index**, **Compare Dimensions** | The fit at hand |

Other matrices need their own `X_new` and `Y_new`.

## See Also

- [Overview](overview.md) · [CCA](cca.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
