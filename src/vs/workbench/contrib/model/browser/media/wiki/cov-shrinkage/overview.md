# Overview

The sample covariance is unbiased and simple, and it becomes unreliable as the number of variables p grows towards the number of observations n. Regularised estimators accept a little bias in exchange for much less noise, and they can stay invertible where the sample covariance does not.

## Why the Sample Covariance Fails with Many Variables

When p is not small against n, sample eigenvalues spread further apart than the true ones: the largest are too large, and the smallest too small. [Marčenko and Pastur (1967)](#ref-MP1967a) gave the limiting distribution behind this spread, and [Tulino and Verdu (2004)](#ref-TV2004a) survey the wider theory of such random matrices. With p greater than n, the matrix is singular, so it has no inverse. Even a covariance that is invertible can be so badly conditioned that its inverse amplifies noise, which harms portfolio weights, Mahalanobis distances and any other use of the inverse.

## How Regularisation Answers the Problem

| Tab | Idea | Founding work |
|---|---|---|
| **Linear** | Blend the sample covariance with a target of few parameters | [Ledoit and Wolf (2004a)](#ref-LW2004a) |
| **Nonlinear** | Keep sample eigenvectors, and move each eigenvalue by its own amount | [Ledoit and Wolf (2020)](#ref-LW2020a) |
| **Woodbury** | Assume a few strong directions on top of diffuse noise | [Donoho, Gavish and Johnstone (2018)](#ref-DGJ2018a) |
| **Biweight** | Cut the influence of extreme values | [Lax (1985)](#ref-Lax1985a), for the scale estimator |

The first three treat noise from too few observations, and the last treats contamination in the observations.

## How the Linear Tab Developed

The first estimator of this kind, by [Ledoit and Wolf (2004a)](#ref-LW2004a), pulls towards a multiple of the identity and sets the weight in closed form. A constant correlation target for stock returns followed, from [Ledoit and Wolf (2004b)](#ref-LW2004b). [Schäfer and Strimmer (2005)](#ref-SS2005a) set out a range of further targets and a rule for the weight, aimed at genomic data. For Gaussian data, [Chen, Wiesel, Eldar and Hero (2010)](#ref-CWEH2010a) proposed the Rao-Blackwell and oracle-approximating rules, here `:rblw` and `:oas`.

## How the Other Three Tabs Differ

**Nonlinear** uses a closed-form formula and needs no choices. **Woodbury** needs **Rank**, and it comes from the spiked covariance model studied by [Johnstone (2001)](#ref-Joh2001a), in which a few eigenvalues stand out from a common level. **Biweight** needs **Tuning Constant c**, and it computes each entry from the two columns involved, with weights that fall to zero for values far from the median. These tabs start from different concerns, so a low score for one of them can say as much about the data as about the method.

## What a Typical Regularised Covariance Workflow Looks Like

1. Enter **X (n × p)** with rows as observations, and put variables on a common scale when their units differ.
2. Run **Linear** at its defaults, and read the condition numbers that the code reports.
3. Inspect what changed with **Eigenvalue Spectrum**, **Correlation Heatmap** and **Distance from Sample Covariance**.
4. Run **Compare Estimators** to rank the choices by **Held-Out Log-Likelihood**.
5. Move to the tab suggested by that ranking, and repeat the checks.
6. Use the chosen `S` with **Precision and Partial Correlations**, **Mahalanobis Outlier Scores** or **Minimum-Variance Weights**.

The estimate should serve its final use, so check it in that use wherever possible.

## References

<a id="ref-CWEH2010a"></a>Chen, Y., Wiesel, A., Eldar, Y. C. and Hero, A. O. (2010). Shrinkage algorithms for MMSE covariance estimation. *IEEE Transactions on Signal Processing* 58(10), 5016–5029. [doi:10.1109/TSP.2010.2053029](https://doi.org/10.1109/TSP.2010.2053029)

<a id="ref-DGJ2018a"></a>Donoho, D., Gavish, M. and Johnstone, I. (2018). Optimal shrinkage of eigenvalues in the spiked covariance model. *The Annals of Statistics* 46(4), 1742–1778. [doi:10.1214/17-AOS1601](https://doi.org/10.1214/17-AOS1601)

<a id="ref-Joh2001a"></a>Johnstone, I. M. (2001). On the distribution of the largest eigenvalue in principal components analysis. *The Annals of Statistics* 29(2), 295–327. [doi:10.1214/aos/1009210544](https://doi.org/10.1214/aos/1009210544)

<a id="ref-Lax1985a"></a>Lax, D. A. (1985). Robust estimators of scale: Finite-sample performance in long-tailed symmetric distributions. *Journal of the American Statistical Association* 80(391), 736–741. [doi:10.1080/01621459.1985.10478177](https://doi.org/10.1080/01621459.1985.10478177)

<a id="ref-LW2004a"></a>Ledoit, O. and Wolf, M. (2004a). A well-conditioned estimator for large-dimensional covariance matrices. *Journal of Multivariate Analysis* 88(2), 365–411. [doi:10.1016/S0047-259X(03)00096-4](https://doi.org/10.1016/S0047-259X(03)00096-4)

<a id="ref-LW2004b"></a>Ledoit, O. and Wolf, M. (2004b). Honey, I shrunk the sample covariance matrix. *Journal of Portfolio Management* 30(4), 110–119. [doi:10.3905/jpm.2004.110](https://doi.org/10.3905/jpm.2004.110)

<a id="ref-LW2020a"></a>Ledoit, O. and Wolf, M. (2020). Analytical nonlinear shrinkage of large-dimensional covariance matrices. *Annals of Statistics* 48(5), 3043–3065. [doi:10.1214/19-AOS1921](https://doi.org/10.1214/19-AOS1921)

<a id="ref-MP1967a"></a>Marčenko, V. A. and Pastur, L. A. (1967). Distribution of eigenvalues for some sets of random matrices. *Mathematics of the USSR-Sbornik* 1(4), 457–483. [doi:10.1070/SM1967v001n04ABEH001994](https://doi.org/10.1070/SM1967v001n04ABEH001994)

<a id="ref-SS2005a"></a>Schäfer, J. and Strimmer, K. (2005). A shrinkage approach to large-scale covariance matrix estimation and implications for functional genomics. *Statistical Applications in Genetics and Molecular Biology* 4(1). [doi:10.2202/1544-6115.1175](https://doi.org/10.2202/1544-6115.1175)

<a id="ref-TV2004a"></a>Tulino, A. M. and Verdu, S. (2004). Random matrix theory and wireless communications. *Foundations and Trends in Communications and Information Theory* 1(1), 1–182. [doi:10.1561/0100000001](https://doi.org/10.1561/0100000001)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
