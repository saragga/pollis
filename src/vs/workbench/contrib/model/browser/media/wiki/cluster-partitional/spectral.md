# Spectral Clustering

**Spectral** turns the data into a graph of similarities and clusters the eigenvectors of that graph. Groups are defined by connection and not by closeness to a centre, so a ring or a curved band can form one cluster.

## What Spectral Clustering Computes

The tab builds a similarity matrix W with entries W_ij = exp(-d_ij^2 / (2 sigma^2)), where d_ij is the Euclidean distance between rows i and j. With D the diagonal matrix of row sums of W, the normalised Laplacian is L = I - D^(-1/2) W D^(-1/2). The eigenvectors of its k smallest eigenvalues give each observation k new coordinates, and each row is scaled to unit length. A final k-means on those rows gives the labels. [von Luxburg (2007)](#ref-Lux2007a) explains why this works: finding weakly linked groups in a graph is a hard cut problem, and the eigenvectors give a relaxed solution to it.

## How the Spectral Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **k** | 3 | Number of clusters and of eigenvectors kept |
| **sigma** | 1.0 | Width of the Gaussian similarity |

The code computes `W = exp.(-pairwise(SqEuclidean(), X, dims = 1) ./ (2 * sigma^2))`, forms `L`, and takes `vecs = eigen(Symmetric(L)).vectors`. `Z` holds the first k columns of `vecs` with each row normalised, and `assignments(kmeans(permutedims(Z), k))` gives `labels`. **max_iter** and **tol** play no part here, since the final k-means runs with the package defaults.

## Where Spectral Clustering Works Well

Non-convex shapes separated by gaps are its main strength, such as nested rings or interlocking moons, which defeat **K-Means**. The steps after the eigenvectors are simple, and the size of the eigenvalue gap can suggest a value for **k** in clean cases. The first part of the method works on any similarity, so a matrix from a known network could replace `W` in a modified version of the code.

## Where Spectral Clustering Misleads

Results depend heavily on **sigma**, which has no default that fits all data. If it is too small, points become isolated, and if it is too large the graph loses local structure, so try several values on a scale tied to typical neighbour distances. One **sigma** also has the same trouble as one **epsilon** when groups differ in density. Noise points between clusters can form bridges, and every point gets a label, with no noise class. A dense eigendecomposition costs on the order of n cubed operations, so samples larger than a few thousand rows are slow in this form. **Stability** restarts only the last k-means, so it cannot reveal sensitivity to **sigma**.

## What to Compare Spectral Clustering With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether connection adds anything | **K-Means** | High **Agreement with K-Means**, so the extra cost brings little |
| Whether density works just as well | **DBSCAN** | The same groups recovered, with noise marked |
| Whether **sigma** drives the groups | The same tab at other values of **sigma** | A partition that holds across a range |

Graph-based groups can differ from compact ones and still be right, so a low agreement alone settles nothing.

## References

<a id="ref-Lux2007a"></a>von Luxburg, U. (2007). A tutorial on spectral clustering. *Statistics and Computing* 17(4), 395–416. [doi:10.1007/s11222-007-9033-z](https://doi.org/10.1007/s11222-007-9033-z)

## See Also

- [DBSCAN](dbscan.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
