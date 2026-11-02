# Overview

Hierarchical clustering arranges observations in a tree of nested groups, so the number of clusters can be decided after the fit. The Hierarchical Clustering panel builds that tree with `hclust` and cuts it with `cutree`, both from Clustering.jl.

## What Agglomerative Hierarchical Clustering Does

Agglomerative clustering starts with every observation in a group of its own. At each step the two closest groups merge, and the distance at which they merged is recorded as the height of that merge. After n − 1 merges a single group remains. The record of merges is a binary tree, drawn as a dendrogram. Cutting the tree at one height gives a flat partition, and the partitions from different cuts are nested. A merge is never undone, so an early poor choice stays in the tree. The method fits no probability model and offers no test that groups exist: it returns a tree for any matrix, including one with no group structure.

## Where the Hierarchical Clustering Methods Come From

Numerical taxonomy supplied the first of these methods. [Sneath (1957)](#ref-Sne1957a) grouped organisms by computer with a rule of the single linkage type. [Sokal and Rohlf (1962)](#ref-SR1962a) compared dendrograms by correlating their implied distances, which became the cophenetic correlation. [Ward (1963)](#ref-War1963a) framed each merge as the one that loses least in an objective function, with the error sum of squares as the usual choice. [Johnson (1967)](#ref-Joh1967a) described a connected and a compact scheme that depend only on the rank order of the dissimilarities. [Lance and Williams (1967)](#ref-LW1967a) gave one recurrence that updates group distances for a family of such strategies.

## How the Four Hierarchical Clustering Tabs Measure the Distance Between Groups

The tabs share every step but one: the rule for the distance between two groups A and B. In the table nA and nB are the group sizes, and cA and cB the centroids.

| Tab | Distance between groups A and B | Consequence |
|---|---|---|
| **Ward** | sqrt(2 × nA × nB / (nA + nB)) × Euclidean distance from cA to cB | Favours compact groups of similar size |
| **Complete** | Largest distance from a member of A to a member of B | Keeps diameters small; an outlier can dominate a merge |
| **Average** | Mean of all distances from members of A to members of B | Weighs every pair equally |
| **Single** | Smallest distance from a member of A to a member of B | Follows thin connected shapes; can chain through noise |

## How the Hierarchical Clustering Panel Computes the Tree and the Labels

The code forms `D = pairwise(metric, X, dims=1)`, then `hc = hclust(D, linkage=...)`, then `labels = cutree(hc, k=k)`, and prints the cluster sizes. **k** plays no part in building the tree. Changing it moves only the cut, so several values can be tried from one fit. No random start is involved, so a rerun on the same matrix returns the same tree. The full n × n matrix `D` must fit in memory, which limits the number of observations far sooner than it limits the number of features.

## A Common Workflow for Hierarchical Clustering in the Panel

1. Standardise **Feature Matrix** when its columns have different scales, and choose **Distance** on the tabs that offer it.
2. Open **Dendrogram** and **Merge Heights** to see whether a cut stands out.
3. Run **Choosing k** and **Silhouette Analysis**, then set **k**.
4. Check how far the tree preserves the distances with **Cophenetic Correlation**.
5. Run **Linkage Comparison** and **Agreement with K-Means** to see whether the grouping depends on the method.
6. Describe the clusters with **Cluster Profiles**, **Distinguishing Features** and **Surrogate Tree Rules**.
7. Place further observations with **Assign New Data**.

## References

<a id="ref-Joh1967a"></a>Johnson, S. C. (1967). Hierarchical clustering schemes. *Psychometrika* 32(3), 241–254. [doi:10.1007/BF02289588](https://doi.org/10.1007/BF02289588)

<a id="ref-LW1967a"></a>Lance, G. N. and Williams, W. T. (1967). A general theory of classificatory sorting strategies: 1. Hierarchical systems. *The Computer Journal* 9(4), 373–380. [doi:10.1093/comjnl/9.4.373](https://doi.org/10.1093/comjnl/9.4.373)

<a id="ref-Sne1957a"></a>Sneath, P. H. A. (1957). The application of computers to taxonomy. *Microbiology* 17(1), 201–226. [doi:10.1099/00221287-17-1-201](https://doi.org/10.1099/00221287-17-1-201)

<a id="ref-SR1962a"></a>Sokal, R. R. and Rohlf, F. J. (1962). The comparison of dendrograms by objective methods. *Taxon* 11(2), 33–40. [doi:10.2307/1217208](https://doi.org/10.2307/1217208)

<a id="ref-War1963a"></a>Ward, J. H. (1963). Hierarchical grouping to optimize an objective function. *Journal of the American Statistical Association* 58(301), 236–244. [doi:10.1080/01621459.1963.10500845](https://doi.org/10.1080/01621459.1963.10500845)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Ward Linkage](ward.md) · [Complete Linkage](complete.md) · [Average Linkage](average.md) · [Single Linkage](single.md) · [Cophenetic Correlation](cophenetic.md)
