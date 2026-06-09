# Time Series Plot

The **time series plot** (line plot) is the foundational visualisation: a measured quantity drawn against an ordered time axis, with consecutive observations joined by line segments.

## Construction

With [Plots.jl](https://github.com/JuliaPlots/Plots.jl), the time index is the first argument and the series is the second:

```julia
using Plots

plot(time, y; label = "Series", xlabel = "Time", ylabel = "Value")
```

Connecting points with lines (rather than drawing a scatter) is what encodes the *ordering* — the defining property of a time series.

## Multi-Series Overlays

Add further series with `plot!` to compare them on shared axes:

```julia
plot(time, y1; label = "A")
plot!(time, y2; label = "B")
```

When series live on very different scales, either:

- index each to a common base (e.g. first value = 100), or
- use a secondary y-axis with `twinx()`.

## Styling

Common adjustments that improve readability:

- `lw` — line width, to emphasise the primary series.
- `linestyle` — `:dash`, `:dot` to distinguish overlaid series in monochrome.
- `legend` — position the key clear of the data (`:topleft`, `:outerright`).
- `xticks` — format date ticks so seasonality is visible.

## What to Look For

Trend, seasonality, level shifts, changing variance, and outliers — see [Diagnostics](diagnostics.md). The line plot is where each of these first reveals itself.

## See Also

- [Ribbon Plot](ribbon.md) — add an uncertainty band around the line.
- [Decision Guide](decision-guide.md) — choosing between plot types.
