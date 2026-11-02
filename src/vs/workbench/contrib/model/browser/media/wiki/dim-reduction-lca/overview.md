# Overview

Latent component methods describe many correlated features with a few derived variables. Principal components go back to [Pearson (1901)](#ref-Pea1901a) and [Hotelling (1933)](#ref-Hot1933a), the common factor to [Spearman (1904)](#ref-Spe1904b), and the kernel form of principal components to [Schölkopf, Smola and Müller (1998)](#ref-SSM1998b).

## What PCA, Kernel PCA and Factor Analysis Have in Common

All three methods turn the p features of each observation into k scores, and none of them uses a target variable. The scores can serve for plots, for compression, or as fewer inputs to a later model. The methods differ in what a score is taken to mean. A component is a summary of the variance in the data, and a factor is a claimed cause of the correlations between features. A score of either kind exists as soon as features correlate, so its existence is no evidence that something real lies behind it.

## How the PCA Tab Finds Directions of Largest Variance

Principal component analysis finds the orthogonal directions along which the projected data vary most, which are the eigenvectors of the sample covariance matrix. The same directions give the plane closest to the data in squared distance, the view taken by [Pearson (1901)](#ref-Pea1901a). [Eckart and Young (1936)](#ref-EY1936a) showed that this truncation is the best approximation of its rank. **PCA** has no noise model, so it treats all variance alike. With **Standardise** the directions come from correlations, and with **Centre Only** from covariances.

## How the Kernel PCA Tab Reaches Curved Structure

Kernel PCA replaces inner products between observations with a kernel, so the principal components are computed in a feature space that is never built explicitly ([Schölkopf, Smola and Müller (1998)](#ref-SSM1998b)). The **Kernel PCA** tab uses a Gaussian kernel with **gamma (RBF bandwidth)**, and takes the eigenvectors of the centred n × n kernel matrix. The scores are nonlinear functions of the features. No feature directions exist to read in place of the PCA weights, and the result depends heavily on **gamma (RBF bandwidth)**.

## How the Factor Analysis Tab Separates Shared Variance from Noise

Factor analysis models each observation as x = mu + W z + e, with k standard normal factors z and independent noise e of diagonal covariance Psi. Only the correlations between features need the factors, and each feature keeps a variance of its own. [Jöreskog (1967)](#ref-Jor1967a) set out maximum likelihood estimation for this model, and [Rubin and Thayer (1982)](#ref-RT1982a) gave an EM algorithm for it. The **Factor Analysis** tab calls the conditional maximisation algorithm of [Zhao, Yu and Jiang (2008)](#ref-ZYJ2008a) through `method=:cm`.

## How to Choose Between PCA, Kernel PCA and Factor Analysis

| Situation | Tab | Why |
|---|---|---|
| Compression, plots or fewer inputs, and the first model to try | **PCA** | Only k to set, and the lowest squared reconstruction error of any linear rank k summary |
| **Neighbour Preservation** shows that **PCA** loses curved structure at the k wanted | **Kernel PCA** | Nonlinear scores, at the price of tuning **gamma (RBF bandwidth)** and losing feature weights |
| A theory of a few latent causes, with measurement noise in each feature | **Factor Analysis** | Separates shared from unique variance, and gives loadings on a stated model |

The choice of **Factor Analysis** is a modelling claim, and no output of the panel confirms it. [Velicer and Jackson (1990)](#ref-VJ1990a) argued that components and factors often lead to similar conclusions, so values near 1 in **vs PCA or Factor Analysis** mean the choice changes little for the scores.

## A Common Workflow for Latent Component Analysis

1. Arrange **Feature Matrix** with one row per observation, and keep **Standardise** unless the features share a unit and their variances carry meaning.
2. Fit **PCA** and read **Scree Plot** and **Choosing k**.
3. Set **Output Dimensions**, then look at **Score Scatter** and at the observations that **Reconstruction Error** lists.
4. Run **Neighbour Preservation** at that k in each tab worth considering.
5. Read **Loading Matrix** and **Biplot** before naming any component.
6. Score fresh observations with **Project New Data**, which reuses the training scaling.

## References

<a id="ref-EY1936a"></a>Eckart, C. and Young, G. (1936). The approximation of one matrix by another of lower rank. *Psychometrika* 1(3), 211–218. [doi:10.1007/BF02288367](https://doi.org/10.1007/BF02288367)

<a id="ref-Hot1933a"></a>Hotelling, H. (1933). Analysis of a complex of statistical variables into principal components. *Journal of Educational Psychology* 24(6), 417–441. [doi:10.1037/h0071325](https://doi.org/10.1037/h0071325)

<a id="ref-Jor1967a"></a>Jöreskog, K. G. (1967). Some contributions to maximum likelihood factor analysis. *Psychometrika* 32(4), 443–482. [doi:10.1007/BF02289658](https://doi.org/10.1007/BF02289658)

<a id="ref-Pea1901a"></a>Pearson, K. (1901). LIII. On lines and planes of closest fit to systems of points in space. *The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science* 2(11), 559–572. [doi:10.1080/14786440109462720](https://doi.org/10.1080/14786440109462720)

<a id="ref-RT1982a"></a>Rubin, D. B. and Thayer, D. T. (1982). EM algorithms for ML factor analysis. *Psychometrika* 47(1), 69–76. [doi:10.1007/BF02293851](https://doi.org/10.1007/BF02293851)

<a id="ref-SSM1998b"></a>Schölkopf, B., Smola, A. and Müller, K.-R. (1998). Nonlinear component analysis as a kernel eigenvalue problem. *Neural Computation* 10(5), 1299–1319. [doi:10.1162/089976698300017467](https://doi.org/10.1162/089976698300017467)

<a id="ref-Spe1904b"></a>Spearman, C. (1904). "General intelligence," objectively determined and measured. *The American Journal of Psychology* 15(2), 201. [doi:10.2307/1412107](https://doi.org/10.2307/1412107)

<a id="ref-VJ1990a"></a>Velicer, W. F. and Jackson, D. N. (1990). Component analysis versus common factor analysis: some issues in selecting an appropriate procedure. *Multivariate Behavioral Research* 25(1), 1–28. [doi:10.1207/s15327906mbr2501_1](https://doi.org/10.1207/s15327906mbr2501_1)

<a id="ref-ZYJ2008a"></a>Zhao, J.-H., Yu, P. L. H. and Jiang, Q. (2008). ML estimation for factor analysis: EM or non-EM? *Statistics and Computing* 18(2), 109–123. [doi:10.1007/s11222-007-9042-y](https://doi.org/10.1007/s11222-007-9042-y)

## See Also

- [Factsheet](factsheet.md) · [PCA](pca.md) · [Kernel PCA](kpca.md) · [Factor Analysis](fa.md)
