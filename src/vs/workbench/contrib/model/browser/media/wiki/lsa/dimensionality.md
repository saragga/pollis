# Latent Semantic Analysis: Dimensionality

The number of dimensions k decides how much of the term-document structure LSA keeps, and how the reduced space differs from the original matrix.

## Why the choice matters

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) write that the amount of dimension reduction, the choice of k, is critical to their work. Ideally, k is large enough to fit all the real structure in the data, but small enough not to fit the sampling error or unimportant details as well. They describe the proper way to make the choice as an open issue in the factor analytic literature.

The panel's second bullet gives the same trade-off, between noise reduction and information loss.

## Neither very low nor very high

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) were not interested in reducing the representation to two or three factors, since visualising the space was not their aim. They expected the conceptual space of a large document collection to need more than a handful of independent concepts, so the number of factors would be fairly large.

At the same time, they had reason to avoid extremely high numbers of dimensions, and between the two extremes they were guided by what appeared to work best. In various problems, they write, they approximated the original term-document matrix with 50–100 orthogonal factors.

## An operational criterion

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) used the value of k that gave good retrieval performance: they examined performance for several numbers of factors and selected the one that maximised it. On the MED collection, mean precision more than doubled, from 0.25 to 0.52, as the number of factors rose from 10 to 100, with its maximum at 100.

They add that more factors do not necessarily give better performance. In other small applications they saw clearer maxima, with performance rising up to some point and then falling, which they interpret as the extra parameters modelling sampling noise.

## Earlier work

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) compare their 100-dimensional space with earlier factor analytic approaches to retrieval that used 7, 13 and 21 dimensions. They report a more than 50% improvement in performance beyond that range, and suspect that part of the limited success of the earlier approaches came from an impoverished representation.

They also note that the MED collection was built from the returns of keyword searches for its 30 queries, which may make it unusually well segmented.

## Tools in the panel

| Action | Shows |
| --- | --- |
| **Variance Explained** | cumulative share of the squared singular values up to k |
| **Reconstruction Error** | Frobenius norm of M − M_k at the chosen k |
| **Compare k Values** | Frobenius error for k = 10, 25, 50, 100, 200 |

The default is 50. Every action uses at most as many dimensions as there are singular values, the smaller of the numbers of documents and terms, and **Compare k Values** keeps only the values of k no larger than that number.

## The upper limit

[Deerwester, Dumais, Furnas, Landauer and Harshman (1990)](#ref-DDFLH1990a) explain that, after the smaller singular values are set to zero, the representation can be simplified by deleting the zero rows and columns of S₀ and the matching columns of T₀ and D₀, which gives the reduced matrices T, S and D of the rank-k model.

In the panel, k selects the first k columns of U and V and the first k singular values, so it cannot exceed their number. The code comment of **Compare k Values** keeps the candidate values at most the rank.

## References

<a id="ref-DDFLH1990a"></a>Deerwester, S., Dumais, S. T., Furnas, G. W., Landauer, T. K., & Harshman, R. (1990). Indexing by Latent Semantic Analysis. *Journal of the American Society for Information Science* 41(6), 391-407. [doi:10.1002/(SICI)1097-4571(199009)41:6&lt;391::AID-ASI1&gt;3.0.CO;2-9](https://doi.org/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SVD](svd.md)
