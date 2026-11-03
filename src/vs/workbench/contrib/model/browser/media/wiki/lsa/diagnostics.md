# Latent Semantic Analysis: Diagnostics

The **Diagnose** group of the **Latent Semantic Analysis** panel measures how much of the TF-IDF matrix the first k dimensions keep: **Variance Explained**, from the singular values, and **Reconstruction Error**, from the residual of the rank-k approximation.

## Variance Explained

**Variance Explained** computes the singular values S of the TF-IDF matrix and plots, for k from 1 to **Dimensions (k)**, the cumulative share

cumsum(S²) / sum(S²),

which the code comment calls a scree-style plot. The singular values are ordered by size, so each added dimension adds no more to the share than the one before it.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) relate the SVD to the eigendecomposition: the left and right singular vectors are the eigenvectors of XXᵀ and XᵀX, and the squared singular values are their eigenvalues.

## Reconstruction Error

**Reconstruction Error** forms the rank-k approximation

M_k = U_k Diagonal(S_k) V_kᵀ

and prints the Frobenius norm of M − M_k, the square root of the sum of the squared residuals over all cells. The description of the action calls it the Frobenius norm of the rank-k approximation residual.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) show that keeping the k largest singular values and setting the rest to zero gives the matrix of rank k that is closest to the original in the least-squares sense.

## Reading the two together

The two actions read the same singular values from two sides: **Variance Explained** gives the share kept by the first k dimensions, and **Reconstruction Error** the size of what is left out. **Compare k Values** plots the second for several values of k.

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) add that the reduced space should not reconstruct the original term space perfectly, because the original term space is unreliable; they want a structure that expresses what is reliable and important in the use of terms.

## Beyond reconstruction

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) chose the number of dimensions by retrieval performance, not by reconstruction: they examined performance for several numbers of factors and selected the one that maximised it. On the MED collection, mean precision rose from 0.25 to 0.52 as the number of factors went from 10 to 100.

In other small applications, they report, performance increased up to some point and then decreased when too many factors were used, which they interpret as the extra parameters modelling sampling noise. **Query Documents** gives the ranking of documents against which such a check can be made.

## Signs of the vectors

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) note that the SVD is unique only up to certain row, column and sign permutations. The sign of a pair of singular vectors can be flipped without changing the product, so a dimension's loadings can come out with either sign.

**Top Terms per Topic** ranks terms by the absolute value of their loadings, which does not depend on the sign.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md) · [Dimensionality](dimensionality.md)
