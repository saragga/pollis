# Scatter Plot

A **scatter plot** draws one point per observation using two numeric variables as coordinates. It is the primary tool for examining the relationship between two quantities.

## Construction
```julia
using Plots
scatter(x, y; xlabel = "X", ylabel = "Y", label = "Observations")
```

## What to Read
- **Direction** — upward (positive), downward (negative), or none.
- **Form** — linear, curved, or clustered.
- **Strength** — tight band (strong) vs diffuse cloud (weak).
- **Outliers** — points far from the main mass.

## Enhancements
- **Colour / marker** by a third categorical variable to reveal group structure.
- **Marker size** to encode a fourth (numeric) variable — though a [Bubble Chart](../mviz/bubble.md) is purpose-built for that.
- **Transparency** (`alpha`) or **2-D density** for overplotting when points overlap heavily.

## See Also
- [Decision Guide](decision-guide.md) · [Overview](overview.md)
