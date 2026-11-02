# Diffusion Maps

**Diffusion Maps** imagines a random walk that moves between nearby observations, and calls two points close when walks starting from them spread in a similar way. Because this averages over many routes, it depends less on any single link than a shortest path does.

## What Diffusion Maps Computes

[Coifman and Lafon (2006)](#ref-CL2006a) build the walk from a kernel. The tab uses K_ij = exp(-||x_i - x_j||^2 / sigma^2). With q_i the sum of row i, a first normalisation sets K_ij to K_ij / (q_i q_j), which corresponds to alpha = 1 in their family and removes the influence of sampling density. Dividing each row by its sum then gives the Markov matrix P of one step of the walk. Its right eigenvectors psi_l, with eigenvalues lambda_l, give the coordinates lambda_l^t psi_l(i) for point i. The first eigenvector is constant and is skipped. Euclidean distance between these coordinates approximates the diffusion distance at time t, when all coordinates with a noticeable eigenvalue are kept.

## How the Diffusion Maps Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | `X_train` | n by p data, with observations in rows |
| **Output Dimensions** | 2 | Number of coordinates kept |
| **sigma (bandwidth)** | 1.0 | Width of the kernel |
| **t (diffusion time)** | 1 | Number of walk steps |

The code is written out in the panel, with `pairwise` from Distances.jl and `eigen` from LinearAlgebra, and it does not call ManifoldLearning.jl. For stability, it solves a symmetric version of P through `eigen(Symmetric(...))`, then recovers `psi` by dividing by the root of the row sums. `Y` holds columns 2 to d + 1 of `psi`, each multiplied by its eigenvalue to the power t.

## How to Set sigma and t

**sigma (bandwidth)** sets which points count as neighbours. A common start is the median pairwise distance, as the tooltip says. If it is too small, the walk is confined to tiny groups, so the leading eigenvalues pile up near 1. If it is too large, the kernel tends towards a constant and the geometry is lost. **Choosing k or sigma** compares 0.25, 0.5, 1, 2 and 4 times the current value by trustworthiness, so a best value at either end means the range needs to move. **t (diffusion time)** does not change the eigenvectors, only their weights. Larger values shrink the directions with small eigenvalues, leaving a coarser picture.

## Where Diffusion Maps Works Well

Uneven sampling and moderate noise are handled better than in **ISOmap**, because the density normalisation is built in and many paths contribute to each comparison. The decay of the eigenvalues offers a guide to how many coordinates matter, at the chosen **sigma**. No random start is involved, so the map is fixed, up to signs, given the settings. **t (diffusion time)** gives an interpretable way of looking at several scales with one decomposition.

## Where Diffusion Maps Misleads

One **sigma** applies to all points, so regions at very different scales are hard to serve at once. The default of 1.0 assumes that the columns have been standardised, and it can be far off for other data. With few output dimensions, the Euclidean distance in `Y` only approximates diffusion distance. If the walk barely connects two groups, the leading coordinate may do nothing but separate them, leaving internal structure to later coordinates. The tab uses a dense n by n eigendecomposition, which limits the sample size.

## How to Check a Diffusion Map

| Next Step | What it shows | A warning sign |
|---|---|---|
| **Embedding Scatter** | The first two coordinates | A few points far out with the rest packed together, which suggests that **sigma** is too small |
| **Choosing k or sigma** | Trustworthiness at five bandwidths | A best value at the edge of the range |
| **Residual Variance** | 1 - r^2 between layout and straight-line distances | High values are normal at large t, so read it with the scale in mind |
| **vs PCA** | Trustworthiness and residual variance against a linear map | No gain over PCA at the same dimension |

## References

<a id="ref-CL2006a"></a>Coifman, R. R. and Lafon, S. (2006). Diffusion maps. *Applied and Computational Harmonic Analysis* 21(1), 5–30. [doi:10.1016/j.acha.2006.04.006](https://doi.org/10.1016/j.acha.2006.04.006)

## See Also

- [Overview](overview.md) · [ISOmap](isomap.md) · [LLE](lle.md)
