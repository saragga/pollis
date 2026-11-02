# Ward Linkage

Ward linkage merges the two groups whose union adds least to the total within-cluster sum of squares. The **Ward** tab of the Hierarchical Clustering panel runs it through `hclust(D, linkage=:ward)` on Euclidean distances.

## What Ward Linkage Computes

At each step Ward linkage considers every pair of groups and picks the pair with the smallest rise in the error sum of squares, the summed squared distance of each observation to its group's centroid. For groups A and B the rise is nA × nB / (nA + nB) × ||cA − cB||^2, where nA and nB are the sizes and cA and cB the centroids. [Ward (1963)](#ref-War1963a) posed the general problem of losing as little as possible in an objective function at each merge, and the error sum of squares became the standard version. Each step is optimal only locally. The final partition need not have the smallest sum of squares among all partitions with that number of clusters.

## How Ward Merge Heights Are Scaled in Clustering.jl

Clustering.jl squares the entries of `D`, updates them with the recurrence of [Lance and Williams (1967)](#ref-LW1967a), and takes the square root of each height. The update for a group C after merging A and B is d²(C, A∪B) = ((nA + nC) d²(C, A) + (nB + nC) d²(C, B) − nC d²(A, B)) / (nA + nB + nC). Each height equals sqrt(2 × rise in the sum of squares), so two singletons merge at their Euclidean distance. [Murtagh and Legendre (2014)](#ref-ML2014a) call this form Ward2 and separate it from implementations that apply the update to unsquared distances, which do not carry out Ward's criterion. Other software may therefore print different heights for the same criterion.

## Which Inputs the Ward Tab Uses

**Ward** takes **Feature Matrix** and **k** only. **Distance** does not appear on the tab, since the code always forms `pairwise(Euclidean(), X, dims=1)`. **k** sets the number of clusters that `cutree` returns and has no effect on the tree. Scaling matters directly here: the sum of squares adds up over columns, so one column with a large variance can decide most merges. Standardise a matrix of your own unless the original units are meant to count.

## Where Ward Linkage Works Well

Ward linkage suits data expected to form compact, roughly spherical groups of comparable size in Euclidean space. The criterion shares its objective with `kmeans`, which makes **Ward** a natural partner for **Agreement with K-Means**, and its dendrograms tend to show clear separation near the top. No random start is needed, unlike `kmeans`, so the tree is the same each time. The price is the n × n matrix in memory and no option to revisit an early merge.

## Where Ward Linkage Misleads

Because Ward linkage favours compact groups of similar size, it can split one long or large natural cluster and merge small neighbouring ones. Its tall upper branches look decisive even when the data has no groups, since merging large sets costs a lot under the criterion, so a clear **Dendrogram** alone is weak evidence. Outliers join late, or stay in small clusters that distort a centroid. **Assign New Data** on this tab uses the mean Euclidean distance to the members of each cluster, which is the rule of **Average** and not Ward's criterion.

## What to Compare Ward Linkage With

Run **Linkage Comparison** to set **Ward** against the other three linkages at the same **k**. **Single** helps when a cluster may be elongated, because it shows whether **Ward** has cut a connected shape into parts. **Agreement with K-Means** shows whether a direct minimisation of the same objective reaches a similar partition. **Cophenetic Correlation** on **Ward** is often lower than on **Average**, since Ward heights grow with group size and are not distances between observations.

## References

<a id="ref-LW1967a"></a>Lance, G. N. and Williams, W. T. (1967). A general theory of classificatory sorting strategies: 1. Hierarchical systems. *The Computer Journal* 9(4), 373–380. [doi:10.1093/comjnl/9.4.373](https://doi.org/10.1093/comjnl/9.4.373)

<a id="ref-ML2014a"></a>Murtagh, F. and Legendre, P. (2014). Ward's hierarchical agglomerative clustering method: which algorithms implement Ward's criterion? *Journal of Classification* 31(3), 274–295. [doi:10.1007/s00357-014-9161-z](https://doi.org/10.1007/s00357-014-9161-z)

<a id="ref-War1963a"></a>Ward, J. H. (1963). Hierarchical grouping to optimize an objective function. *Journal of the American Statistical Association* 58(301), 236–244. [doi:10.1080/01621459.1963.10500845](https://doi.org/10.1080/01621459.1963.10500845)

## See Also

- [Overview](overview.md) · [Complete Linkage](complete.md) · [Average Linkage](average.md) · [Single Linkage](single.md) · [Assumptions](assumptions.md)
