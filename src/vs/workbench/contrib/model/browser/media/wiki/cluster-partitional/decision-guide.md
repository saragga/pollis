# Decision Guide

Choosing a clustering method mostly means choosing what a cluster should be. Start with the question and the shape of the data, then let the checks confirm or overturn the choice.

## Which Clustering Tab Suits Which Situation

| Situation | Tab | Why |
|---|---|---|
| Compact groups, many observations | **K-Means** | Fast, and a good first baseline |
| Outliers are present, or a typical real case is wanted | **K-Medoids** | Centres are actual observations and use plain distance |
| Only a dissimilarity matrix is available | **K-Medoids** | Runs on `D` alone, with no coordinates needed |
| Groups overlap, and partial membership is meaningful | **Fuzzy C-Means** | Gives each point a degree in every cluster |
| Unknown number of groups, irregular shapes, some noise | **DBSCAN** | Finds dense regions and leaves stragglers out |
| Clusters of different spread, and probabilities are wanted | **GMM** | Each component has its own variances and weight |
| Rings, moons or other connected non-convex shapes | **Spectral** | Follows the graph of local similarity |

## How to Decide Whether k Should Be Fixed

**DBSCAN** finds the number of clusters from **epsilon** and **min_pts**, and every other tab needs **k**. If the purpose fixes it, such as three customer tiers for a budget, simply set it. Otherwise use **Choosing k or Epsilon**, and look for a value at which the silhouette peaks and **Stability** stays high. Several values may be defensible, so prefer the one whose groups can be explained. A choice based only on silhouette values favours compact partitions, and often small k.

## How to Choose Between Hard and Soft Assignment

Hard labels suit tasks where every point needs one group, such as assigning a case to a team. Soft memberships suit questions where borderline cases matter. **GMM** gives probabilities under a stated model, which allows a likelihood and a principled treatment of uncertainty, if the Gaussian assumption is fair. **Fuzzy C-Means** gives degrees without a probability model, and is simpler to fit, though **fuzziness (m)** has to be chosen and the degrees cannot be read as chances.

## How Sample Size and Dimension Affect the Choice

| Condition | Better options | Reason |
|---|---|---|
| Very many observations | **K-Means** | Cost per pass grows linearly with n |
| More than a few thousand observations | Avoid **K-Medoids**, **Spectral** in this form | Both build an n by n matrix |
| Many columns | Reduce dimension first | Distances lose contrast, and **DBSCAN** suffers most |
| Few observations per cluster | Avoid **GMM** | Variances are poorly estimated |

These limits describe the code in the panel, and other implementations may go further.

## How to Compare Clustering Tabs on the Same Data

Fit the simple baseline first. **Agreement with K-Means** reports the adjusted Rand index against **K-Means** at the same number of clusters. High agreement suggests that the simpler method is enough. Low agreement leaves the question open, so use **Cluster Scatter** and **Cluster Profiles** to see which split makes more sense for the purpose. Mean silhouettes across tabs favour compact shapes, so they are unfair to **DBSCAN** and **Spectral**. Where outside labels or an outcome exist, they make a more useful judge, as long as they did not enter the fit.

## When to Use Another Panel for Clustering

The Hierarchical Clustering panel suits questions about nested groups, or a case where a dendrogram is wanted. Neighbour Embedding or Manifold Learning can show structure in many dimensions for a visual check, though clustering on such a map can create groups that are not in the data. If a labelled outcome is available and prediction is the aim, a classifier answers the question more directly than clusters do.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Cluster Evaluation](cluster-evaluation.md)
