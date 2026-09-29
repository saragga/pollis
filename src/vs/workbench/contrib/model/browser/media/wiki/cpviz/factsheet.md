# Categorical and Proportional Plots — Factsheet

These plots show **composition, flow, and magnitude across categories** rather than the shape of a numeric distribution. They answer "what are the parts of the whole, and how do they relate or move?"

| | |
|---|---|
| **Purpose** | Display part-to-whole structure, categorical association, running totals, and flows |
| **Input** | Categorical labels with counts/values, contingency tables, or flow networks |
| **Core packages** | [Plots.jl](https://github.com/JuliaPlots/Plots.jl), [StatsPlots.jl](https://github.com/JuliaPlots/StatsPlots.jl), [Makie.jl](https://github.com/MakieOrg/Makie.jl), [SankeyMakie.jl](https://github.com/MakieOrg/SankeyMakie.jl) |
| **Plot types** | Mosaic, Nightingale rose, Waterfall, Treemap, Sankey |
| **Typical use** | Reporting composition, budgets, cohort flows, categorical association |

## When to Use
- Showing how a total **breaks into parts** (treemap, mosaic).
- Tracing a **running total** of additions and subtractions (waterfall).
- Tracing **quantities flowing** between stages (sankey).
- Comparing magnitudes around a **cycle** (nightingale rose).

## What It Is Not
These are not for raw numeric distributions or two-variable relationships — use the Core Statistical Plots (scatter, histogram, box, violin) for that.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
