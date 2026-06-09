# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Pairwise structure + marginals of several variables | **Corner plot** ([corner](corner.md)) | Standard for posteriors and moderate variable sets |
| Find clusters / patterns across many variables | **Parallel coordinates** ([parallel](parallel.md)) | Each observation is one readable line |
| Show four variables in one scatter | **Bubble chart** ([bubble](bubble.md)) | Position + size + colour |
| Visualise a matrix (e.g. correlations) | **Heatmap** ([heatmap](heatmap.md)) | Colour grid of values |

## Decision Flow
1. **Is your data a matrix of values** (correlations, a grid)? → heatmap.
2. **Do you want pairwise relationships among a few variables?** → corner plot.
3. **Do you want to spot clusters across many variables / observations?** → parallel coordinates.
4. **Do you have exactly 3–4 variables to show in a plane?** → bubble chart.

## Rules of Thumb
- **Standardise** before parallel coordinates so no axis dominates.
- **Map bubble value to area**, not radius.
- **Diverging palette, centred at zero** for correlation heatmaps.
- Beyond ~8 variables, reduce dimensions (PCA/UMAP) before plotting.
