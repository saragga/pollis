# Single Linkage

Single linkage defines the distance between two groups by their closest pair of members. The **Single** tab of the Hierarchical Clustering panel runs it through `hclust(D, linkage=:single)`, which Clustering.jl computes by a minimum spanning tree method.

## What Single Linkage Computes

For groups A and B, single linkage takes d(A, B) = min d(a, b) over every member a of A and every member b of B. After a merge, the update is d(C, A∪B) = min(d(C, A), d(C, B)). A cut at height h gives the connected components of the graph that links each pair no farther apart than h. The method has its roots in numerical taxonomy, in the work of [Sneath (1957)](#ref-Sne1957a), and [Sibson (1973)](#ref-Sib1973a) gave an optimally efficient algorithm for it. The tree carries the same information as a minimum spanning tree of the observations.

## Which Inputs the Single Tab Uses

**Single** takes **Feature Matrix**, **k** and **Distance**, with **Euclidean**, **Manhattan**, **Cosine** or **Chebyshev** on offer. The merge order depends only on the rank order of the dissimilarities, as [Johnson (1967)](#ref-Joh1967a) showed for the connected scheme, so a monotonic transformation of `D` changes the heights and leaves the structure as it was. **k** selects the cut alone. With **k** small, single linkage often returns one large cluster and a few tiny ones, since the top merges of the tree tend to attach isolated points.

## Where Single Linkage Works Well

Single linkage can follow a curved or elongated cluster, because a group needs only a chain of close neighbours to hold together. The other three tabs tend to split such a shape. Late isolated merges make the tab a simple screen for outliers: observations that stay alone at a low **k** are far from all others. The method also provides a tree when no centroid would make sense, since it uses only the pairwise dissimilarities.

## Where Single Linkage Misleads Through Chaining

Chaining is the main failure of single linkage. A few intermediate points between two distinct groups can connect them at a low height, and the two then merge long before their overall separation would justify it. The **Dendrogram** shows this as a staircase of leaves joining one growing group. Theoretical support has limits too: [Hartigan (1981)](#ref-Har1981a) showed consistency for high-density clusters in one dimension but not in higher dimensions. Noise and high dimension both make the tab less reliable.

## How to Check Single Linkage With the Panel's Silhouette Actions

Silhouette values favour compact separated groups, so **Silhouette Analysis** can score a correct elongated cluster poorly. Members at either end of a long shape can lie closer to another cluster than to their own far end. Tiny clusters also distort the mean. Clustering.jl gives a singleton a silhouette of 0, so a large cluster plus a few singletons can still post a fair mean silhouette. Read **Linkage Comparison** with this in mind: its smallest cluster size shows at once when the partition consists of one mass and some stragglers.

## What to Compare Single Linkage With

**Linkage Comparison** sets **Single** beside the other linkages. When **Single** gives one mass and stragglers while the others give balanced groups, the data is probably connected by bridging points or contains outliers. When it gives balanced groups too, the gaps between them are clean. **Cluster Scatter** plots the first two principal components and may reveal an elongated shape, though it can also hide one that lies outside that plane. DBSCAN, in the Partitional & Density Clustering panel, offers another reading of connected shapes, in which low-density points may remain unclustered.

## References

<a id="ref-Har1981a"></a>Hartigan, J. A. (1981). Consistency of single linkage for high-density clusters. *Journal of the American Statistical Association* 76(374), 388–394. [doi:10.1080/01621459.1981.10477658](https://doi.org/10.1080/01621459.1981.10477658)

<a id="ref-Joh1967a"></a>Johnson, S. C. (1967). Hierarchical clustering schemes. *Psychometrika* 32(3), 241–254. [doi:10.1007/BF02289588](https://doi.org/10.1007/BF02289588)

<a id="ref-Sne1957a"></a>Sneath, P. H. A. (1957). The application of computers to taxonomy. *Microbiology* 17(1), 201–226. [doi:10.1099/00221287-17-1-201](https://doi.org/10.1099/00221287-17-1-201)

<a id="ref-Sib1973a"></a>Sibson, R. (1973). SLINK: an optimally efficient algorithm for the single-link cluster method. *The Computer Journal* 16(1), 30–34. [doi:10.1093/comjnl/16.1.30](https://doi.org/10.1093/comjnl/16.1.30)

## See Also

- [Overview](overview.md) · [Ward Linkage](ward.md) · [Complete Linkage](complete.md) · [Average Linkage](average.md) · [Assumptions](assumptions.md)
