# Factsheet

The Manifold Learning panel looks for a low-dimensional curved surface on which the observations might lie, then flattens it into a few coordinates. Its three tabs differ in the property of the surface they try to keep.

## What the Manifold Learning Panel Does

| Item | Description |
|---|---|
| **Purpose** | Replace many columns with a few coordinates that follow curved structure |
| **Julia stack** | ManifoldLearning.jl for **ISOmap** and **LLE**, LinearAlgebra and Distances.jl for **Diffusion Maps**, Plots.jl for the charts |
| **Input** | **Feature Matrix**, n by p, one row per observation |
| **Output** | `Y`, n by d, one row of coordinates per observation |
| **Key choice** | The neighbourhood scale, through **k (neighbours)** or **sigma (bandwidth)** |

Standardise columns on different scales first, because all three tabs start from Euclidean distances between rows.

## What Each Manifold Learning Tab Preserves

| Tab | What is preserved | Solved by | Function |
|---|---|---|---|
| **ISOmap** | Distances along a neighbour graph | Classical scaling of shortest paths | `fit(Isomap, Xt; k, maxoutdim)` |
| **LLE** | Each point's reconstruction from its neighbours | An eigenproblem on a sparse matrix | `fit(LLE, Xt; k, maxoutdim)` |
| **Diffusion Maps** | Distances between random walks on the data | Eigenvectors of a Markov matrix | `eigen` in the panel's code |

None of the three has a random start, so a fit repeats exactly, up to the signs of the coordinates.

## Which Inputs Each Manifold Learning Tab Takes

| Input | Used by | Default | Effect |
|---|---|---|---|
| **Output Dimensions** | All tabs | 2 | Number of coordinates in `Y` |
| **k (neighbours)** | **ISOmap**, **LLE** | 10 | Size of each point's neighbourhood |
| **sigma (bandwidth)** | **Diffusion Maps** | 1.0 | Width of the kernel exp(-\|\|x_i - x_j\|\|^2 / sigma^2) |
| **t (diffusion time)** | **Diffusion Maps** | 1 | Number of walk steps, which weights coarser scales as it grows |

**LLE** embeds only the largest connected part of the neighbour graph, so the code drops any other rows from `X`.

## Which Next Steps the Manifold Learning Panel Offers

| Group | Next Steps |
|---|---|
| Visualise | **Embedding Scatter**, **Neighbourhood Graph** |
| Diagnose | **Trustworthiness**, **Residual Variance**, **Choosing k or sigma** |
| Predict | **Embed New Data** |
| Compare | **vs PCA** |
| Interpret | **Feature Correlation**, **Colour Scatter by Feature** |

**Embed New Data** works the same way in all three tabs: it rebuilds each row of `X_new` from its 10 nearest training points, and applies those weights to their coordinates.

## See Also

- [Overview](overview.md) · [ISOmap](isomap.md) · [LLE](lle.md) · [Diffusion Maps](diffusion-maps.md)
