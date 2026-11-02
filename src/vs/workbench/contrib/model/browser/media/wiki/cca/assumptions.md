# Assumptions

The fit itself needs little beyond a covariance matrix, but its reading and its tests rely on more. These assumptions separate a description of a sample from a claim about a population.

## What Linearity Assumes

The method finds only linear combinations, with linear relations between them. A curved link between two blocks may give a low correlation, even though the two blocks are strongly related. Transforming skewed variables, such as with a log, can help a great deal. **Joint Embedding** can reveal a curve in a pair. A kernel form, as in the overview by [Hardoon, Szedmak and Shawe-Taylor (2004)](#ref-HSS2004a), allows nonlinear links, but it brings more freedom to overfit, and it needs regularisation.

## What Sample Size Assumes

Classical CCA needs many more rows than columns. A maximum over many directions finds spurious correlation by chance, and the excess grows with p + q relative to n. With p + q close to n, a correlation near 1 can appear in pure noise. With p or q above n, Sxx or Syy cannot be inverted, and classical CCA is not defined. Rules of thumb ask for tens of rows per variable, and **vs Permuted Y** measures the chance level for a given shape. The default of 161 rows and 13 variables gives a fair starting point.

## What the Tests Assume

**Bartlett Test** rests on multivariate normality and on independent rows. [Bartlett (1941)](#ref-Bar1941a) gave the large-sample approximation that the code uses. Heavy tails distort it, as does a small n relative to p and q. Each test in the sequence is conditional on the ones before it, so the p-values are not independent, and they need caution when a dimension is chosen. **vs Permuted Y** needs fewer assumptions, since it needs only exchangeable rows, and it tests the first dimension. Rows with a time or a group structure break exchangeability, and call for a resampling scheme that respects that structure.

## What Collinearity Does

Within-set correlation does not bias the canonical correlations, but it makes the weights unstable. Two nearly identical variables can take large opposite weights, with small changes in the data. Any story built on the signs of the weights would then be unsafe. **Structure Correlations** stays steadier than the weights in that case, and **Regularised CCA** can stabilise the weights themselves. Removing or merging near-duplicates before fitting also helps, and it makes the result easier to name.

## What Scaling Assumes

Classical CCA is invariant to the scale of each column, so units do not change the correlations, and weights simply rescale. **Regularised CCA** and **PLS** are not invariant. The ridge term and the covariance both treat variance as meaningful, so a column in large units dominates. **Scaling** therefore defaults to standardising. Choose **Centre Only** only when the units are shared and differences in variance are meaningful. Outliers affect all three, as covariances are sensitive to them, so check the data first.

## What Paired Rows and Shared Dimensions Assume

Rows of X and Y must describe the same units in the same order, and an offset silently destroys the relation. **vs Permuted Y** in effect shows what a broken pairing looks like. Maximum shared correlation does not mean that a pair explains much of either block, as a dimension can link a small corner of each. Dependence also says nothing about cause, in either direction. As [Anderson (2003)](#ref-And2003a) sets it out, the method describes a joint covariance and gives no direction of effect.

## References

<a id="ref-And2003a"></a>Anderson, T. W. (2003). *An Introduction to Multivariate Statistical Analysis*, 3rd ed. Wiley.

<a id="ref-Bar1941a"></a>Bartlett, M. S. (1941). The statistical significance of canonical correlations. *Biometrika* 32(1), 29–37. [doi:10.1093/biomet/32.1.29](https://doi.org/10.1093/biomet/32.1.29)

<a id="ref-HSS2004a"></a>Hardoon, D. R., Szedmak, S. and Shawe-Taylor, J. (2004). Canonical correlation analysis: an overview with application to learning methods. *Neural Computation* 16(12), 2639–2664. [doi:10.1162/0899766042321814](https://doi.org/10.1162/0899766042321814)

## See Also

- [Factsheet](factsheet.md) · [CCA](cca.md) · [Diagnostics](diagnostics.md)
