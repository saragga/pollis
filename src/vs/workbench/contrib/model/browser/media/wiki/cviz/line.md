# Line Plot

A **line plot** connects points in order with straight segments, so it reads as a continuous path rather than a cloud. In the statistical setting its most common job is to draw a **fitted line** — a regression fit, a trend, or a model prediction — over the raw observations.

## Construction
```julia
using StatsPlots, Statistics, Random
Random.seed!(42)
x = sort(randn(80))
y = 2 .* x .+ 1 .+ randn(80)      # linear signal plus noise

b1 = cov(x, y) / var(x)           # OLS slope
b0 = mean(y) - b1 * mean(x)       # OLS intercept

scatter(x, y; label = "Observations", alpha = 0.5)
plot!(x, b0 .+ b1 .* x; label = "Fitted line", lw = 2)
```

## Reading It
- **Slope** is the rate of change of `y` with `x`; **intercept** is `y` at `x = 0`.
- Overlay the line on a **scatter** of the data to judge fit — points should scatter evenly above and below.
- **Systematic gaps** (the points curve away from the line) signal that a straight fit is too simple.

## Cautions
- A line implies **order and continuity** — only connect points along a meaningful axis (sorted `x`, or time); never connect an unordered scatter.
- **Sort by `x`** before plotting, or the line zig-zags back on itself.
- A fitted line is only as good as its **model**; check residuals before trusting it (see [Diagnostics](diagnostics.md)).

## See Also
- [Scatter Plot](scatter.md) · [Decision Guide](decision-guide.md)
