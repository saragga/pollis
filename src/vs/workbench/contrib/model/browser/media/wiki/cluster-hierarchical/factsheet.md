# Factsheet

The Hierarchical Clustering panel merges observations step by step into a tree with `hclust` from Clustering.jl, then cuts the tree into **k** flat clusters. The four tabs differ in how they measure the distance between two groups.

## What the Hierarchical Clustering Panel Does

| Item | Description |
|---|---|
| **Purpose** | Unsupervised grouping: a full merge tree and one flat label per observation |
| **Julia stack** | Clustering.jl for `hclust`, `cutree`, `silhouettes`, `kmeans` and `randindex`; Distances.jl for `pairwise`; StatsPlots.jl and Plots.jl for the charts; DecisionTree.jl for **Surrogate Tree Rules** |
| **Models** | **Ward**, **Complete**, **Average** and **Single** tabs |
| **Input shape** | **Feature Matrix** is n_samples × n_features, with one row per observation |
| **Results kept** | `D` the dissimilarity matrix, `hc` the tree, `labels` the flat clusters |
| **Key choice** | The linkage, then the height at which to cut the tree |

## How the Hierarchical Clustering Tabs Differ

| Tab | Distance between two groups | **Distance** input | Clusters it tends to form |
|---|---|---|---|
| **Ward** | Growth in within-cluster sum of squares caused by the merge | Absent, always Euclidean | Compact, of similar size |
| **Complete** | Largest distance between members | Available | Tight, with a small diameter |
| **Average** | Mean distance between members | Available | Between **Complete** and **Single** |
| **Single** | Smallest distance between members | Available | Elongated, often chained |

## Which Inputs the Hierarchical Clustering Panel Uses

The panel has three inputs. No seed is among them, because `hclust` uses no random start.

| Input | Default | Meaning |
|---|---|---|
| **Feature Matrix** | `X_train` | The observations. A matrix of your own must be standardised by you when its columns are on different scales |
| **k** | 3 | Number of flat clusters that `cutree` returns. Changing it does not change the tree |
| **Distance** | **Euclidean** | **Euclidean**, **Manhattan**, **Cosine** or **Chebyshev**, on **Complete**, **Average** and **Single** only |

## Which Next Steps the Hierarchical Clustering Panel Offers

All actions read `hc`, `labels` or `D` from the main fit, so run the tab first. **Assign New Data** also needs a matrix `X_new`, which the panel defines only with the default `X_train`.

| Group | Actions |
|---|---|
| **Visualise** | **Dendrogram**, **Cluster Scatter** |
| **Diagnose** | **Silhouette Analysis**, **Cophenetic Correlation**, **Merge Heights**, **Choosing k** |
| **Predict** | **Assign New Data** |
| **Compare** | **Linkage Comparison**, **Agreement with K-Means** |
| **Interpret** | **Cluster Profiles**, **Distinguishing Features**, **Surrogate Tree Rules** |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Ward Linkage](ward.md) · [Cophenetic Correlation](cophenetic.md)
