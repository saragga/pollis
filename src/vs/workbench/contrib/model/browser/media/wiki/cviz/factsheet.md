# Core Statistical Plots — Factsheet

**Core statistical plots** are the workhorse visualisations of exploratory data analysis: scatter, bar, histogram, box, and violin. They summarise a sample's shape, spread, and relationships before any model is fitted.

| | |
|---|---|
| **Purpose** | Inspect distributions and relationships in a dataset |
| **Input** | One or more numeric (or categorical) columns |
| **Core packages** | [StatsPlots.jl](https://github.com/JuliaPlots/StatsPlots.jl), [Makie.jl](https://github.com/MakieOrg/Makie.jl), [Plots.jl](https://github.com/JuliaPlots/Plots.jl) |
| **Plot types** | Scatter, bar, histogram, box, violin |
| **Typical use** | First-pass EDA, group comparison, distribution checks |

## When to Use

- Looking at a variable's **distribution** (histogram, box, violin).
- Comparing a numeric variable **across groups** (box, violin, bar).
- Examining the **relationship** between two variables (scatter).

## What It Is Not

These are descriptive plots. They do not test hypotheses or estimate models. For formal distribution comparison use the Distribution Comparison webview; for multivariate structure use Multivariate Visualisation.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
