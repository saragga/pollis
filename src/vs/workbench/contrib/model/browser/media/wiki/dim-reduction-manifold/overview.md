# Overview

Many data sets with dozens of columns vary in far fewer ways. Manifold learning assumes that the observations lie near a smooth low-dimensional surface inside the feature space, and tries to recover coordinates on that surface. Principal components can only find flat surfaces, which is the limit these methods were built to overcome.

## Where Manifold Learning Comes From

Two articles in the same issue of *Science* set out the field in its current form. [Tenenbaum, de Silva and Langford (2000)](#ref-TSL2000a) replaced straight-line distances by distances measured along the data. [Roweis and Saul (2000)](#ref-RS2000a) showed that a global map can be built from local linear fits alone. [Coifman and Lafon (2006)](#ref-CL2006a) later placed related spectral methods within one framework based on random walks, and gave a scale parameter a clear meaning. Curved structure on a Swiss roll, where two points can be close in space but far apart along the sheet, is the standard illustration of why this matters.

## How the ISOmap Tab Builds an Embedding

**ISOmap** connects each point to its nearest neighbours, weighted by distance, and takes the shortest path through that graph as the distance along the surface. Classical scaling of these path lengths gives the coordinates. Because every pair of points enters, the method aims to keep global shape as well as local detail. A single wrong link across a fold can shorten many paths at once, so the choice of **k (neighbours)** is critical.

## How the LLE Tab Builds an Embedding

**LLE** writes each point as a weighted sum of its neighbours, using weights that add up to 1. These weights describe the local geometry and do not change under rotation, scaling or translation. The method then seeks low-dimensional coordinates that the same weights rebuild as well as possible. Only neighbours are compared, so the computation is sparse and global distances are never used. Distant regions are therefore placed with little direct control.

## How the Diffusion Maps Tab Builds an Embedding

**Diffusion Maps** turns kernel similarities into the transition probabilities of a random walk on the data. Two points are close if walks from them spread out in a similar way after **t (diffusion time)** steps. The eigenvectors of the transition matrix give coordinates, each scaled by its eigenvalue raised to the power t. The code applies the normalisation that removes the effect of sampling density, so geometry and density are less confounded than in a plain kernel method. Paths through many routes count, which gives some robustness to noise.

## How to Choose a Manifold Learning Tab

| Situation | Tab | Why |
|---|---|---|
| One smooth, well-sampled sheet, and global shape matters | **ISOmap** | Keeps distances along the sheet |
| Local structure matters, and n is large | **LLE** | Compares neighbours only, and the matrix is sparse |
| Noisy data with uneven sampling | **Diffusion Maps** | Averages over paths and corrects for density |
| Several scales are of interest | **Diffusion Maps** | t and **sigma** set the scale in a stated way |
| Unsure whether curvature exists at all | Start with **vs PCA** | Little gain means that the flat map is enough |

## A Common Workflow for Manifold Learning

Standardise the columns, then fit a tab at its defaults and look at **Embedding Scatter**. **Neighbourhood Graph** draws the original neighbours on the map, where long edges reveal tears and short circuits. **Choosing k or sigma** compares scales through trustworthiness, and **Residual Variance** shows how much distance structure is lost. **vs PCA** sets the linear standard. If the map holds up, **Feature Correlation** and **Colour Scatter by Feature** relate it to the columns. **Embed New Data** places new rows by local reconstruction, using the same weights for all tabs.

## What a Manifold Embedding Cannot Establish

A clean picture does not prove that the data lie on a manifold, or that the number of output dimensions is right. Axes have no fixed meaning and can be rotated or flipped between runs. Results depend on the scale chosen, and gaps can come from a sparse sample and not from real separation. Treat the coordinates as a description to be checked in the original features.

## References

<a id="ref-CL2006a"></a>Coifman, R. R. and Lafon, S. (2006). Diffusion maps. *Applied and Computational Harmonic Analysis* 21(1), 5–30. [doi:10.1016/j.acha.2006.04.006](https://doi.org/10.1016/j.acha.2006.04.006)

<a id="ref-RS2000a"></a>Roweis, S. T. and Saul, L. K. (2000). Nonlinear dimensionality reduction by locally linear embedding. *Science* 290(5500), 2323–2326. [doi:10.1126/science.290.5500.2323](https://doi.org/10.1126/science.290.5500.2323)

<a id="ref-TSL2000a"></a>Tenenbaum, J. B., de Silva, V. and Langford, J. C. (2000). A global geometric framework for nonlinear dimensionality reduction. *Science* 290(5500), 2319–2323. [doi:10.1126/science.290.5500.2319](https://doi.org/10.1126/science.290.5500.2319)

## See Also

- [Factsheet](factsheet.md) · [ISOmap](isomap.md) · [LLE](lle.md) · [Diffusion Maps](diffusion-maps.md)
