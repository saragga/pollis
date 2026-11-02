# K-Medoids

**K-Medoids** represents each cluster by one of its own observations, called the medoid. Since it needs only the distances between observations, it can run without coordinates, and a single extreme value has less pull on the result.

## What K-Medoids Computes

The medoid of a cluster is the member with the smallest total dissimilarity to the other members. The method seeks medoids that minimise C = sum over clusters j of sum over points i in j of d(x_i, m_j), where m_j is the medoid and d is the dissimilarity. Clustering.jl fits this with a K-means style iteration, of the kind described by [Park and Jun (2009)](#ref-PJ2009a), and not with the swap search known as PAM. Each point joins its closest medoid, then each cluster picks a new medoid among its members, until the assignments settle. The search is faster than PAM but can stop at a poorer solution.

## How the K-Medoids Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **k** | 3 | Number of clusters |
| **max_iter** | 300 | Limit on assignment and update passes |

The code builds `D = pairwise(Euclidean(), X, dims = 1)`, an n by n matrix, then calls `kmedoids(D, k; maxiter = max_iter)`. `assignments(result)` gives `labels`, and `result.medoids` gives the row numbers of the medoids. Any other dissimilarity can replace `D`, such as Manhattan distance, a Gower measure for mixed data, or a matrix that came without features.

## Where K-Medoids Works Well

Every centre is a real observation, so a cluster can be described by pointing at a real case, which often helps when a mean of categories or of images would have no meaning. Distances enter without squaring, so outliers have less influence than in **K-Means**. Custom dissimilarities open the method to strings, sequences or other objects, provided the matrix can be computed.

## Where K-Medoids Misleads

Robustness is only partial. An extreme point still has to join some cluster, and it can still alter the choice of medoid, particularly in a small group. Preference for compact groups stays the same as with **K-Means**, so curved or elongated shapes are handled no better. The n by n matrix takes memory in proportion to n squared, which limits the sample size. With the Euclidean `D` of this tab, the steps that need coordinates, such as **Cluster Scatter**, use `X`, and those would need a change if `D` were replaced.

## What to Compare K-Medoids With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether outliers matter at all | **K-Means** | High **Agreement with K-Means**, so the simpler method is enough |
| Whether a noise group is needed | **DBSCAN** | Points marked as noise that sit apart from all medoids |
| Whether a tree of groups is wanted | Hierarchical Clustering panel | A dendrogram built from the same `D` |

Use one distance throughout, so that any change comes from the method.

## References

<a id="ref-PJ2009a"></a>Park, H. and Jun, C. (2009). A simple and fast algorithm for K-medoids clustering. *Expert Systems with Applications* 36(2), 3336–3341. [doi:10.1016/j.eswa.2008.01.039](https://doi.org/10.1016/j.eswa.2008.01.039)

## See Also

- [K-Means](kmeans.md) · [DBSCAN](dbscan.md) · [Decision Guide](decision-guide.md)
