# Diagnostics

With no labels to compare against, clustering diagnostics ask whether a partition is well separated, whether it repeats and whether it beats chance. Each Next Step answers a narrow form of one of those questions.

## What to Look for in Cluster Scatter and Cluster Sizes

**Cluster Scatter** colours the observations on their first two principal components. Clean groups in the plot support the partition, while overlap may only mean that the separation lies in other components, so it is weak evidence against. **Cluster Sizes** counts the observations per cluster, with noise as cluster 0 in **DBSCAN**. One giant cluster with a few tiny ones often signals outliers, a poor **epsilon** or too large a **k**. In **DBSCAN**, a large noise count suggests that **epsilon** is too small.

## How to Read Silhouette Analysis

**Silhouette Analysis** gives each observation the score of [Rousseeuw (1987)](#ref-Rou1987a), s = (b - a) / max(a, b), where a is its mean distance to its own cluster and b is its mean distance to the nearest other cluster. Values near 1 show a good fit, values near 0 sit between two clusters, and negative values suggest the wrong cluster. The dashed line marks the mean, and **DBSCAN** noise is left out of the calculation. Look at the shape as well as the mean: a cluster with many negative values, or one much thinner than the others, is a concern. The score uses Euclidean distance and favours compact groups, so it can undervalue valid curved clusters from **DBSCAN** or **Spectral**.

## How to Use Choosing k or Epsilon

**Choosing k or Epsilon** plots the mean silhouette for k from 2 to 10, and a clear peak is a reasonable candidate. A flat line says no value stands out, and a run that keeps rising can mean the data have no natural number of clusters. For **DBSCAN**, the step plots each point's sorted distance to its **min_pts**-th neighbour, with the current radius dashed. **epsilon** near the knee of that curve separates dense points from sparse ones. The silhouette cannot be computed at k = 1, so this step cannot say whether one cluster is the best answer.

## How to Read the Stability Step

**Stability** reports the mean and minimum adjusted Rand index between `labels` and 20 refits, or between `labels` and **DBSCAN** at 0.8 to 1.2 times **epsilon**. Values near 1 show that the result repeats. Low values mean that the optimiser finds different partitions, so the current one should not be trusted without more restarts. The step restarts on the same data, so it does not test sensitivity to the sample, and a high value may simply reflect a fixed initial step. For **Spectral**, only the final k-means restarts while the eigenvectors stay fixed, so high stability there says little about **sigma**. Refitting on bootstrap samples is a stronger test, which has to be done by hand.

## What vs Random Labels Shows

**vs Random Labels** computes the mean silhouette of the partition and of 20 shuffles of its labels, keeping the cluster sizes. Shuffled labels give a value near 0, so a clear gap shows only that the groups are better than arbitrary ones. Any clustering algorithm will achieve this even on data with no structure, because it picks its groups by closeness. Treat a small gap as a warning, and a large gap as a necessary condition and not as proof that the clusters are real.

## How to Check Convergence and Local Optima

The panel does not report convergence directly. For **K-Means**, **K-Medoids** and **Fuzzy C-Means**, read `result.converged` and `result.iterations`. A `false` means that **max_iter** ran out, and raising it is the remedy. Compare `result.totalcost` over several restarts, and keep the run with the lowest cost when more than one is plausible. **GMM** stops according to its tolerance, and a component collapsing onto a few points is a sign of too many components, or of too few observations.

## References

<a id="ref-Rou1987a"></a>Rousseeuw, P. J. (1987). Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. *Journal of Computational and Applied Mathematics* 20, 53–65. [doi:10.1016/0377-0427(87)90125-7](https://doi.org/10.1016/0377-0427(87)90125-7)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Cluster Evaluation](cluster-evaluation.md)
