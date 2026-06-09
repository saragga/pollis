# Mosaic Plot

A **mosaic plot** visualises a two-way contingency table by tiling a unit square so that each cell's **area** is proportional to its frequency. It exposes the association between two categorical variables.

## Construction
There is no single built-in mosaic recipe in Plots.jl; build it from the contingency table with `Shape` rectangles:

```julia
using Plots
counts = [40 25; 18 30; 12 20]          # rows = X levels, cols = Y levels
coltot = sum(counts; dims = 1)
xedges = [0; cumsum(vec(coltot ./ sum(coltot)))]   # column widths
# draw one rectangle per cell, splitting each column by its row proportions
```

Column **width** encodes the first variable's marginal; the **stacked split** within a column encodes the conditional distribution of the second variable.

## Reading It
- Columns of differing width → uneven marginal of the first variable.
- Row splits that change across columns → the variables are **associated**.
- Identical splits → independence.

## Pair With
A **chi-squared test** (Diagnose → Chi-Squared Test) confirms whether an apparent association is statistically significant.

## See Also
- [Decision Guide](decision-guide.md) · [Treemap](treemap.md)
