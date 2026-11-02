# Factor Analysis

Factor analysis explains the correlations between observed features by a few unobserved factors, and gives each feature a noise variance of its own. The idea began with the general factor of [Spearman (1904)](#ref-Spe1904b), and maximum likelihood estimation was set out by [Jöreskog (1967)](#ref-Jor1967a).

## What the Factor Analysis Model Computes

The model is x = mu + W z + e, with z standard normal of dimension k and e normal with diagonal covariance Psi. It implies Cov(x) = W W' + Psi. The tab reports loadings `W`, uniquenesses `psi` and communalities, the sum of squared loadings per feature. Scores are posterior means, E[z | x] = (I + W' Psi^-1 W)^-1 W' Psi^-1 (x − mu), so they shrink towards zero. With equal noise variances in every feature, the maximum likelihood directions are those of principal components ([Tipping and Bishop (1999)](#ref-TB1999a)).

## How the Factor Analysis Tab Fits the Model

The tab calls `fit(FactorAnalysis, Xt; maxoutdim=k, method=:cm)`, the conditional maximisation algorithm of [Zhao, Yu and Jiang (2008)](#ref-ZYJ2008a), and not the EM algorithm of [Rubin and Thayer (1982)](#ref-RT1982a). **Output Dimensions** is an upper limit, as the algorithm keeps only factors whose scaled eigenvalue exceeds 1 and stops with an error if none does. Check `size(W, 2)` after fitting. **Scaling** matters for reading, since under **Standardise** a loading is the correlation that the model implies between a feature and a factor. **gamma (RBF bandwidth)** plays no part in **Factor Analysis**.

## What Factor Analysis Assumes

| Assumption | If it fails | How to tell |
|---|---|---|
| Features depend linearly on the factors | Curved relations create extra factors | **Score Scatter** shows curved bands |
| Noise is independent across features, given the factors | Correlated noise appears as a spurious factor | A factor loads only on features that share a source or a method |
| Factors are uncorrelated | Related causes are forced apart | The panel has no check; fit an oblique rotation elsewhere |
| Data are close to normal | Likelihood-based inference is unreliable | Inspect the feature distributions; the panel reports no such inference |
| Enough features for k | The model has more parameters than covariances | ((p − k)^2 − (p + k)) / 2 is negative |

## How to Spot a Heywood Case in Factor Analysis

A Heywood case occurs when the estimate of a noise variance reaches zero, so one feature is treated as explained entirely by the factors. The name comes from [Heywood (1931)](#ref-Hey1931a). In the **Factor Analysis** tab, the package holds each element of `psi` at a lower bound of 1e-6, so a Heywood case appears as a value at that bound. The usual causes are too many factors, too few observations, or two nearly collinear features. Lower **Output Dimensions** or drop one of the redundant features, and do not read a communality from that fit as a finding.

## How to Check a Factor Analysis Result with the Next Steps

| Next Step | What the step shows for factors | How to read it |
|---|---|---|
| **Scree Plot** | Sum of squared loadings per factor over total variance | The cumulative curve stops short of 1, and the gap is the unique variance; bars need not fall steadily |
| **Reconstruction Error** | Error of the common part, W × scores + mean | Large values come partly from high `psi`, so they are not simply bad fit |
| **vs PCA or Factor Analysis** | Absolute correlations with **PCA** scores | High values on one entry per row mean similar scores; weight spread across a row may be only rotation |
| **Project New Data** | Posterior means for `X_new` | Scores shrink like the training scores |

## How Many Factors to Keep in Factor Analysis

**Choosing k** plots mean reconstruction error, which is not the criterion that factor analysis optimises, and it runs up to the smaller of 10 and p, which can pass the limit the model can identify. Treat it as a rough guide. A likelihood comparison can be computed by hand from `cov(M)` at each k, with an information criterion to penalise size. Parallel analysis ([Horn (1965)](#ref-Hor1965a)) is another outside check, and the panel offers neither. The number of factors should also make sense on substantive grounds.

## Why Factor Loadings Depend on Rotation

W and W Q imply the same covariance for any orthogonal matrix Q, so the data cannot fix the orientation of the factors. The **Factor Analysis** tab applies no rotation and shows the orientation that the algorithm returns, with columns ordered by scaled eigenvalue. **Loading Matrix** and **Biplot** therefore display one choice among many. A named factor may split or merge under another rotation. To seek a simpler pattern, apply varimax ([Kaiser (1958)](#ref-Kai1958a)) to `W` outside the panel and read the rotated loadings, keeping in mind that the fit is unchanged.

## Where Factor Analysis Misleads and What to Compare It With

A good fit does not show that the factors exist, as several different causal stories imply the same covariance. Scores are estimates with error, and they are not uniquely determined even when loadings are known. Compare the tab with **PCA** through **vs PCA or Factor Analysis**, and prefer **PCA** when the goal is compression and no claim about causes is needed. Use **Neighbour Preservation** only as a rough guide for factors, since factor analysis does not aim to keep neighbours, and its scores shrink differently along each factor.

## References

<a id="ref-Hey1931a"></a>Heywood, H. B. (1931). On finite sequences of real numbers. *Proceedings of the Royal Society of London. Series A* 134(824), 486–501. [doi:10.1098/rspa.1931.0209](https://doi.org/10.1098/rspa.1931.0209)

<a id="ref-Hor1965a"></a>Horn, J. L. (1965). A rationale and test for the number of factors in factor analysis. *Psychometrika* 30(2), 179–185. [doi:10.1007/BF02289447](https://doi.org/10.1007/BF02289447)

<a id="ref-Jor1967a"></a>Jöreskog, K. G. (1967). Some contributions to maximum likelihood factor analysis. *Psychometrika* 32(4), 443–482. [doi:10.1007/BF02289658](https://doi.org/10.1007/BF02289658)

<a id="ref-Kai1958a"></a>Kaiser, H. F. (1958). The varimax criterion for analytic rotation in factor analysis. *Psychometrika* 23(3), 187–200. [doi:10.1007/BF02289233](https://doi.org/10.1007/BF02289233)

<a id="ref-RT1982a"></a>Rubin, D. B. and Thayer, D. T. (1982). EM algorithms for ML factor analysis. *Psychometrika* 47(1), 69–76. [doi:10.1007/BF02293851](https://doi.org/10.1007/BF02293851)

<a id="ref-Spe1904b"></a>Spearman, C. (1904). "General intelligence," objectively determined and measured. *The American Journal of Psychology* 15(2), 201. [doi:10.2307/1412107](https://doi.org/10.2307/1412107)

<a id="ref-TB1999a"></a>Tipping, M. E. and Bishop, C. M. (1999). Probabilistic principal component analysis. *Journal of the Royal Statistical Society Series B: Statistical Methodology* 61(3), 611–622. [doi:10.1111/1467-9868.00196](https://doi.org/10.1111/1467-9868.00196)

<a id="ref-ZYJ2008a"></a>Zhao, J.-H., Yu, P. L. H. and Jiang, Q. (2008). ML estimation for factor analysis: EM or non-EM? *Statistics and Computing* 18(2), 109–123. [doi:10.1007/s11222-007-9042-y](https://doi.org/10.1007/s11222-007-9042-y)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [PCA](pca.md) · [Kernel PCA](kpca.md)
