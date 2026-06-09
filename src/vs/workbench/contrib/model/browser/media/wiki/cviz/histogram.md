# Histogram

A **histogram** divides one numeric variable into bins and draws a bar per bin whose height is the count (or density) of observations falling in it. It reveals the shape of a distribution.

## Construction
```julia
using StatsPlots
histogram(x; bins = 30, xlabel = "Value", ylabel = "Count", label = "x")
```

## Choosing Bins
Bin width is the key choice:
- **Too few bins** — over-smoothed, hides structure.
- **Too many bins** — noisy, every wobble looks real.
Try several widths; trust only features that persist. A kernel **density** overlay (`density!`) gives a smooth, bin-free alternative.

## Reading It
- **Centre** — where the mass concentrates.
- **Spread** — how wide.
- **Shape** — symmetric, skewed, or multimodal.

## See Also
- [Box Plot](box.md) · [Violin Plot](violin.md) · [Decision Guide](decision-guide.md)
