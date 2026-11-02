# Generalized Pareto Distribution — Factsheet

The **generalized Pareto** (GP) distribution is the limiting distribution of the excesses over a high threshold: for almost any distribution, the amounts by which observations exceed a threshold u, given that they do, approach a GP as u rises (Pickands-Balkema-de Haan theorem). It has a scale sigma and a shape xi with the same meaning as in the GEV. Fitted to the excesses, it is the **peaks-over-threshold** (POT) method.

| | |
|---|---|
| **Purpose** | Model the tail of a distribution from all its large values, and estimate rare quantiles and tail probabilities |
| **Input** | The full data series, a threshold u and an estimation method; or the threshold, scale and shape to evaluate or sample |
| **Core packages** | [Extremes.jl](https://github.com/jojal5/Extremes.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Models** | Fit, Evaluate, Sample |
| **Output** | The scale and shape of the excesses, the number of exceedances, probability and quantile plots, tail probabilities |
| **Key choice** | The threshold: high enough for the limit, low enough to keep enough exceedances |

## When to Use

- **Value at risk and expected shortfall** of losses.
- **Insurance**: large claims above a retention.
- **Hydrology and climate**: every flood above a level, not only the annual largest.

## What It Is Not

Not a model of the whole distribution: it describes only the excesses above u, and how often u is exceeded comes from the data. Not for dependent exceedances without declustering: clusters of storms or volatile days give many correlated excesses.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
