# LLE

**LLE**, short for locally linear embedding, treats each small patch of the data as nearly flat. It records how each point is rebuilt from its neighbours, then finds coordinates in which the same recipe still works.

## What LLE Computes

[Roweis and Saul (2000)](#ref-RS2000a) use two optimisation steps. Weights come first: for each point i, choose W_ij to minimise ||x_i - sum over j of W_ij x_j||^2, with the weights of each point adding up to 1 and W_ij = 0 unless j is a neighbour of i. Coordinates come next: with W held fixed, choose y to minimise sum over i of ||y_i - sum over j of W_ij y_j||^2, subject to centred and uncorrelated coordinates. The solution is given by the bottom eigenvectors of M = (I - W)'(I - W), skipping the constant one. Rotation, scaling and translation leave the weights unchanged, so they describe local geometry on their own.

## How the LLE Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | `X_train` | n by p data, with observations in rows |
| **Output Dimensions** | 2 | Number of coordinates kept |
| **k (neighbours)** | 10 | Neighbours used for each reconstruction |

The code calls `predict(fit(LLE, Xt; k = k, maxoutdim = d))` from ManifoldLearning.jl. `vertices` lists the rows in the largest connected part of the neighbour graph, and the code drops all others from `X` and `Xt`, so the rows stay aligned with `Y`. Check the number of rows in `X` after the fit, as it may be smaller than the original. Within **Choosing k or sigma**, a value of k that leaves further points out gives `NaN`, because `trustworthiness` cannot compare matrices of different sizes.

## Where LLE Works Well

Smooth patches that are well covered by the sample suit the method, as long as each neighbourhood is close to flat. Only local information enters, so one wrong link does less damage than in **ISOmap**. W and M are sparse, which allows larger samples with a sparse eigensolver. No iteration or random start is involved, so the outcome is fixed up to signs, given the data and settings.

## Where LLE Misleads

Global layout is not controlled directly, so distant regions can be placed in misleading positions. A common failure is collapse, in which most points crowd together near a point or a line while a few stretch away, since the constraints fix only the overall variance. A value of **k (neighbours)** that is too small leaves weights poorly determined and may cut the graph, while too large a value breaks the local flatness that the method relies on. Noise and uneven density affect the weights too. Eigenvectors with close eigenvalues can swap or mix, which makes axes unstable between settings.

## How to Check an LLE Layout

| Next Step | What it shows | A warning sign |
|---|---|---|
| **Embedding Scatter** | The layout itself | A tight cluster with long thin arms, which signals collapse |
| **Neighbourhood Graph** | The original 10 nearest neighbours drawn on the map | Long edges, so that neighbours were pulled apart |
| **Trustworthiness** | Whether layout neighbours were near in `X`, for 5 to 50 neighbours | A low value at small neighbourhood sizes, the method's main target |
| **Choosing k or sigma** | Trustworthiness at k of 5, 8, 10, 15, 20 and 30 | `NaN`, or large swings between adjacent values |

**Residual Variance** in this tab compares layout distances with straight-line distances, and **LLE** does not try to keep those, so a high value alone is no failure. Read it next to **vs PCA**.

## References

<a id="ref-RS2000a"></a>Roweis, S. T. and Saul, L. K. (2000). Nonlinear dimensionality reduction by locally linear embedding. *Science* 290(5500), 2323–2326. [doi:10.1126/science.290.5500.2323](https://doi.org/10.1126/science.290.5500.2323)

## See Also

- [Overview](overview.md) · [ISOmap](isomap.md) · [Diffusion Maps](diffusion-maps.md)
