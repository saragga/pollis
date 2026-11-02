# Complete Linkage

Complete linkage defines the distance between two groups by their most distant pair of members. The **Complete** tab of the Hierarchical Clustering panel runs it through `hclust(D, linkage=:complete)`.

## What Complete Linkage Computes

For groups A and B, complete linkage takes d(A, B) = max d(a, b) over every member a of A and every member b of B. The merge height is that largest distance, so every pair inside the new group lies within the height. A cut at height h thus guarantees clusters of diameter at most h, measured in the chosen **Distance**. After a merge, the update is d(C, A∪B) = max(d(C, A), d(C, B)), which is one case of the recurrence in [Lance and Williams (1967)](#ref-LW1967a). [Defays (1977)](#ref-Def1977a) gave an efficient algorithm for this method.

## Which Inputs the Complete Tab Uses

**Complete** takes **Feature Matrix**, **k** and **Distance**. The code forms `pairwise(metric, X, dims=1)` with **Euclidean**, **Manhattan**, **Cosine** or **Chebyshev**, so the idea of diameter follows the metric chosen. **k** only moves the cut in the finished tree, and no value of it changes which merges took place. Other dissimilarities are not offered as inputs, but `hclust` accepts any symmetric matrix if you edit `D` in the generated code.

## Where Complete Linkage Works Well

Complete linkage suits a problem in which every pair in a cluster must be similar, which is a stronger demand than each member being close to some other member. Clear, compact groups are recovered well, and thin bridges between groups do not join them early, as they can under **Single**. Because merge decisions rest only on the order of the dissimilarities, [Johnson (1967)](#ref-Joh1967a) could show that the tree structure stays the same under any monotonic transformation of them. Heights change under such a transformation, while the merge order does not, apart from ties.

## Where Complete Linkage Misleads

The rule depends on a single extreme pair, so one outlier can postpone an otherwise natural merge or force a poor one. Groups that are large or elongated tend to be broken up, because a long group has a large diameter even when its members are densely connected. Clusters then appear equally wide whether or not the data is. Ties among dissimilarities can change the tree according to the order in which they are resolved, which matters with coarse or discrete features. The criterion also gives no account of how many members support a merge.

## What to Compare Complete Linkage With

**Average** relaxes the single worst pair into a mean over all pairs, so a large disagreement between the two tabs points to the influence of extreme pairs. **Single** reveals whether the groups that **Complete** cuts apart are in fact connected. **Linkage Comparison** gives both at the same **k**, and **Silhouette Analysis** shows which clusters are poorly placed. A very small cluster in **Linkage Comparison** often marks an outlier; dropping it and rerunning shows how much that one point shaped the tree.

## References

<a id="ref-Def1977a"></a>Defays, D. (1977). An efficient algorithm for a complete link method. *The Computer Journal* 20(4), 364–366. [doi:10.1093/comjnl/20.4.364](https://doi.org/10.1093/comjnl/20.4.364)

<a id="ref-Joh1967a"></a>Johnson, S. C. (1967). Hierarchical clustering schemes. *Psychometrika* 32(3), 241–254. [doi:10.1007/BF02289588](https://doi.org/10.1007/BF02289588)

<a id="ref-LW1967a"></a>Lance, G. N. and Williams, W. T. (1967). A general theory of classificatory sorting strategies: 1. Hierarchical systems. *The Computer Journal* 9(4), 373–380. [doi:10.1093/comjnl/9.4.373](https://doi.org/10.1093/comjnl/9.4.373)

## See Also

- [Overview](overview.md) · [Ward Linkage](ward.md) · [Average Linkage](average.md) · [Single Linkage](single.md) · [Diagnostics](diagnostics.md)
