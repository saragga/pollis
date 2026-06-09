# QQ Plot

A **quantile–quantile (QQ) plot** graphs the quantiles of a sample against the quantiles of a reference distribution (or a second sample). If the two share a distribution up to location and scale, the points fall on a straight line.

## Construction
```julia
using StatsPlots, Distributions
qqplot(Normal, x; xlabel = "Theoretical quantiles", ylabel = "Sample quantiles")
qqnorm(x)            # shortcut for the Normal reference
```

## Reading the Signatures
- **Straight 45°-ish line** — distributions match.
- **S-shape** — sample tails are heavier (ends above/below) or lighter than the reference.
- **Convex / concave curve** — right / left skew.
- **Stray endpoints** — tail outliers.

## Two-Sample QQ
Passing two samples compares them directly — useful for asking whether two groups share a distribution, not just a mean.

## Cautions
- **Standardise** or fit parameters so the comparison is about *shape*, not units.
- Tails are inherently noisy; don't over-read a few wandering endpoints in a small sample.

## See Also
- [ECDF](ecdf.md) · [Decision Guide](decision-guide.md)
