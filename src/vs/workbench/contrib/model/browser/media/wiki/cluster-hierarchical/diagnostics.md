# Diagnostics

The Diagnose and Compare actions of the Hierarchical Clustering panel show how well a tree and its cut describe the distances. None of them proves that the clusters are real, and they use no external labels.

## How to Read the Dendrogram of a Hierarchical Clustering

**Dendrogram** draws the tree with merge height on the vertical axis and a dashed line at the cut for the current **k**, halfway between the k-th and the (k − 1)-th largest merges. A good result shows long vertical stems crossing the line, with merges at low heights inside each cluster. A poor one shows merges spread evenly up the axis, so the line could sit almost anywhere. A staircase in which single leaves join one growing group marks chaining. In that case try a linkage other than **Single**. Horizontal order along the axis carries little meaning, since each merge could be flipped.

## How to Use Merge Heights to Choose a Cut in a Hierarchical Tree

**Merge Heights** plots up to the last 20 merge heights, largest first, with x the number of clusters obtained by cutting just under that merge. A dashed vertical line marks the current **k**. Look for a value of k whose point stands well above the point at k + 1, because the groups at that cut formed at low heights and join only at a much greater one. A smooth curve with no such drop gives no support for any particular cut. Heights are comparable within one tree only, since each linkage has its own scale.

## How to Use Silhouette Analysis on Hierarchical Clusters

**Silhouette Analysis** computes `silhouettes(labels, D)` on the panel's dissimilarity matrix and draws the values in bars by cluster, with a dashed line at the mean. For one observation, s = (b − a) / max(a, b), where a is its mean distance to its own cluster and b its mean distance to the nearest other cluster, following [Rousseeuw (1987)](#ref-Rou1987a). Values near 1 mean a clear placement, values near 0 lie between clusters, and negative values suggest a closer neighbouring cluster. A singleton scores 0 in Clustering.jl. Look for clusters that are mostly negative, not only at the mean. The function fails at **k** = 1, because it needs at least two clusters.

## How to Use Choosing k on a Hierarchical Tree

**Choosing k** reports the mean silhouette for k from 2 to 10, all cut from the same tree. A clear peak is mild support for that value. A flat curve means the score does not separate the candidates. Taken alone, the score tends to reward a few broad groups and can miss finer structure that the subject cares about, so read it alongside **Merge Heights**. No procedure settles the number of clusters for all data, as the comparison by [Milligan and Cooper (1985)](#ref-MC1985a) reports.

## What Cophenetic Correlation Says About a Hierarchical Tree

**Cophenetic Correlation** gives the Pearson correlation between each pair's distance in `D` and the merge height at which the pair first joins, a measure from [Sokal and Rohlf (1962)](#ref-SR1962a). A high value means the tree preserves the pairwise distances well. A low value means the tree distorts them, and any reading of its heights deserves caution. The measure describes the whole tree and says nothing about the chosen **k**. A high value can arise with one remote group, because a few large distances then dominate the correlation.

## How to Compare Linkages in the Hierarchical Clustering Panel

**Linkage Comparison** fits all four linkages at the current **k** and prints each mean silhouette and smallest cluster size. A linkage with a very small smallest cluster has probably split off outliers, whatever its score. The **Ward** fit always uses Euclidean distances, while its silhouette is scored on the panel's `D`, so with a non-Euclidean **Distance** the **Ward** row is scored on a metric it did not fit. Several linkages giving similar partitions is reassuring. Wide disagreement shows that the grouping depends on the method.

## How to Read Agreement with K-Means in the Hierarchical Clustering Panel

**Agreement with K-Means** runs `kmeans` with **k** clusters on `X` and prints the tuple from `randindex(labels, other)`. Its first entry is the adjusted Rand index of [Hubert and Arabie (1985)](#ref-HA1985a), about 0 for chance agreement and 1 for the same partition. A high value shows that two methods with different logic reach a similar grouping. A low value does not show that either is wrong, since **Single** can properly find shapes that `kmeans` cannot. The comparison is always Euclidean, whatever **Distance** holds, and `kmeans` starts from random seeds, so the value can move between runs.

## How to Test the Stability of Hierarchical Clusters Outside the Panel

The panel has no resampling check, although a tree can change considerably when a few observations leave. You can draw a random 80 per cent of the rows, repeat `hclust` and `cutree`, and compute `randindex` against the full labels on the rows in common. Scores that stay high across many draws suggest a stable grouping. Scores that vary widely suggest that the partition depends on particular observations.

## References

<a id="ref-HA1985a"></a>Hubert, L. and Arabie, P. (1985). Comparing partitions. *Journal of Classification* 2(1), 193–218. [doi:10.1007/BF01908075](https://doi.org/10.1007/BF01908075)

<a id="ref-MC1985a"></a>Milligan, G. W. and Cooper, M. C. (1985). An examination of procedures for determining the number of clusters in a data set. *Psychometrika* 50(2), 159–179. [doi:10.1007/BF02294245](https://doi.org/10.1007/BF02294245)

<a id="ref-Rou1987a"></a>Rousseeuw, P. J. (1987). Silhouettes: a graphical aid to the interpretation and validation of cluster analysis. *Journal of Computational and Applied Mathematics* 20, 53–65. [doi:10.1016/0377-0427(87)90125-7](https://doi.org/10.1016/0377-0427(87)90125-7)

<a id="ref-SR1962a"></a>Sokal, R. R. and Rohlf, F. J. (1962). The comparison of dendrograms by objective methods. *Taxon* 11(2), 33–40. [doi:10.2307/1217208](https://doi.org/10.2307/1217208)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Cophenetic Correlation](cophenetic.md) · [Overview](overview.md)
