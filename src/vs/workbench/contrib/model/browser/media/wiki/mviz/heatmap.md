# Heatmap

A **heatmap** renders a 2-D matrix of values as a grid of coloured cells. It is the natural display for correlation matrices, confusion matrices, and any dense array of numbers.

## Construction
```julia
using Plots
heatmap(M; xlabel = "Column", ylabel = "Row", color = :viridis, colorbar_title = "Value")
```

## Choosing a Colour Scale
- **Diverging** (e.g. `:RdBu`), centred at zero, for **signed** data such as correlations — colour direction then encodes sign.
- **Sequential** (e.g. `:viridis`) for **non-negative** magnitudes.
A mismatched scale hides the midpoint and misleads about sign.

## Correlation Heatmaps
The diagonal is all ones (self-correlation) and carries no information — read the **off-diagonal** blocks. Clusters of similarly coloured cells reveal groups of correlated variables.

## Practical Notes
- Order rows/columns (e.g. by clustering) so structure forms visible blocks.
- Always show the **colour bar**; without it colour is meaningless.

## See Also
- [Corner Plot](corner.md) · [Decision Guide](decision-guide.md)
