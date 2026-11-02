# t-SNE

**t-SNE** arranges the observations in two or a few dimensions so that each point keeps roughly the same neighbours it has in the original features. It is built for looking at local groups, and its coordinates have no meaning beyond that.

## What t-SNE Computes

For each point i, [van der Maaten and Hinton (2008)](#ref-MH2008a) define p(j|i), the probability of choosing j as a neighbour under a Gaussian centred on i. The width of each Gaussian is set separately, so that the effective number of neighbours equals **Perplexity**. These values are made symmetric to give p_ij. In the layout, q_ij follows a Student t distribution with one degree of freedom, q_ij proportional to 1 / (1 + ||y_i - y_j||^2). The method moves the points to minimise KL = sum over i and j of p_ij log(p_ij / q_ij). Heavy tails in q allow moderately distant points to spread apart, which reduces crowding in the layout.

## How the t-SNE Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | `X_train` | n by p data, with observations in rows |
| **Embedding Dimensions** | 2 | Number of layout coordinates |
| **Perplexity** | 30 | Effective number of neighbours |
| **max_iter** | 1000 | Number of gradient steps |
| **Learning Rate** | 200.0 | Size of each step |

The code calls `tsne(X, d, 0, maxiter, perplexity; eta = eta)` from TSne.jl, after `Random.seed!(1)`. The 0 skips the initial PCA, so every column enters the distances. The returned `Y` has one row per observation. Standardise the columns first if their units differ, as the tab does for its example.

## How to Set Perplexity and the Learning Rate

**Perplexity** sets the scale of the structure the layout pays attention to, and the original authors suggest values from 5 to 50. Small values can break real groups into fragments, and large ones blur fine groups while raising the cost. **Perplexity / n_neighbors Sweep** compares 5, 15, 30 and 50 by trustworthiness. The value must stay well under n, as each point cannot have more neighbours than the sample allows. A **Learning Rate** that is too high scatters the points into a ball, and one that is too low leaves a compressed cloud, while too few steps stop before the layout settles.

## Where t-SNE Works Well

Local groups in small or moderate samples are its strength, and the layouts often show fine structure that a linear projection misses. Each point adapts its own Gaussian, so regions of different density are treated more evenly. Used as an exploratory tool, with **Label Overlay** or **Colour Scatter by Feature**, it can suggest which groups and features deserve a closer look in the original data.

## Where t-SNE Misleads

Sizes of clusters and gaps between them are not reliable, and noise can form clumps at some settings, as [Wattenberg, Viégas and Johnson (2016)](#ref-WVJ2016a) show. Global arrangement depends strongly on the start, and [Kobak and Linderman (2021)](#ref-KL2021a) report that starting from a meaningful layout preserves more of it, whereas this tab starts at random. Each iteration costs on the order of n squared, because TSne.jl compares all pairs. There is no mapping from features to layout: for **Embed New Data**, the tab rebuilds each new point from its 10 nearest training points with local weights, so a new point far from all the training data is still placed near those neighbours.

## How to Check a t-SNE Layout

| Next Step | What it shows | A warning sign |
|---|---|---|
| **Trustworthiness** | Share of layout neighbours that were also near in `X` | Values that fall sharply as more neighbours are checked |
| **Seed Stability** | Share of the 10 layout neighbours kept across seeds 2 to 4 | A low share, which means that the layout depends on the seed |
| **vs PCA** | Trustworthiness and residual variance against a linear map | No gain over PCA, which is simpler |
| **Feature Correlation** | Linear relation of each feature to each axis | Reading axes as factors, when they carry no such meaning |

## References

<a id="ref-KL2021a"></a>Kobak, D. and Linderman, G. C. (2021). Initialization is critical for preserving global data structure in both t-SNE and UMAP. *Nature Biotechnology* 39(2), 156–157. [doi:10.1038/s41587-020-00809-z](https://doi.org/10.1038/s41587-020-00809-z)

<a id="ref-MH2008a"></a>van der Maaten, L. and Hinton, G. (2008). Visualizing data using t-SNE. *Journal of Machine Learning Research* 9(86), 2579–2605. [jmlr.org/papers/v9/vandermaaten08a.html](https://jmlr.org/papers/v9/vandermaaten08a.html)

<a id="ref-WVJ2016a"></a>Wattenberg, M., Viégas, F. and Johnson, I. (2016). How to use t-SNE effectively. *Distill* 1(10). [doi:10.23915/distill.00002](https://doi.org/10.23915/distill.00002)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [UMAP](umap.md)
