# Violin Plot

A **violin plot** combines a box plot's summary with a mirrored kernel density estimate, so it shows the full shape of a distribution — including multiple modes that a box plot would hide.

## Construction
```julia
using StatsPlots
violin(group, value; xlabel = "Group", ylabel = "Value", legend = false)
boxplot!(group, value; fillalpha = 0.6, width = 0.2)   # optional inner box
```

## Reading It
- **Width at a given value** — local density of observations there.
- **Multiple bulges** — multimodality (a clear advantage over the box plot).
- **Overall envelope** — skew and spread.

## Cautions
- Shape depends on the **KDE bandwidth** — over-smoothing erases modes, under-smoothing invents them.
- Needs a **reasonable sample size** per group; for tiny groups prefer a box plot or the raw points.

## See Also
- [Box Plot](box.md) · [Histogram](histogram.md) · [Decision Guide](decision-guide.md)
