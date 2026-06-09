# Ribbon Plot

A **ribbon plot** draws a shaded band around a central line. It is the standard way to present a point estimate together with its uncertainty — most often a forecast and its confidence or prediction interval.

## Construction

[Plots.jl](https://github.com/JuliaPlots/Plots.jl) supports ribbons directly through the `ribbon` keyword. A symmetric band is given by a single half-width:

```julia
using Plots

plot(time, y; ribbon = halfwidth, fillalpha = 0.2, label = "Forecast")
```

For an **asymmetric** band, pass a tuple of lower and upper half-widths:

```julia
plot(time, y; ribbon = (lower, upper), fillalpha = 0.2)
```

Here `y` is the central estimate, and the band spans `y - lower` to `y + upper`.

## Forecast Intervals

The most common use is to show a forecast with an interval:

- The **line** is the point forecast.
- The **band** is, for example, a 95% prediction interval.
- `fillalpha` controls transparency so overlapping bands and the line beneath remain readable.

Bands typically **widen with the horizon**: uncertainty grows the further ahead you forecast. A flat or shrinking band far into the future usually signals an overconfident model.

## Shaded Regions

Ribbons also mark in-sample uncertainty (e.g. ± one standard error around a fitted line) or any region of interest defined by an upper and lower bound.

## Interpretation Cautions

A ribbon **must have a defined meaning**. State whether it is a confidence interval, a prediction interval, or ± k standard deviations. A decorative band with no stated coverage misleads the reader into trusting precision that was never computed.

## See Also

- [Time Series Plot](tsplot.md) — the underlying line plot.
- [Interpretation](interpretation.md) — reading band width and coverage.
