# Woodbury Estimator

The **Woodbury** tab fits a covariance made of a few strong directions on top of a diffuse noise level. Its name comes from the Woodbury matrix identity, which makes such a low-rank plus diagonal matrix cheap to invert.

## What the Woodbury Estimator Computes

The model behind it is the spiked covariance of [Johnstone (2001)](#ref-Joh2001a), where a few eigenvalues stand out from a common level. The estimator keeps the top **Rank** sample eigenvectors, adjusts their eigenvalues, and represents the rest through the diagonal part. [Donoho, Gavish and Johnstone (2018)](#ref-DGJ2018a) show that the best adjustment depends on the loss function. With noise at level 1 and ell a true spike, c^2 = (1 - gamma/(ell - 1)^2) / (1 + gamma/(ell - 1)) measures how well a sample eigenvector aligns with its true direction, where gamma = p/n. For Frobenius loss, the adjusted spike is ell c^2 + (1 - c^2).

## How the Woodbury Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **X (n × p)** | `X_train` | Data matrix, with rows as observations |
| **Rank** | 2 | Number of spikes kept in the low-rank part |

The code runs `cov(WoodburyEstimator(NormLossCov(:L2, 1), rank), X)`. `NormLossCov(:L2, 1)` selects eigenvalue shrinkage for the Frobenius loss on the error, and other loss objects can be put in its place by editing the line. The panel converts the result into a dense matrix for its checks, so the saving in memory and inversion time from the structured form is not used here.

## How to Set the Rank of the Woodbury Estimator

**Rank** should reflect the number of real factors, and the tooltip advises keeping it well under p. **Eigenvalue Spectrum** is a good guide, as spikes appear as a few values standing clear of a smooth tail. Compare neighbouring values by **Held-Out Log-Likelihood**. A rank that is too low merges real structure into the noise level, and one that is too high keeps directions that are mostly noise, although shrinkage softens the damage. Under the spiked model, a true spike close to the noise level may not be recoverable, as the sample eigenvector then points in a nearly random direction.

## Where the Woodbury Estimator Works Well

Data driven by a few common factors, as with asset returns or gene expression modules, suit it well, particularly when p is far greater than n. The result has few effective parameters, so it remains stable where richer estimates fall apart. It is always invertible if the diagonal part is positive. The structured form also makes it practical for very large p when used directly, outside the dense checks of this panel.

## Where the Woodbury Estimator Misleads

Data without clear spikes give an arbitrary rank and a poor fit, since a smooth decline in eigenvalues is outside the model. Correlations outside the leading directions are flattened, so local links between small groups of variables disappear, which **Correlation Changes** can reveal. The shrinkage formula assumes the spiked model, so a noise level that varies widely across variables leaves spikes misjudged. Outliers can create a false spike, since a single extreme row can dominate a direction. The theory uses large p and n too.

## What to Compare the Woodbury Estimator With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether a factor structure holds | **Nonlinear** | A similar **Held-Out Log-Likelihood** |
| Whether **Rank** is right | The same tab at neighbouring values | A clear peak in score |
| Whether a spike is real | **Biweight** | Whether the top direction survives robust estimation |

**Compare Estimators**, run from this tab, puts the current fit beside the other main options on the same rows.

## References

<a id="ref-DGJ2018a"></a>Donoho, D., Gavish, M. and Johnstone, I. (2018). Optimal shrinkage of eigenvalues in the spiked covariance model. *The Annals of Statistics* 46(4), 1742–1778. [doi:10.1214/17-AOS1601](https://doi.org/10.1214/17-AOS1601)

<a id="ref-Joh2001a"></a>Johnstone, I. M. (2001). On the distribution of the largest eigenvalue in principal components analysis. *The Annals of Statistics* 29(2), 295–327. [doi:10.1214/aos/1009210544](https://doi.org/10.1214/aos/1009210544)

## See Also

- [Linear Shrinkage](linear-shrinkage.md) · [Nonlinear Shrinkage](nonlinear-shrinkage.md) · [Biweight](biweight.md) · [Decision Guide](decision-guide.md)
