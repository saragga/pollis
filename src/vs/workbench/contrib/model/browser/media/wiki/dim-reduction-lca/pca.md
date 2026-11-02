# PCA

Principal component analysis rotates centred data onto orthogonal directions ordered by variance, and keeps the first k. [Hotelling (1933)](#ref-Hot1933a) derived the components by maximising variance, and [Pearson (1901)](#ref-Pea1901a) by seeking the closest fit. The method describes covariance and carries no noise model.

## What Principal Component Analysis Computes

The sample covariance matrix of the prepared features has eigenvalues lambda_1 ≥ lambda_2 ≥ ... and unit eigenvectors, the columns of W. An observation has scores y = W' (x − mean) and a rebuilt value x_hat = mean + W W' (x − mean). The share of variance of component j is lambda_j / sum(lambda). No other rank k approximation has a lower squared error, a result of [Eckart and Young (1936)](#ref-EY1936a). In the **PCA** tab, `projection(M)` gives W and `principalvars(M) ./ var(M)` gives `explained`.

## Which Inputs the PCA Tab Uses

**Output Dimensions** sets `maxoutdim`, which is an upper limit. The `fit` call also stops once the components reach 99% of the variance, its `pratio` default, so the tab can return fewer than k components with no warning. Check `size(Y, 2)` when that matters, as **Score Scatter** and **Biplot** need two components. **Standardise** makes the components those of the correlation matrix, and **Centre Only** those of the covariance matrix, where a feature in large units can dominate. A **Feature Matrix** already standardised gives the same fit under both. **gamma (RBF bandwidth)** plays no part in **PCA**.

## What Principal Component Analysis Assumes

Normality is not needed to compute the components, and the panel reports no test that would require it.

| Assumption | If it fails | How to tell |
|---|---|---|
| Relations between features are close to linear | Curved structure spreads over many components | **Neighbour Preservation** stays low, and **Kernel PCA** does better at the same k |
| Large variance marks what matters | Components follow noise or a nuisance feature | One feature dominates a column of **Loading Matrix** |
| No few observations dominate the variance | Components turn towards outliers | **Reconstruction Error** and **Score Scatter** show isolated observations |
| Observations are many relative to features | Sample directions are unstable | Refit on half the rows and compare the directions |

## How to Check a PCA Result with the Next Steps

| Next Step | A good sign | A warning sign |
|---|---|---|
| **Scree Plot** | A clear drop, with a cumulative share that suits the purpose | A flat profile, so no small set of components stands out |
| **Reconstruction Error** | A compact histogram | A long right tail; inspect the five observations listed |
| **Neighbour Preservation** | `model` well over `random` | `model` close to `random`, so k directions keep little local structure |
| **vs PCA or Factor Analysis** | Values near 1 on one entry per row | Weight spread across columns, so the two methods split the variance differently |

## How Many Principal Components to Keep

**Choosing k** refits for k = 1 up to the smaller of 10 and p and plots the mean reconstruction error. In **PCA** that error never rises with k, and it goes flat once the 99% limit stops the fit, so the bend is a judgement and no minimum exists to find. The same holds for the **Scree Plot**, whose bend is the rule of [Cattell (1966)](#ref-Cat1966a). The panel offers no test of k. Parallel analysis ([Horn (1965)](#ref-Hor1965a)) can be run by hand: shuffle each column independently, refit, and keep the components whose eigenvalues exceed those from the shuffled data.

## How to Read PCA Loadings and the Biplot

**Loading Matrix** shows W in the **PCA** tab, the unit directions from `projection(M)`. An entry is a weight, and it is not a correlation between feature and score. For weights scaled by the size of each component, use `loadings(M)`. The sign of a whole column is arbitrary, and two components with close eigenvalues can mix freely, so naming them separately is unsafe. **Biplot** rescales all feature arrows to the range of the scores and numbers them by feature index, so only their relative lengths and angles carry information.

## Where Principal Component Analysis Misleads

A component with large variance may have no relation to a later target. Trending series produce smooth leading components even when the series are unrelated. Separate groups in the data can take up the first component, which then records membership and not variation within groups. Fitting on all observations before splitting them leaks the test rows into the directions. Components are also uncorrelated by construction, so that property says nothing about independent causes.

## What to Compare Principal Component Analysis With

**Factor Analysis** suits a claim of latent causes with noise in each feature. **Kernel PCA** suits curved structure, and needs a bandwidth. The Neighbour Embedding and Manifold Learning panels address local structure that linear directions miss, and give up the direct feature weights. Variants that this panel does not include, such as sparse and robust components, are reviewed by [Jolliffe and Cadima (2016)](#ref-JC2016a). **PCA** should normally stay as the baseline, since a nonlinear method that cannot beat it has not earned its extra settings.

## References

<a id="ref-Cat1966a"></a>Cattell, R. B. (1966). The scree test for the number of factors. *Multivariate Behavioral Research* 1(2), 245–276. [doi:10.1207/s15327906mbr0102_10](https://doi.org/10.1207/s15327906mbr0102_10)

<a id="ref-EY1936a"></a>Eckart, C. and Young, G. (1936). The approximation of one matrix by another of lower rank. *Psychometrika* 1(3), 211–218. [doi:10.1007/BF02288367](https://doi.org/10.1007/BF02288367)

<a id="ref-Hor1965a"></a>Horn, J. L. (1965). A rationale and test for the number of factors in factor analysis. *Psychometrika* 30(2), 179–185. [doi:10.1007/BF02289447](https://doi.org/10.1007/BF02289447)

<a id="ref-Hot1933a"></a>Hotelling, H. (1933). Analysis of a complex of statistical variables into principal components. *Journal of Educational Psychology* 24(6), 417–441. [doi:10.1037/h0071325](https://doi.org/10.1037/h0071325)

<a id="ref-JC2016a"></a>Jolliffe, I. T. and Cadima, J. (2016). Principal component analysis: a review and recent developments. *Philosophical Transactions of the Royal Society A: Mathematical, Physical and Engineering Sciences* 374(2065), 20150202. [doi:10.1098/rsta.2015.0202](https://doi.org/10.1098/rsta.2015.0202)

<a id="ref-Pea1901a"></a>Pearson, K. (1901). LIII. On lines and planes of closest fit to systems of points in space. *The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science* 2(11), 559–572. [doi:10.1080/14786440109462720](https://doi.org/10.1080/14786440109462720)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Kernel PCA](kpca.md) · [Factor Analysis](fa.md)
