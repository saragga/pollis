# Diagnostics

The actions of the Generalized Pareto panel use the fit of the main code, by the estimation method chosen; with Bayesian Estimation, the fitted distribution is taken at the posterior means of the parameters. **Threshold Stability** is the exception: it refits by maximum likelihood at each threshold.

## Fit Diagnostics
**Fit Diagnostics** draws two plots, with the plotting positions (i - 0.5) / n of the sorted excesses:
- **Probability Plot**: the fitted CDF of each excess against its empirical probability; on the diagonal for a good fit.
- **Quantile Plot**: the fitted quantiles against the observed excesses. The largest points show the tail: above the line, the fitted tail is too light; below, too heavy.

## Number of Exceedances
The fit prints how many observations exceed u. Fewer than about 50 make xi unreliable; many hundreds with a 90% threshold suggest the threshold could be raised.

## Mean Excess Plot
**Mean Excess Plot** draws the mean of the excesses X - u over X > u against 100 candidate thresholds, with its 95% interval, and the threshold chosen as a dashed line. Above a valid threshold the line is straight, with slope xi / (1 - xi): rising for a heavy tail, flat for an exponential one, falling for a bounded one. Choose u where it starts to be straight; the right end is noisy, as it rests on a few excesses.

## Threshold Stability
**Threshold Stability** refits by maximum likelihood at ten evenly spaced thresholds, from the 80th percentile of the data to the level that leaves 25 exceedances, and plots xi and the modified scale sigma_u - xi u against the threshold, with their 95% intervals, the threshold chosen as a dashed line; it prints the number of exceedances at each. Above the right threshold both stay constant within their intervals; a trend as u rises means u is still too low. The intervals widen as the exceedances fall, so large jumps at high thresholds reflect too few exceedances.

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
| Mean excess plot | Straight above u | Curved above u |
| xi across thresholds | Stable | Trending |
| Exceedance times | Scattered | Clustered |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
