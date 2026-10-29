# Interpretation

## Summary
The **Summary** gives the support, the centre (mean and median) and the spread (standard deviation, interquartile range) of the distribution. Mean far from median means skew.

## Quantiles
**Quantiles** compares the exact quantiles of d with those of the sample (for multivariate distributions, the sample quantiles of each component; for matrix-variate ones, the 5%, 50% and 95% of each entry). Central quantiles are estimated well from modest samples; extreme ones (1%, 99%) need many draws, because few draws fall beyond them.

## Event Probabilities
**Event Probabilities** compares the exact CDF at three points with the share of draws below them: the Monte Carlo estimate of a probability. Its standard error is sqrt(p (1 - p) / n), largest at p = 0.5 in absolute terms, but largest relative to p for rare events.

## Tails and Dependence
For univariate distributions, the **right-tail ratio** (q99 - q50) / (q75 - q50) compares the far tail with the body: 3.45 for the normal, more for heavier right tails, less for lighter ones. For multivariate and matrix-variate distributions, the correlations between components, estimated from the sample: they show the dependence the distribution builds in (MvNormal through its covariance, the negative correlations of the Dirichlet).

## Samplers Compared
**Samplers Compared** times 100,000 draws three ways:
- **rand(rng, d, n)**, the standard call;
- **rand(rng, sampler(d), n)**, with a sampler precomputed once, faster when the set-up is costly (Categorical, Binomial with large n) and many draws come from the same distribution;
- for univariate distributions, **inverse transform**, quantile(d, U) for uniform U: always valid, but usually slower, since each draw evaluates the quantile function.

## The Monte Carlo Error
Every number read from a sample carries a Monte Carlo error that shrinks as 1/sqrt(n). Report sample-based results with that precision in mind, and change the seed to see how much they move.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
