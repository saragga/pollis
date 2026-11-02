# Average Linkage

Average linkage defines the distance between two groups as the mean distance over all pairs drawn from them. The **Average** tab of the Hierarchical Clustering panel runs it through `hclust(D, linkage=:average)`.

## What Average Linkage Computes

For groups A and B, average linkage takes d(A, B) = (1 / (nA × nB)) × the sum of d(a, b) over all a in A and b in B. The method is also known as UPGMA, the unweighted pair group method with arithmetic mean, since each observation counts equally whatever the merge history of its group. After a merge, the update is d(C, A∪B) = (nA × d(C, A) + nB × d(C, B)) / (nA + nB), a case of the recurrence in [Lance and Williams (1967)](#ref-LW1967a). Heights stay on the scale of the original distances and never decrease along the tree.

## Which Inputs the Average Tab Uses

**Average** takes **Feature Matrix**, **k** and **Distance**, where **Distance** is **Euclidean**, **Manhattan**, **Cosine** or **Chebyshev**. A mean of distances is sensitive to their scale, so a monotonic change of the dissimilarities can change the tree. The same does not hold for **Single** or **Complete**. **k** plays no part in the tree, and several cuts can be read from one fit.

## Where Average Linkage Works Well

Average linkage takes a position between the nearest pair and the most distant pair, so a single extreme pair has less weight than under **Complete**, and a thin bridge has less pull than under **Single**. The merge height is a mean distance, so a dendrogram reads directly in units of the metric. Average linkage is a sensible first tab when no shape is expected and a non-Euclidean **Distance** is needed. It also tends to give a high cophenetic correlation, as [Farris (1969)](#ref-Far1969a) argued for UPGMA, because its heights summarise between-group distances directly.

## What the Evidence for Average Linkage Covers

The evidence for average linkage on cophenetic grounds is real but limited in scope. [Saraçli, Doğan and Doğan (2013)](#ref-SDD2013a) simulated multivariate normal data, with and without 5 per cent outliers, and recommended **Average** for small samples and the centroid method for larger ones. Their design covers normal data and the cophenetic criterion only. The centroid method is not in the panel. A high cophenetic correlation shows that a tree preserves distances. It does not show that the flat clusters from a cut are the right ones.

## Where Average Linkage Misleads

Averaging hides shape. Two groups joined by a long thin bridge, or a cluster with an unusual form, may be split or merged without any sign in the mean. Groups with very different spreads can be misjudged, since a wide group has a large mean distance even to a tight group lying at its edge. The rule favours neither compact clusters nor connected ones in a strict sense, so it gives no guarantee of cluster diameter or connectedness. Heights in one tree are not comparable with those of another metric.

## What to Compare Average Linkage With

**Linkage Comparison** places **Average** beside the other linkages at the same **k**. Compare **Cophenetic Correlation** on the **Average** and **Ward** tabs when the question is how far a tree preserves distances, and compare **Silhouette Analysis** when the question is how well a particular cut separates groups. A large gap between **Average** and **Complete** labels suggests influential extreme pairs. **Agreement with K-Means** is a less direct contrast, because it is Euclidean whichever **Distance** the tab holds.

## References

<a id="ref-Far1969a"></a>Farris, J. S. (1969). On the cophenetic correlation coefficient. *Systematic Zoology* 18(3), 279. [doi:10.2307/2412324](https://doi.org/10.2307/2412324)

<a id="ref-LW1967a"></a>Lance, G. N. and Williams, W. T. (1967). A general theory of classificatory sorting strategies: 1. Hierarchical systems. *The Computer Journal* 9(4), 373–380. [doi:10.1093/comjnl/9.4.373](https://doi.org/10.1093/comjnl/9.4.373)

<a id="ref-SDD2013a"></a>Saraçli, S., Doğan, N. and Doğan, İ. (2013). Comparison of hierarchical cluster analysis methods by cophenetic correlation. *Journal of Inequalities and Applications* 2013(1), 203. [doi:10.1186/1029-242X-2013-203](https://doi.org/10.1186/1029-242X-2013-203)

## See Also

- [Overview](overview.md) · [Cophenetic Correlation](cophenetic.md) · [Ward Linkage](ward.md) · [Complete Linkage](complete.md) · [Single Linkage](single.md)
