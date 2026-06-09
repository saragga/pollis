# Parallel Coordinates

A **parallel coordinates** plot places each variable on its own vertical axis and draws every observation as a polyline crossing all axes. It reveals clusters and multivariate patterns in data with many dimensions.

## Construction
```julia
using Plots
# rows = observations, cols = variables (standardise first)
plot(1:size(Z, 2), Z'; legend = false, xlabel = "Variable", ylabel = "Standardised value")
```
Colour the lines by a group to test separation.

## Reading It
- **Bundles of parallel lines** — clusters of similar observations.
- **Crossing "X" between two adjacent axes** — negative correlation.
- **Lines staying parallel** — positive correlation.

## Practical Notes
- **Standardise** each variable first — otherwise a wide-range variable dominates the vertical scale.
- **Axis order matters**: only adjacent axes show their relationship clearly. Reorder to probe different pairings.
- For many observations, use transparency to manage overplotting.

## See Also
- [Corner Plot](corner.md) · [Decision Guide](decision-guide.md)
