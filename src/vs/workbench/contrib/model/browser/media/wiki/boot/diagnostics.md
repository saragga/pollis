# Diagnostics

## Replicate Histogram and Shape
The **Replicate Histogram** shows the bootstrap distribution of the statistic. **Replicate Shape** compares it with a normal distribution (a Q-Q plot, skewness). Warning signs:
- **Skewness**: the normal interval is wrong; prefer BCa or studentised.
- **Few distinct values** (spikes): the sample is too small or the statistic too discrete (a median of few observations).
- **Several peaks**: a few observations decide the statistic.

## Jackknife Influence
**Jackknife Influence** recomputes the statistic leaving out one observation at a time. A single observation whose removal moves the estimate far more than the others dominates the result, and the bootstrap inherits that fragility. The jackknife values also give BCa its acceleration.

## Bias
The bootstrap **bias** is the mean of the replicates minus the estimate. Compared with the standard error: a bias below about a quarter of the standard error can be ignored; a larger one is a warning that the statistic is biased and the percentile interval off-centre. See [Bias Correction](interpretation.md).

## Monte Carlo Error
The replicates are random: running again with another seed changes the results. **Required Replicates** shows how the standard error and the interval endpoints settle as replicates are added. If the endpoints still move in the second significant digit, use more.

## Coverage
**Interval Coverage** draws many samples from a known population, computes each interval on each, and counts how often the interval contains the true value. A nominal 95% interval should cover about 95% of the time. Undercoverage, often in small samples or with skewed data, is the most common failure.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Replicate histogram | Smooth, one peak | Spikes, several peaks |
| Skewness of replicates | Close to zero | Large: avoid the normal interval |
| Jackknife influence | No observation stands out | One observation drives the estimate |
| Bias / standard error | Below about 0.25 | Above 0.25 |
| Intervals agree | All five similar | Wide disagreement |
| Coverage | Close to nominal | Well below nominal |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Confidence Intervals](confidence-intervals.md)
