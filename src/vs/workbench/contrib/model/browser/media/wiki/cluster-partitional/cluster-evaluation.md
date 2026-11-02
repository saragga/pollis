# Cluster Evaluation

Evaluating a clustering is harder than evaluating a prediction, since no correct answer is available. Internal measures use only the data and the labels, while external measures compare one partition with another.

## What Internal and External Cluster Measures Answer

| Measure | Type | Question it answers | Where in the panel |
|---|---|---|---|
| Silhouette | Internal | Do points sit closer to their own cluster than to the next? | **Silhouette Analysis**, **Choosing k or Epsilon** |
| Adjusted Rand index | External | Do two partitions group the same pairs of points? | **Stability**, **Agreement with K-Means** |
| Surrogate fidelity | Descriptive | Can simple rules reproduce the labels? | **Surrogate Tree Rules** |
| Gap statistic | Internal, with a reference | Is the structure tighter than in data with no clusters? | Not in the panel |

## How the Silhouette Score Is Defined

For a point in a cluster, a is the mean distance to the other members of its cluster, and b is the smallest mean distance to the members of any other cluster. [Rousseeuw (1987)](#ref-Rou1987a) defines s = (b - a) / max(a, b), which lies between -1 and 1. The mean across all points summarises the partition. The score uses no outside information and is cheap once distances are known. It favours compact, well-separated groups, so comparing it across methods with different ideas of a cluster is unfair. A ring around a central blob can score poorly even when the groups are exactly those intended.

## How the Adjusted Rand Index Is Defined

The Rand index counts the pairs of points that two partitions treat alike, either together in both or apart in both, as a share of all pairs. Random partitions still reach a fairly high value on it. [Hubert and Arabie (1985)](#ref-HA1985a) correct for chance, so the adjusted index has an expected value of 0 for random labels and equals 1 for the same partition under any renumbering. `randindex(labels, other)` returns four numbers: the adjusted Rand index first, then the Rand index, the Mirkin index and the Hubert index. **DBSCAN** noise counts as one more group in this calculation, so a large noise set can raise or lower the value.

## How the Gap Statistic Tests for Structure

[Tibshirani, Walther and Hastie (2001)](#ref-TWH2001a) compare log W, the logged within-cluster dispersion at each k, with its expected value on reference data that have no clusters, usually drawn uniformly over the range of the features. The chosen k is the smallest one whose gap is at least as large as the gap at k + 1 less a term for simulation error. Unlike the silhouette, the method can select k = 1, so it speaks to whether any groups exist. It is not among the Next Steps, and writing it needs a loop over `kmeans` fits on simulated data.

## Why a Good Score Is Not Proof of Real Clusters

Internal measures are computed on the data that formed the clusters, so they reward the search as well as the structure. Selecting the highest of many settings inflates the best value further. External comparisons within the panel show only that partitions agree, and two methods can agree on the same wrong division. Sound evidence comes from outside the fit: repeating the partition on held-out or independent data, or relating the groups to variables that were not used. Choose the measures before comparing settings, and report all the settings that were tried.

## References

<a id="ref-HA1985a"></a>Hubert, L. and Arabie, P. (1985). Comparing partitions. *Journal of Classification* 2(1), 193–218. [doi:10.1007/BF01908075](https://doi.org/10.1007/BF01908075)

<a id="ref-Rou1987a"></a>Rousseeuw, P. J. (1987). Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. *Journal of Computational and Applied Mathematics* 20, 53–65. [doi:10.1016/0377-0427(87)90125-7](https://doi.org/10.1016/0377-0427(87)90125-7)

<a id="ref-TWH2001a"></a>Tibshirani, R., Walther, G. and Hastie, T. (2001). Estimating the number of clusters in a data set via the gap statistic. *Journal of the Royal Statistical Society Series B* 63(2), 411–423. [doi:10.1111/1467-9868.00293](https://doi.org/10.1111/1467-9868.00293)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
