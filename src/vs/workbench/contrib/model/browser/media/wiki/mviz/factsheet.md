# Multivariate Visualisation — Factsheet

**Multivariate visualisation** shows structure in data with three or more variables at once — relationships, clusters, and gradients that pairwise plots miss.

| | |
|---|---|
| **Purpose** | Reveal structure across many variables simultaneously |
| **Input** | A data matrix with several numeric columns (plus optional groups) |
| **Core packages** | [PairPlots.jl](https://github.com/sefffal/PairPlots.jl), [Plots.jl](https://github.com/JuliaPlots/Plots.jl), [Makie.jl](https://github.com/MakieOrg/Makie.jl) |
| **Plot types** | Corner plot, parallel coordinates, bubble chart, heatmap |
| **Typical use** | Exploring high-dimensional data, posterior samples, correlation structure |

## When to Use
- More than two variables and you want their **joint** structure, not just pairwise.
- Encoding **extra dimensions** through colour, size, or position.
- Surveying a **correlation matrix** or any 2-D grid of values.

## What It Is Not
A substitute for dimensionality reduction (PCA, t-SNE, UMAP). These plots display raw variables; for very high dimensions, reduce first, then visualise.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
