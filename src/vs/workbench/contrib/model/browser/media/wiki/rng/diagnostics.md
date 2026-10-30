# Diagnostics

## Draws Against the Target Density
**Draws Against the Target Density** draws 100,000 values, uniform, normal or exponential according to the **Operation**, and overlays the target density on their histogram. The histogram should follow the curve, with random variation of about 1% per bin at this size.

## Successive Pairs
**Successive Pairs** plots 5000 uniform draws as points (u_i, u_i+1). A good generator fills the unit square evenly, without stripes or lattice: the lattice structure in successive tuples was the classic failure of linear congruential generators (Marsaglia, 1968).

## Uniformity and Independence Tests
**Uniformity and Independence Tests** draws 100,000 uniforms and reports four p-values:
- **Kolmogorov-Smirnov** against Uniform(0, 1): the distribution.
- **Chi-square** on 20 equal bins: the frequencies.
- **Wald-Wolfowitz runs**: runs above and below the median, for independence.
- **Ljung-Box** at 10 lags: autocorrelation.
Under a good generator each p-value is uniform on (0, 1): a value below 0.05 will appear about once in twenty runs by chance. Only a p-value that stays small across seeds signals a problem.

## Reproducibility Check
**Reproducibility Check** draws 5 values twice from the same seed and compares them. Every seeded generator gives identical = true; RandomDevice gives false, as it should.

## Monte Carlo Convergence
**Monte Carlo Convergence** plots the running estimate of pi from 100,000 points in the unit square, with the 95% band pi +/- 1.96 x 4 sqrt(p (1 - p) / n), on a log scale. The estimate should stay inside the band about 95% of the time and narrow like 1 / sqrt(n).

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Histogram | Follows the density | Systematic deviations |
| Successive pairs | Even fill | Stripes or lattice |
| Test p-values | Spread over (0, 1) | Small for every seed |
| Reproducibility | Identical with a seed | Different with a seed |
| Convergence | Inside the band | Outside persistently |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
