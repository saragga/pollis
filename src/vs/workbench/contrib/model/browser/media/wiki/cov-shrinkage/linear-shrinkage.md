# Linear Shrinkage

**Linear** shrinkage replaces the sample covariance with a weighted average of it and a simple target. The sample covariance has low bias and high noise, the target has high bias and low noise, and the average trades one against the other.

## What Linear Shrinkage Computes

The estimate is (1 - alpha) S + alpha T, where S is the sample covariance, T is the target and alpha lies between 0 and 1. [Ledoit and Wolf (2004a)](#ref-LW2004a) choose alpha to minimise expected Frobenius error, which leads to a closed-form weight that compares the noise in S with the distance between S and T. Noisy data or a close target raise alpha, and alpha falls towards zero as n grows. The result is positive definite when the target is positive definite and alpha is greater than zero, so it can be inverted even with p greater than n. All eigenvalues of S move together towards a common level under a scalar target.

## How the Linear Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **X (n × p)** | `X_train` | Data matrix, with rows as observations |
| **Target** | ConstantCorrelation | The structure T |
| **Shrinkage Method** | `:lw` | Rule that sets alpha |

The code runs `cov(LinearShrinkage(target, method), X)`, makes the result dense and symmetric as `S`, and reports the condition numbers of `S` and `cov(X)`. The weight alpha is estimated inside that call, so nothing needs to be set by hand.

## How the Shrinkage Methods Set the Weight

| Rule | Source | Note |
|---|---|---|
| `:lw` | [Ledoit and Wolf (2004a)](#ref-LW2004a), with [Ledoit and Wolf (2004b)](#ref-LW2004b) for constant correlation | The default, with no assumption of Gaussian data |
| `:ss` | [Schäfer and Strimmer (2005)](#ref-SS2005a) | A rule used across a range of targets |
| `:rblw` | [Chen, Wiesel, Eldar and Hero (2010)](#ref-CWEH2010a) | Improves `:lw` for Gaussian data |
| `:oas` | The same work | Aims at lower error for Gaussian data and small n |

The tooltip for **Shrinkage Method** notes that `:rblw` and `:oas` take the DiagonalCommonVariance target only.

## Where Linear Shrinkage Works Well

Shrinkage suits problems with p comparable to n, or greater, where a broad structure holds in the data. It is fast, with no tuning, and its closed-form weight needs no cross-validation. Portfolio and risk models often use it with a constant correlation target, since asset correlations tend to share a common level. It works as a reliable baseline for other estimators, and it often comes close to more complex methods at moderate p/n.

## Where Linear Shrinkage Misleads

One weight applies to every entry, so a large alpha that cures noise in small eigenvalues will also distort large ones that were accurate. **Eigenvalue Shrinkage Map** shows this as a straight line. A poor target leaves its mark, for example by pulling together groups with very different correlations. The Frobenius criterion concerns the matrix itself, not its inverse, so an alpha good for `S` may not be best for **Minimum-Variance Weights** or other uses of the inverse. Scale also matters, as variables of large variance dominate that criterion.

## What to Compare Linear Shrinkage With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether a single weight is limiting | **Nonlinear** | A clear rise in **Held-Out Log-Likelihood** |
| Whether the target suits the data | Another **Target** | **Held-Out Log-Likelihood**, and **Correlation Changes** |
| Whether regularisation helps | `S_sample` | **Compare Estimators** |

Run these on the same **X (n × p)**, so that any change in the score comes from the estimator alone.

## References

<a id="ref-CWEH2010a"></a>Chen, Y., Wiesel, A., Eldar, Y. C. and Hero, A. O. (2010). Shrinkage algorithms for MMSE covariance estimation. *IEEE Transactions on Signal Processing* 58(10), 5016–5029. [doi:10.1109/TSP.2010.2053029](https://doi.org/10.1109/TSP.2010.2053029)

<a id="ref-LW2004a"></a>Ledoit, O. and Wolf, M. (2004a). A well-conditioned estimator for large-dimensional covariance matrices. *Journal of Multivariate Analysis* 88(2), 365–411. [doi:10.1016/S0047-259X(03)00096-4](https://doi.org/10.1016/S0047-259X(03)00096-4)

<a id="ref-LW2004b"></a>Ledoit, O. and Wolf, M. (2004b). Honey, I shrunk the sample covariance matrix. *Journal of Portfolio Management* 30(4), 110–119. [doi:10.3905/jpm.2004.110](https://doi.org/10.3905/jpm.2004.110)

<a id="ref-SS2005a"></a>Schäfer, J. and Strimmer, K. (2005). A shrinkage approach to large-scale covariance matrix estimation and implications for functional genomics. *Statistical Applications in Genetics and Molecular Biology* 4(1). [doi:10.2202/1544-6115.1175](https://doi.org/10.2202/1544-6115.1175)

## See Also

- [Nonlinear Shrinkage](nonlinear-shrinkage.md) · [Woodbury Estimator](woodbury.md) · [Biweight](biweight.md) · [Decision Guide](decision-guide.md)
