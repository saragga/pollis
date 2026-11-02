# Factsheet

The Neighbour Embedding panel draws each observation as a point in two or more dimensions so that near neighbours in the features stay near in the plot, using TSne.jl and UMAP.jl. The two tabs differ in how they define neighbours, start and optimise, and in how they treat new data.

## What the Neighbour Embedding Panel Does

| Item | Description |
|---|---|
| **Purpose** | A nonlinear map of local neighbourhoods, for visual exploration |
| **Julia stack** | TSne.jl and UMAP.jl for the embeddings; Distances.jl for the checks; Plots.jl for the Next Steps |
| **Models** | **t-SNE** and **UMAP** tabs |
| **Input shape** | **Feature Matrix** is n × p, one row per observation, and the tabs apply no per-feature scaling |
| **Output** | Embedding `Y` (n × d) and the value of `trustworthiness(Y)` with 10 neighbours |
| **Key choice** | The neighbourhood size, set by **Perplexity** or **n_neighbors** |

## How the t-SNE and UMAP Tabs Differ in the Code

| Property | **t-SNE** | **UMAP** |
|---|---|---|
| Call | `tsne(X, d, 0, maxiter, perplexity; eta=eta)` | `UMAP.fit(Xt, d; n_neighbors=nn, min_dist=mindist)` |
| Neighbour search | All pairs, exact | Approximate, by nearest neighbour descent |
| Starting layout | Random | Spectral, from the neighbour graph |
| Grid in **Perplexity / n_neighbors Sweep** | 5, 15, 30, 50 | 5, 10, 15, 30, 50 |
| **Embed New Data** | Weights from the 10 nearest training points | `UMAP.transform` on the fitted model |

## Which Inputs the Neighbour Embedding Tabs Use

**Feature Matrix** and **Embedding Dimensions** (d, default 2) apply to both tabs. **Perplexity** (default 30), **max_iter** (default 1000) and **Learning Rate** (default 200.0) apply to **t-SNE** alone. **n_neighbors** (default 15) and **min_dist** (default 0.1) apply to **UMAP** alone. Features on different scales should be standardised before entering **Feature Matrix**, since neither tab does so per feature. Next Steps that plot two coordinates need **Embedding Dimensions** of at least 2.

## See Also

- [Overview](overview.md) · [t-SNE](tsne.md) · [UMAP](umap.md)
