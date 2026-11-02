# Kernel PCA

Kernel PCA performs principal component analysis on a similarity matrix between observations, so its scores can follow curved structure ([Schölkopf, Smola and Müller (1998)](#ref-SSM1998b)). The **Kernel PCA** tab uses one Gaussian kernel, and the single bandwidth largely decides the result.

## What Kernel PCA Computes

The Gaussian kernel gives K_ij = exp(-gamma ||x_i − x_j||^2) for every pair of observations. Double centring gives K_c = H K H, with H = I − 1 1' / n, and its eigenvectors a_j have eigenvalues lambda_j. A point x has score sum over i of a_ij k_c(x, x_i) / sqrt(lambda_j), where k_c is the centred kernel between x and training point i. On training data this equals sqrt(lambda_j) a_ij. The tab calls `fit(KernelPCA, Xt; kernel=kernel, maxoutdim=k, inverse=true)`, which keeps at most the smaller of p and n components, although K_c can have up to n − 1 nonzero eigenvalues.

## How gamma Changes a Kernel PCA Result

**gamma (RBF bandwidth)** has a default of 1.0, and a larger value makes the kernel narrower. When gamma is very small, K_c approaches a multiple of the inner products of the centred data, so the scores approach those of **PCA** up to scale. When gamma is very large, K approaches the identity matrix, each observation resembles only itself, and the scores carry little structure. On standardised data the expected squared distance between two observations is about 2p, so 1 / p is a common start, and the default of 1.0 is narrow when p is large. The panel has no sweep over gamma, so refit at several values.

## What Kernel PCA Assumes

| Assumption | If it fails | How to tell |
|---|---|---|
| Euclidean distance on the prepared features reflects similarity | Noisy or unscaled features distort the kernel | Results change sharply between **Standardise** and **Centre Only** |
| One bandwidth suits every region of the data | Dense areas blur or sparse areas fragment | No gamma gives good **Neighbour Preservation** |
| New data lie near the training data | Far points have a kernel near 0 and all land near one location | **Project New Data** places distant observations in a tight group |
| n is small enough for a dense n × n eigenproblem | Memory grows as n^2 and time about as n^3 | The fit becomes slow as rows are added |

No probability model lies behind the scores, and the tab reports no test of k or gamma.

## How to Check a Kernel PCA Result with the Next Steps

**Neighbour Preservation** is the most direct check: `model` should be well over `random`, and over the value from the **PCA** tab at the same k, or the kernel has added nothing. **vs PCA or Factor Analysis** shows absolute correlations with **PCA** scores, and values near 1 mean the kernel is acting almost linearly. **Score Scatter** should show a shape, and a few far-out points with the rest packed at the origin can point to a gamma that is too large. Compare at several gamma values, as each single run gives no warning about its own bandwidth.

## How to Read the Scree Plot and Choosing k in Kernel PCA

**Scree Plot** divides each eigenvalue by the sum of the leading eigenvalues, at most the smaller of p and n. When n exceeds p, the denominator leaves out the remaining eigenvalues of K_c, so the shares are larger than shares of the whole kernel variance. **Reconstruction Error** and **Choosing k** rest on approximate pre-images, which `reconstruct` obtains from a kernel ridge regression of X on the training scores. That regression uses the same kernel on the score scale, so the error reflects the inverse map as well as the components, and it need not fall steadily with k.

## Where Kernel PCA Misleads

**Loading Matrix** and **Biplot** show plain correlations between features and scores, since kernel components have no feature weights. A feature with a curved relation to a score can show a correlation near zero, so a small entry does not mean that the feature is unused. The sign of each component is arbitrary. A striking shape may come from gamma and not from the data, so a shape should survive a change of gamma before it is read as structure.

## What to Compare Kernel PCA With

**PCA** is the first baseline, and a kernel result should beat it at the same k. The Manifold Learning panel uses graph-based relatives: Isomap and locally linear embedding can each be written as kernel PCA with a kernel built from the data ([Ham, Lee, Mika and Schölkopf (2004)](#ref-HLMS2004a)). The Neighbour Embedding panel is a further option when the aim is a plot of local neighbours and not scores that a later model will use. Only **PCA** and **Factor Analysis** provide feature weights in the Latent Component Analysis panel.

## References

<a id="ref-HLMS2004a"></a>Ham, J., Lee, D. D., Mika, S. and Schölkopf, B. (2004). A kernel view of the dimensionality reduction of manifolds. *Twenty-first International Conference on Machine Learning (ICML '04)*, 47. [doi:10.1145/1015330.1015417](https://doi.org/10.1145/1015330.1015417)

<a id="ref-SSM1998b"></a>Schölkopf, B., Smola, A. and Müller, K.-R. (1998). Nonlinear component analysis as a kernel eigenvalue problem. *Neural Computation* 10(5), 1299–1319. [doi:10.1162/089976698300017467](https://doi.org/10.1162/089976698300017467)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [PCA](pca.md) · [Factor Analysis](fa.md)
