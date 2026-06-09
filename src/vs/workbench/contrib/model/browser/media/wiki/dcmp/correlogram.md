# Correlogram

A **correlogram** (scatter-plot matrix, or "corner"/"pairs" plot) arranges pairwise scatter plots of every variable combination in a grid, with each variable's marginal density on the diagonal. It surveys the structure of a multivariate dataset at a glance.

## Construction
```julia
using StatsPlots
@df df cornerplot([:a :b :c])     # StatsPlots corner plot
# or a pairwise grid:
corrplot(Matrix(df); label = names(df))
```

## What to Look For
- **Off-diagonal panels** — pairwise relationships; tilted clouds mean correlation, curves mean nonlinearity.
- **Diagonal** — each variable's marginal distribution (skew, modality).
- **Symmetry** — the matrix is mirror-symmetric, so each pair appears twice (sometimes one half shows the correlation coefficient instead).

## Strengths and Limits
- Fast **overview** of many variables and their pairwise structure.
- Becomes cramped beyond ~6–8 variables; use it to *find* interesting pairs, then drill in with a dedicated [scatter](../cviz/scatter.md) or [marginal plot](marginal.md).

## See Also
- [Marginal Plot](marginal.md) · [Decision Guide](decision-guide.md)
