# Diagnostics

## Density and Cumulative Plots
The **Density Plot** shows where the probability lies: its centre, spread, skew and tails. The **Cumulative Distribution Plot**, drawn between the 0.1% and 99.9% quantiles, reads probabilities directly: the height at x is P(X <= x). Check that the shape is what you expect from the parameters; a surprising shape usually means a parametrisation mix-up.

## Moments
**Moments** gives the mean, variance, skewness and (excess) kurtosis, or the mean vector and covariance matrix for vector-valued distributions. Skewness above about 1 in absolute value means a strongly asymmetric distribution; an excess kurtosis well above 0 means heavier tails than the normal.

## Samples vs Density
**Samples vs Density** draws from the distribution and lays the histogram over the density. They should agree; disagreement points to a sampling problem or to a density that has not been normalised (a truncation or mixture set up wrongly).

## Monte Carlo Check
The **Monte Carlo Check** compares the mean of many draws with the theoretical mean, with the Monte Carlo standard error. The difference should be within two or three standard errors. When the theoretical mean does not exist, the sample mean keeps jumping; this is the distribution's nature, not a bug.

## Refit by Maximum Likelihood
**Refit by Maximum Likelihood** simulates data from the distribution and estimates its parameters back with fit_mle. The estimates should be close to the true parameters, closer as the sample grows. Large errors suggest parameters that are hard to identify from data of this size.

## Normal Approximation and Q-Q Plot
The **Normal Approximation** gives the KL divergence from the distribution to a normal with the same mean and standard deviation: near zero, the normal is a good stand-in. The **Q-Q Plot vs Normal** shows where they differ: points bending away at the ends mean heavier or lighter tails, an S-shape or a curve means skew.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Density plot | Shape as expected | Unexpected shape: check the parametrisation |
| Samples vs density | Histogram follows the curve | Systematic gaps |
| Monte Carlo check | Within 2-3 standard errors | Far off, or never settles (no mean) |
| Refit | Estimates near the truth | Large errors |
| Normal approximation | KL near zero, straight Q-Q | Curved or bent Q-Q |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
