# Corner Plot

A **corner plot** (a triangular scatter-plot matrix) shows every pairwise relationship among several variables as 2-D density/scatter panels, with each variable's 1-D marginal along the diagonal. It is the standard way to display **MCMC posterior samples**.

## Construction
```julia
using PairPlots, CairoMakie
pairplot(table)            # table = NamedTuple or matrix of columns
```
StatsPlots offers `cornerplot(M)` as an alternative.

## What It Shows
- **Diagonal** — marginal posterior (or sample) of each variable.
- **Lower triangle** — pairwise joint densities.
- **Tilted/curved panels** — parameter correlation or nonlinear dependence.

## Reading Posteriors
A tight diagonal peak means a well-constrained parameter. A strongly tilted panel means two parameters trade off — the data constrains their combination but not each alone. Banana shapes warn of weak identifiability.

## See Also
- [Parallel Coordinates](parallel.md) · [Heatmap](heatmap.md) · [Decision Guide](decision-guide.md)
