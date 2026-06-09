# Stacked Area

A **stacked area chart** plots several non-negative series stacked on top of one another, so each band is one component and the upper edge is their **running total**. It shows both the whole and how each part contributes to it over time.

## Construction
With [StatsPlots.jl](https://github.com/JuliaPlots/StatsPlots.jl) (`areaplot` stacks the columns of a matrix):

```julia
using StatsPlots, Random
Random.seed!(42)
n = 40
t = 1:n
Y = ones(n, 3) .+ cumsum(rand(n, 3) .* 0.6; dims = 1)   # three non-negative components

areaplot(t, Y; fillalpha = 0.6, lw = 1,
         xlabel = "Time", ylabel = "Value",
         label = ["A" "B" "C"], title = "Stacked Area")
```

## Reading It
- **Band thickness** at each time is that component's value; the **top edge** is the total.
- Trends in the total and in each share are visible at once.
- Order the bands sensibly (largest or most stable at the bottom) so the baseline is steady.

## Cautions
- Only valid for **non-negative** components that meaningfully sum to a whole.
- Only the **bottom** band has a flat baseline — upper bands are harder to read precisely; for exact per-series comparison use overlaid lines instead.
- Too many bands become unreadable; keep to a handful, or switch to a **proportional** (100%) stack if shares matter more than levels.

## See Also
- [Ribbon Plot](ribbon.md) · [Time Series Plot](tsplot.md) · [Decision Guide](decision-guide.md)
