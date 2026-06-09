# Pie Chart

A **pie chart** shows how a small number of **categories** make up a whole, each slice's angle proportional to its share. It is best for a quick part-to-whole read with few slices; for precise comparison a [bar chart](bar.md) is usually clearer.

## Construction
With [CairoMakie](https://github.com/MakieOrg/Makie.jl) (an `inner_radius` turns it into a donut):

```julia
using CairoMakie
data   = [36, 12, 68, 5, 42, 27]
colors = [:yellow, :orange, :red, :blue, :purple, :green]

f, ax, plt = pie(data; color = colors, radius = 4, inner_radius = 2,
                 strokecolor = :white, strokewidth = 5,
                 axis = (autolimitaspect = 1,))
Legend(f[1, 2], ax)
f
```

## Reading It
- **Slice angle = share** of the total; the full circle is the whole.
- **Inner radius > 0** turns the pie into a donut, which many find easier to compare.
- Order slices by size (or a meaningful sequence) so the eye can follow them.

## Cautions
- People judge **angle and area poorly** — keep to a handful of slices and avoid 3D or exploded effects.
- For more than ~6 categories, or for precise values, prefer a [bar chart](bar.md).
- Every slice must be a **part of one whole** (non-negative, summing to the total).

## See Also
- [Bar Chart](bar.md) · [Histogram](histogram.md) · [Decision Guide](decision-guide.md)
