# Generalized Extreme Value Distribution — Factsheet

The **generalized extreme value** (GEV) distribution is the limiting distribution of the maximum of many observations: whatever their distribution, if the normalised maximum of a block of n converges, it converges to a GEV (Fisher-Tippett-Gnedenko theorem). It has a location mu, a scale sigma and a shape xi that sets the tail. Extremes.jl fits it to block maxima and gives its return levels.

| | |
|---|---|
| **Purpose** | Model the largest value per block, a year or a month, and extrapolate to rarer events than observed |
| **Input** | A series of block maxima and an estimation method; or the parameters mu, sigma and xi to evaluate or sample |
| **Core packages** | [Extremes.jl](https://github.com/jojal5/Extremes.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Models** | Fit, Evaluate, Sample |
| **Output** | The parameter estimates with 95% intervals, return levels, probability and quantile plots, the tail type |
| **Key choice** | The block: long enough for the limit to hold, short enough to leave many maxima |

## When to Use

- **Design levels**: the 100-year flood, sea level or wind speed.
- **Financial risk**: the largest daily loss in a month or a year.
- **Reliability**: the strongest load a structure will meet.

## What It Is Not

Not a model for all the data: it uses one value per block and discards the rest. When more of the tail is available, the peaks-over-threshold approach with the Generalized Pareto distribution uses it more efficiently. Not suited to strongly trending or seasonal maxima without covariates.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
