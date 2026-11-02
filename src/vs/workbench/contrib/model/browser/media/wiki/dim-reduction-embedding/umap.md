# UMAP

**UMAP** builds a graph of each observation's nearest neighbours, then finds a low-dimensional layout with a similar graph. It runs on larger samples than the **t-SNE** tab, and its fitted model can place new points.

## What UMAP Computes

[McInnes, Healy and Melville (2018)](#ref-MHM2018a) start from the k nearest neighbours of each point. An edge from i to j gets the weight exp(-(d_ij - rho_i) / sigma_i), where rho_i is the distance to the closest neighbour of i and sigma_i is scaled to the neighbourhood. The two directions are merged by w_ij = a + b - a b, with a and b the weights of i to j and j to i. In the layout, a similar weight v_ij comes from a smooth curve of the distance, shaped by **min_dist**. The objective is the cross-entropy, sum of w_ij log(w_ij / v_ij) + (1 - w_ij) log((1 - w_ij) / (1 - v_ij)). The first term draws neighbours together, and the second pushes non-neighbours apart, using a small random sample of them.

## How the UMAP Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | `X_train` | n by p data, with observations in rows |
| **Embedding Dimensions** | 2 | Number of layout coordinates |
| **n_neighbors** | 15 | Neighbours used to build the graph |
| **min_dist** | 0.1 | Smallest spacing allowed between points in the layout |

The code runs `UMAP.fit(Xt, d; n_neighbors = nn, min_dist = min_dist)` from UMAP.jl, with `Xt` the transpose of `X`, because the package wants features in rows. `model.embedding` holds the layout, which the code transposes into `Y`, with one row per observation. `Random.seed!(1)` runs first, since the neighbour search and the optimisation both use random numbers.

## How to Set n_neighbors and min_dist

**n_neighbors** plays a role close to that of **Perplexity**. Low values focus on fine detail and may split a graph into disconnected pieces, while high values give a broader view at the cost of small groups. **Perplexity / n_neighbors Sweep** tries 5, 10, 15, 30 and 50 and reports trustworthiness at each. **min_dist** does not change the graph, only the layout. Small values let points pack tightly, which makes groups look sharper, and large values spread them evenly. A tighter look is therefore a setting, and it is not evidence of better separated groups.

## Where UMAP Works Well

Approximate neighbour search avoids comparing all pairs in the fit, so larger samples are practical than in the **t-SNE** tab. Unlike that tab, a fitted model is kept, so **Embed New Data** calls `UMAP.transform(model, permutedims(X_new))` to place new rows while the training layout stays fixed. Any number of output dimensions can be set in **Embedding Dimensions**, which helps when the embedding feeds another step that will be validated afterwards.

## Where UMAP Misleads

Sizes and gaps in the layout carry the same doubts as in other neighbour embeddings, and tight clumps can be an effect of **min_dist**. Better global structure is often claimed for the method, yet [Kobak and Linderman (2021)](#ref-KL2021a) attribute much of the difference to the spectral start, and [Chari and Pachter (2023)](#ref-CP2023a) report large distortions of distances in genomic data. Transforming new points relies on the training graph, so rows unlike the training data get a position that says little about them. Clustering on the layout may produce groups that the features do not support, so check them in `X`.

## How to Check a UMAP Layout

| Next Step | What it shows | A warning sign |
|---|---|---|
| **Trustworthiness** | Share of layout neighbours that were also near in `X` | A low value at the small neighbourhood sizes the method targets |
| **Seed Stability** | Share of the 10 layout neighbours kept across seeds 2 to 4 | A low share, which means that small-scale positions are noise |
| **vs PCA** | Trustworthiness and residual variance against a linear map | No gain over PCA at the same dimension |
| **Label Overlay** | Known classes coloured on the layout | Groups that show no relation to anything known |

## References

<a id="ref-CP2023a"></a>Chari, T. and Pachter, L. (2023). The specious art of single-cell genomics. *PLOS Computational Biology* 19(8), e1011288. [doi:10.1371/journal.pcbi.1011288](https://doi.org/10.1371/journal.pcbi.1011288)

<a id="ref-KL2021a"></a>Kobak, D. and Linderman, G. C. (2021). Initialization is critical for preserving global data structure in both t-SNE and UMAP. *Nature Biotechnology* 39(2), 156–157. [doi:10.1038/s41587-020-00809-z](https://doi.org/10.1038/s41587-020-00809-z)

<a id="ref-MHM2018a"></a>McInnes, L., Healy, J. and Melville, J. (2018). UMAP: uniform manifold approximation and projection for dimension reduction. arXiv:1802.03426. [doi:10.48550/arXiv.1802.03426](https://doi.org/10.48550/arXiv.1802.03426)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [t-SNE](tsne.md)
