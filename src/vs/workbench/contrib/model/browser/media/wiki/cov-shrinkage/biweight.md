# Biweight

The **Biweight** tab replaces means and squared deviations with medians and smoothly declining weights, so that extreme values lose their influence. Its aim is robustness to contaminated data and not, like the other three tabs, a cure for having too few rows.

## What the Biweight Midcovariance Computes

For two columns x and y, with medians M_x and M_y and median absolute deviations MAD_x and MAD_y, set u_i = (x_i - M_x) / (c MAD_x) and v_i = (y_i - M_y) / (c MAD_y). The entry is n times the sum of (x_i - M_x)(1 - u_i^2)^2 (y_i - M_y)(1 - v_i^2)^2, divided by the product of the sum of (1 - u_i^2)(1 - 5 u_i^2) and the sum of (1 - v_i^2)(1 - 5 v_i^2). All sums run only over rows with |u_i| under 1 and |v_i| under 1. Values beyond c MADs get zero weight. The scale version of this idea was among the estimators studied for long-tailed samples by [Lax (1985)](#ref-Lax1985a).

## How the Biweight Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **X (n × p)** | `X_train` | Data matrix, with rows as observations |
| **Tuning Constant c** | 9.0 | Cut-off, in units of the median absolute deviation |

The code runs `cov(BiweightMidcovariance(c = c), X)`, makes the result dense and symmetric as `S`, and reports the condition numbers of `S` and `cov(X)`. **Compare Estimators** adds a biweight fit at the package's default constant, which ignores the value set here, so the current fit appears as a separate row.

## How to Set the Tuning Constant

Smaller values of **Tuning Constant c** reject more values. At 9.0, the tooltip's standard choice, the cut-off lies far into the tails for Gaussian data, so little is lost when the data are clean. Lower it if **Correlation Changes** or a scatter plot shows that a few rows still drive some pairs. Results that move sharply with small changes of c suggest values lying right at the cut-off. A very low value leaves few rows inside it, so entries become noisy, and the estimate may understate true spread.

## Where the Biweight Midcovariance Works Well

Contaminated data and heavy tails with moderate p are its natural setting. Isolated errors in single cells, such as recording mistakes, have little effect, since each entry uses the two columns concerned. When data are clean, it stays close to the sample covariance at the default constant. It also gives an honest contrast with `S_sample`, as a large difference says that a few values are shaping the sample result.

## Where the Biweight Midcovariance Misleads

The matrix is built entry by entry, so it need not be positive definite, and p close to n makes failure more likely. **Conditioning** should come before any inverse. There is no shrinkage, so it does not solve the problem of too few rows. A column with more than half of its values equal has a median absolute deviation of zero, so the formula breaks down. Outliers defined by a combination of columns pass unnoticed, and genuine tail events are treated as errors, which understates the risk where tails matter most.

## What to Compare the Biweight Midcovariance With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether outliers matter here | `S_sample` | Large **Correlation Changes** in a few pairs |
| Whether too few rows are the real problem | **Linear** or **Nonlinear** | A better **Held-Out Log-Likelihood** |
| Whether the constant matters | The same tab at another **Tuning Constant c** | Stable correlations |

**Held-Out Log-Likelihood** uses a Gaussian density and outlying rows lower it for all estimators, so read it alongside these comparisons and not alone.

## References

<a id="ref-Lax1985a"></a>Lax, D. A. (1985). Robust estimators of scale: Finite-sample performance in long-tailed symmetric distributions. *Journal of the American Statistical Association* 80(391), 736–741. [doi:10.1080/01621459.1985.10478177](https://doi.org/10.1080/01621459.1985.10478177)

## See Also

- [Linear Shrinkage](linear-shrinkage.md) · [Nonlinear Shrinkage](nonlinear-shrinkage.md) · [Woodbury Estimator](woodbury.md) · [Decision Guide](decision-guide.md)
