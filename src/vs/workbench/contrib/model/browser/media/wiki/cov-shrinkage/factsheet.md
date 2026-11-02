# Factsheet

The Regularised Covariance Estimation panel replaces the plain sample covariance with an estimate that behaves better when variables are many relative to observations, or when outliers are present. Each of its four tabs does this in a different way.

## What the Regularised Covariance Estimation Panel Does

| Item | Description |
|---|---|
| **Purpose** | Estimate a covariance matrix that is stable, well conditioned or robust |
| **Julia stack** | CovarianceEstimation.jl for the estimators, LinearAlgebra and Statistics for the checks, Plots.jl for the charts, Distributions.jl for p-values |
| **Input** | **X (n × p)**, with rows as observations and columns as variables |
| **Output** | `S`, the dense p x p estimate, and `S_sample`, the plain sample covariance |
| **Key choice** | Which structure or robustness to trust when the data alone are too few |

The code ends by reporting n, p and the condition numbers of `S_sample` and `S`, which is the quickest sign of what the estimator has changed.

## What Each Regularised Covariance Tab Fits

| Tab | Estimator | How it regularises |
|---|---|---|
| **Linear** | `LinearShrinkage(target, method)` | Blends the sample covariance with a structured target |
| **Nonlinear** | `AnalyticalNonlinearShrinkage()` | Shrinks each sample eigenvalue by its own amount |
| **Woodbury** | `WoodburyEstimator(NormLossCov(:L2, 1), rank)` | Keeps a few shrunk eigenvalues as a low-rank part, plus a diagonal |
| **Biweight** | `BiweightMidcovariance(c = c)` | Down-weights values far from the median |

All four return a p x p matrix, so every Next Step works the same way in each tab.

## Which Inputs the Regularised Covariance Tabs Take

| Input | Tab | Default | Effect |
|---|---|---|---|
| **X (n × p)** | All | `X_train` | Standardised example data, or a matrix of the user's |
| **Target** | **Linear** | ConstantCorrelation | Structure that the estimate is pulled towards |
| **Shrinkage Method** | **Linear** | `:lw` | Rule that picks the weight alpha |
| **Rank** | **Woodbury** | 2 | Size of the low-rank part |
| **Tuning Constant c** | **Biweight** | 9.0 | Smaller values reject outliers more aggressively |

`:oas` and `:rblw` are defined for the DiagonalCommonVariance target only.

## Which Next Steps the Regularised Covariance Panel Offers

| Group | Next Steps |
|---|---|
| Visualise | **Correlation Heatmap**, **Eigenvalue Spectrum** |
| Diagnose | **Conditioning**, **Distance from Sample Covariance**, **Held-Out Log-Likelihood** |
| Predict | **Precision and Partial Correlations**, **Mahalanobis Outlier Scores**, **Minimum-Variance Weights** |
| Compare | **Compare Estimators** |
| Interpret | **Eigenvalue Shrinkage Map**, **Correlation Changes** |

**Held-Out Log-Likelihood** and **Compare Estimators** score each estimate on rows left out of its fit, so they are the steps to rely on when choosing a tab.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
