# Overview

Clustering looks for groups in data that carry no labels. There is no right answer to check against, so the method chosen and the idea of a cluster behind it shape the result as much as the data do.

## Where Partitional and Density Clustering Come From

Partitional methods split the data into k groups at once, unlike hierarchical methods, which build a tree of merges. [Lloyd (1982)](#ref-Llo1982a) gave the alternating procedure behind **K-Means**. [Bezdek, Ehrlich and Full (1984)](#ref-BEF1984a) described the soft version used in **Fuzzy C-Means**. **GMM** rests on the EM algorithm of [Dempster, Laird and Rubin (1977)](#ref-DLR1977a). Density methods came later, with the DBSCAN algorithm of [Ester, Kriegel, Sander and Xu (1996)](#ref-EKSX1996a) finding clusters of any shape without being told their number. Graph-based ideas, reviewed by [von Luxburg (2007)](#ref-Lux2007a), supply **Spectral**.

## How the Centre-Based Tabs Work

**K-Means**, **K-Medoids** and **Fuzzy C-Means** share a two-step loop: assign points given the centres, then update the centres given the points. **K-Means** uses means and squared distance. **K-Medoids** requires each centre to be an actual observation, and it works from a distance matrix. **Fuzzy C-Means** gives each point a weight in every cluster. All three start from random seeds and find local optima, so runs can differ. All of them favour compact, roughly round groups, because a point joins the cluster with the closest centre.

## How the Density, Mixture and Graph Tabs Work

**DBSCAN** marks points with enough close neighbours as core points, links core points that lie within **epsilon** of each other, and leaves anything unreachable as noise. **GMM** fits a weighted mixture of Gaussians and returns the probability of each component for each point, which allows clusters of different sizes and spreads. **Spectral** builds a similarity graph from distances, takes eigenvectors of its Laplacian, and runs k-means on them, so a ring or a curved band can form one cluster.

## A Common Workflow for Clustering

Standardise the columns when their scales differ, then decide what kind of cluster the question calls for. Fit with a starting value of **k** or **epsilon**, and look at **Cluster Scatter** and **Cluster Sizes**. Use **Choosing k or Epsilon** to compare settings and **Silhouette Analysis** to see which points fit their cluster poorly. **Stability** shows whether the partition repeats, and **vs Random Labels** shows how far it stands from chance. With a stable result in hand, **Cluster Profiles**, **Distinguishing Features** and **Surrogate Tree Rules** describe the groups in terms of the features. **Agreement with K-Means** shows whether the chosen method actually differs from the simplest one.

## What Clustering Cannot Tell You

Every tab returns groups even from data with no groups in it. High separation on the same data used for clustering does not show that the groups are real. A partition may be useful without being the unique natural division, and two partitions of the same data may both be valid for different purposes. Clusters should be judged by what they are for, and checked on other data or against outside knowledge where possible.

## References

<a id="ref-BEF1984a"></a>Bezdek, J. C., Ehrlich, R. and Full, W. (1984). FCM: The fuzzy c-means clustering algorithm. *Computers & Geosciences* 10(2-3), 191–203. [doi:10.1016/0098-3004(84)90020-7](https://doi.org/10.1016/0098-3004(84)90020-7)

<a id="ref-DLR1977a"></a>Dempster, A. P., Laird, N. M. and Rubin, D. B. (1977). Maximum likelihood from incomplete data via the EM algorithm. *Journal of the Royal Statistical Society Series B* 39(1), 1–22. [doi:10.1111/j.2517-6161.1977.tb01600.x](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x)

<a id="ref-EKSX1996a"></a>Ester, M., Kriegel, H. P., Sander, J. and Xu, X. (1996). A density-based algorithm for discovering clusters in large spatial databases with noise.

<a id="ref-Llo1982a"></a>Lloyd, S. (1982). Least squares quantization in PCM. *IEEE Transactions on Information Theory* 28(2), 129–137. [doi:10.1109/TIT.1982.1056489](https://doi.org/10.1109/TIT.1982.1056489)

<a id="ref-Lux2007a"></a>von Luxburg, U. (2007). A tutorial on spectral clustering. *Statistics and Computing* 17(4), 395–416. [doi:10.1007/s11222-007-9033-z](https://doi.org/10.1007/s11222-007-9033-z)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Cluster Evaluation](cluster-evaluation.md)
