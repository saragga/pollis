# ISOmap

**ISOmap** measures distance along the data instead of straight through the feature space, then finds coordinates that keep those distances. It generalises classical scaling to curved sheets, so two points on opposite folds stay far apart in the result.

## What ISOmap Computes

[Tenenbaum, de Silva and Langford (2000)](#ref-TSL2000a) describe three steps. First, connect each point to its k nearest neighbours, with edges weighted by Euclidean distance. Second, take the shortest path through the graph between every pair of points, which gives the geodesic distance matrix G. Third, apply classical scaling: B = -(1/2) J G^2 J, where G^2 holds squared entries and J = I - (1/n) 1 1' is the centring matrix, and the top d eigenvectors of B, scaled by the square roots of their eigenvalues, give the coordinates. If the data lie on a flat sheet with good coverage, these coordinates recover its layout up to rotation.

## How the ISOmap Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | `X_train` | n by p data, with observations in rows |
| **Output Dimensions** | 2 | Number of coordinates kept |
| **k (neighbours)** | 10 | Neighbours used to build the graph |

The code calls `predict(fit(Isomap, Xt; k = k, maxoutdim = d))` from ManifoldLearning.jl, with `Xt` the transpose of `X`, because the package expects observations in columns. The result is transposed into `Y`. A helper, `geodesic()`, computes the shortest paths on the graph with the Floyd-Warshall loop, so that **Residual Variance** and **vs PCA** can compare the layout with the distances the method aims to keep.

## Where ISOmap Works Well

A single smooth, well-sampled sheet with no holes is the ideal setting, and global shape comes through because every pair of points enters. The eigenvalues of B also hint at the intrinsic dimension, since residual variance should stop falling once enough coordinates are kept. There is no iteration or random start in the fit, so the same data and settings give the same layout, up to signs.

## Where ISOmap Misleads

Choice of **k (neighbours)** carries real risk. If it is too large, one link across a gap between folds acts as a short circuit and shortens many paths at once. If it is too small, the graph falls apart into pieces, and pairs between pieces have no finite path. Surfaces with holes or high curvature cannot be flattened without distorting distances. The cost is heavy: the shortest paths and a dense n by n eigenproblem limit the sample size, so thousands of rows are slow. Noise in the columns can also create false links.

## How to Check an ISOmap Layout

| Next Step | What it shows | A warning sign |
|---|---|---|
| **Neighbourhood Graph** | The original 10 nearest neighbours drawn on the map | Long edges across the map, which suggest a short circuit or a tear |
| **Residual Variance** | 1 - r^2 between geodesic and layout distances, with a Shepard diagram | A high value, or a wide cloud in the diagram |
| **Choosing k or sigma** | Trustworthiness at k of 5, 8, 10, 15, 20 and 30 | A sudden fall as k grows, which marks a short circuit |
| **vs PCA** | Trustworthiness and residual variance against a linear map | No gain over PCA, so curvature may not matter |

Residual variance in this tab uses geodesic distances for both the layout and the PCA map, so a correct unrolling is not penalised for differing from straight-line distances.

## References

<a id="ref-TSL2000a"></a>Tenenbaum, J. B., de Silva, V. and Langford, J. C. (2000). A global geometric framework for nonlinear dimensionality reduction. *Science* 290(5500), 2319–2323. [doi:10.1126/science.290.5500.2319](https://doi.org/10.1126/science.290.5500.2319)

## See Also

- [Overview](overview.md) · [LLE](lle.md) · [Diffusion Maps](diffusion-maps.md)
