# Factsheet

The Partitional & Density Clustering panel divides observations into groups with no labels to learn from. Its six tabs differ in what they take a cluster to be: points around a centre, a dense region, a Gaussian component or a connected part of a similarity graph.

## What the Partitional & Density Clustering Panel Does

| Item | Description |
|---|---|
| **Purpose** | Assign each observation to a cluster, or give it a degree of membership in each |
| **Julia stack** | Clustering.jl for most methods and the silhouette and Rand index, BetaML.jl for **GMM**, Distances.jl for distances, DecisionTree.jl for the surrogate rules, Plots.jl for the charts |
| **Input** | **Feature Matrix**, n by p, one row per observation |
| **Output** | `labels`, one integer per observation, where 0 means noise in **DBSCAN** |
| **Key choice** | What shape of cluster to expect, and whether the number of clusters is known |

Standardise columns on different scales first, since every tab depends on distances between rows.

## What Each Clustering Tab Fits

| Tab | A cluster is | Assignment | Function |
|---|---|---|---|
| **K-Means** | Points around a mean | Hard | `kmeans` |
| **K-Medoids** | Points around a real observation | Hard | `kmedoids` on a distance matrix |
| **Fuzzy C-Means** | Points around a centre, in degrees | Soft | `fuzzy_cmeans` |
| **DBSCAN** | A dense connected region | Hard, with noise | `dbscan` |
| **GMM** | A Gaussian component | Soft | `GaussianMixtureClusterer` |
| **Spectral** | A connected part of a similarity graph | Hard | `eigen`, then `kmeans` on eigenvectors |

## Which Inputs Each Clustering Tab Takes

| Input | Used by | Default | Effect |
|---|---|---|---|
| **k** | All but **DBSCAN** | 3 | Number of clusters or components |
| **max_iter** | **K-Means**, **K-Medoids**, **Fuzzy C-Means**, **GMM** | 300 | Limit on iterations |
| **tol** | **K-Means** | 1e-6 | Tolerance on the change in the objective |
| **fuzziness (m)** | **Fuzzy C-Means** | 2.0 | Softness of memberships, greater than 1 |
| **epsilon** | **DBSCAN** | 2.4 | Neighbourhood radius |
| **min_pts** | **DBSCAN** | 5 | Neighbours needed for a core point |
| **sigma** | **Spectral** | 1.0 | Bandwidth of the similarity between points |

The default of **epsilon** is set for the panel's example, and other data will need its own value.

## Which Next Steps the Clustering Panel Offers

| Group | Next Steps |
|---|---|
| Visualise | **Cluster Scatter**, **Cluster Sizes**, **Membership Uncertainty** |
| Diagnose | **Silhouette Analysis**, **Choosing k or Epsilon**, **Stability** |
| Predict | **Assign New Data** |
| Compare | **Agreement with K-Means**, **vs Random Labels** |
| Interpret | **Cluster Profiles**, **Distinguishing Features**, **Surrogate Tree Rules** |

Some steps add little for some tabs: **Membership Uncertainty** is only informative for **Fuzzy C-Means** and **GMM**, which both give soft assignments.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Cluster Evaluation](cluster-evaluation.md)
