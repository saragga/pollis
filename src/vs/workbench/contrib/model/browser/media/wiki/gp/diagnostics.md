# Diagnostics

The diagnostic actions refit the excesses by maximum likelihood, whatever the estimation method chosen.

## Fit Diagnostics
**Fit Diagnostics** draws the Extremes.jl probability and quantile plots of the fit:
- **Probability Plot**: the fitted CDF of each excess against its empirical probability; on the diagonal for a good fit.
- **Quantile Plot**: the fitted quantiles against the observed excesses. The largest points show the tail: above the line, the fitted tail is too light; below, too heavy.

## Number of Exceedances
The fit prints how many observations exceed u. Fewer than about 50 make xi unreliable; many hundreds with a 90% threshold suggest the threshold could be raised.

## Threshold Sensitivity
Refit with the threshold at the 85th, 90th, 95th and 97.5th percentiles. xi should be stable, within its uncertainty, above the right threshold; a trend in xi as u rises means u is still too low. Large jumps at high thresholds reflect too few exceedances.

## Tail Probability
**Tail Probability** gives the probability that an exceedance is larger than the largest seen, and the unconditional probability of exceeding u plus that excess, as once in so many observations. It checks the fit against experience: a value far from 1 / n for the record is suspicious.

## Clustering
Plot the exceedances against time. Bunches of consecutive exceedances violate independence and call for declustering.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Probability plot | On the diagonal | S-shape |
| Quantile plot | Top points on the line | Systematic bend |
| Exceedances | 50 or more | Under 50 |
| xi across thresholds | Stable | Trending |
| Exceedance times | Scattered | Clustered |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
