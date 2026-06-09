# Bubble Chart

A **bubble chart** is a scatter plot that encodes a third variable as marker **size** and, optionally, a fourth as marker **colour** — four dimensions in one plane.

## Construction
```julia
using Plots
scatter(x, y; markersize = 8 .* sqrt.(size_var ./ maximum(size_var)),
    zcolor = colour_var, xlabel = "X", ylabel = "Y", label = "")
```

## Encoding Rules
- **Map value to area, not radius** (`radius ∝ √value`); the eye reads area, so a linear radius overstates large values.
- Keep the **size range moderate** so small bubbles stay visible and large ones don't dominate.
- Use `zcolor` with a meaningful colour bar for the fourth variable.

## Reading It
Read position (two variables) first, then check whether bubble **size grows in some direction** and whether **colours cluster**. Four channels is near the limit of what a reader can decode — resist adding more.

## See Also
- [Scatter Plot](../cviz/scatter.md) · [Heatmap](heatmap.md) · [Decision Guide](decision-guide.md)
