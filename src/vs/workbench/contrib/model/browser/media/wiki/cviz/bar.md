# Bar Chart

A **bar chart** encodes a numeric value as the height (or length) of a bar, one bar per category. It compares magnitudes across discrete groups.

## Construction
```julia
using StatsPlots
bar(categories, values; xlabel = "Category", ylabel = "Value", legend = false)
```

## Variants
- **Counts** — height = number of observations per category (a categorical frequency).
- **Aggregates** — height = mean, sum, or other summary per category.
- **Grouped / stacked** — a second categorical split, side-by-side or stacked.

## Cautions
- **Always start the value axis at zero.** A truncated axis visually exaggerates small differences.
- **Order categories meaningfully** — by value, or by a natural order — not arbitrarily.
- For showing a *distribution* rather than a single value per group, prefer a box or violin plot.

## See Also
- [Decision Guide](decision-guide.md) · [Histogram](histogram.md)
