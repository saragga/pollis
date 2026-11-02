# K-Means

**K-Means** divides the observations into **k** groups so that each point lies close to the mean of its group. It is the usual baseline for partitional clustering, because it is fast and its result is easy to describe.

## What K-Means Computes

The method looks for the partition that minimises the within-cluster sum of squares, W = sum over clusters j of sum over points i in j of ||x_i - c_j||^2, where c_j is the mean of cluster j. Finding the exact minimum is hard, so the alternating procedure of [Lloyd (1982)](#ref-Llo1982a) is used instead. Each point goes to its closest centre, each centre moves to the mean of its points, and the two steps repeat until assignments settle. W never rises during the loop, but it can stop at a local minimum.

## How the K-Means Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **k** | 3 | Number of clusters |
| **max_iter** | 300 | Limit on assignment and update passes |
| **tol** | 1e-6 | Stops when the change in cost is smaller than this value |

The code calls `kmeans(Xt, k; maxiter = max_iter, tol = tol)` from Clustering.jl on `Xt`, the transpose of `X`, as the package expects observations in columns. Starting centres come from k-means++, which spreads them across the data. `assignments(result)` gives `labels`, and `result.centers` holds the centres as a p by k matrix. **tol** is an input of this tab only.

## Where K-Means Works Well

Compact groups of comparable spread suit the method, and each pass costs about n times k times p operations, so large samples are practical. The centres are simple summaries that can be read directly as profiles, and **Assign New Data** labels a new row by its nearest centre. Because the fit is cheap, restarting from several seeds and keeping the lowest `result.totalcost` is an easy guard against poor optima.

## Where K-Means Misleads

Squared distance makes the mean sensitive to outliers, so one extreme point can claim a cluster for itself. Elongated, curved or very unequal groups get split or merged, since the boundaries between clusters are straight lines. W always falls as **k** grows, so the cost alone cannot choose **k**. Uniform data with no groups will still come out as tidy clusters, and different seeds can give different answers when the structure is weak, which **Stability** can show.

## What to Compare K-Means With

| Concern | Compare with | What to look for |
|---|---|---|
| Outliers pull the centres | **K-Medoids** | Medoids that differ noticeably from the means |
| Boundaries seem arbitrary | **Fuzzy C-Means** or **GMM** | Many points with low top membership |
| Shapes are not round | **DBSCAN** or **Spectral** | A low **Agreement with K-Means** with clearer profiles |

A disagreement between tabs does not say which one is right, so judge the partitions by their profiles and their purpose.

## References

<a id="ref-Llo1982a"></a>Lloyd, S. (1982). Least squares quantization in PCM. *IEEE Transactions on Information Theory* 28(2), 129–137. [doi:10.1109/TIT.1982.1056489](https://doi.org/10.1109/TIT.1982.1056489)

## See Also

- [K-Medoids](kmedoids.md) · [Fuzzy C-Means](fuzzy-cmeans.md) · [Decision Guide](decision-guide.md)
