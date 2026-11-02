# DBSCAN

**DBSCAN** finds clusters as dense regions separated by sparser space, and it leaves isolated points out as noise. It needs no number of clusters in advance, and its clusters can take any shape.

## What DBSCAN Computes

Each point is classed by how many neighbours lie within a radius. A core point has at least **min_pts** neighbours within **epsilon**. Two core points within **epsilon** of each other share a cluster, and chains of such links make up the whole cluster. A border point lies within **epsilon** of a core point without being core itself, and it joins that cluster. Everything else is noise. The algorithm of [Ester, Kriegel, Sander and Xu (1996)](#ref-EKSX1996a) has only these two settings, and it involves no centres and no objective to optimise. The core clusters do not depend on the order of the points, though a border point within reach of two clusters can go to either one.

## How the DBSCAN Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **epsilon** | 2.4 | Neighbourhood radius, in the units of the features |
| **min_pts** | 5 | Neighbours required for a core point |

The code calls `dbscan(Xt, radius; min_neighbors = minpts)` from Clustering.jl. `result.assignments` gives `labels`, with 0 marking noise, `maximum(labels)` gives the number of clusters found, and `count(==(0), labels)` gives the noise count. A common starting point for **min_pts** is twice the number of features, and **Choosing k or Epsilon** helps to place **epsilon** at the knee of the k-distance curve. The default of 2.4 belongs to the panel's example, so a new scale calls for a new radius.

## Where DBSCAN Works Well

Curved or irregular shapes are handled well when their density is about even, and outliers stay out of the clusters instead of distorting them. Labelling noise is itself useful for finding unusual cases. With a suitable spatial index, the cost can be much lower than comparing all pairs, as [Schubert, Sander, Ester, Kriegel and Xu (2017)](#ref-SSEKX2017a) discuss, along with practical guidance on the settings.

## Where DBSCAN Misleads

Clusters of very different density cannot all be found with one **epsilon**. A thin chain of points between two groups can merge them into one, a weakness shared with single linkage. A small change in **epsilon** can shift the partition sharply, from mostly noise to one big cluster, which **Stability** looks at by trying 0.8 to 1.2 times the value. Unscaled or many-column data weaken the meaning of a single radius. In **Assign New Data**, a far-away point still gets the label of its nearest neighbour, which differs from the rule of the method.

## What to Compare DBSCAN With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether density shapes matter | **K-Means** | Low **Agreement with K-Means** with clearer profiles |
| Whether connection works better than density | **Spectral** | The same curved groups recovered at a sensible **sigma** |
| Whether densities vary | Fits at several values of **epsilon** | Clusters that appear at one radius and vanish at another |

Noise needs care in all of these comparisons, since a measure may count it as a group.

## References

<a id="ref-EKSX1996a"></a>Ester, M., Kriegel, H. P., Sander, J. and Xu, X. (1996). A density-based algorithm for discovering clusters in large spatial databases with noise.

<a id="ref-SSEKX2017a"></a>Schubert, E., Sander, J., Ester, M., Kriegel, H. and Xu, X. (2017). DBSCAN revisited, revisited. *ACM Transactions on Database Systems* 42(3), 1–21. [doi:10.1145/3068335](https://doi.org/10.1145/3068335)

## See Also

- [Spectral Clustering](spectral.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
