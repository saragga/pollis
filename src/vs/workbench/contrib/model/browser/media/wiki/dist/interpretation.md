# Interpretation

## Probabilities and Densities
- A **PMF** value is a probability: P(X = k).
- A **PDF** value is a density: the probability of a small interval around x divided by its width. Only ratios of densities and integrals of them have a direct meaning.
- A **CDF** value is a probability: P(X <= x). For discrete distributions it jumps at each value of the support, and P(X < k) is cdf(d, k - 1).
- A **Quantile** is a value: quantile(d, 0.975) of a standard normal is about 1.96, the familiar critical value.

## Tail Probabilities
**Tail Probabilities** gives P(X > x), the survival function, ccdf(d, x), and the log density at x. Far in the tails, use the ccdf and log functions (logccdf, logpdf): computing 1 - cdf there loses all precision, as the cdf rounds to 1.

## Quantile Table and Central Interval
The **Quantile Table** lists selected quantiles: the median, the quartiles, the tails. The **95% Central Interval** runs from the 2.5% to the 97.5% quantile and holds the middle 95% of the probability. For a skewed distribution it is not centred on the mean, and it is not the shortest interval with 95%.

## Entropy
The **Entropy** measures how spread out, or how unpredictable, the distribution is. For discrete distributions (Shannon entropy) it is non-negative, and largest for the uniform distribution; for continuous ones (differential entropy) it can be negative and depends on the units. Among distributions with a given variance, the normal has the largest entropy.

## Log-Likelihood of Data
The **Log-Likelihood of Data** is the sum of the log densities of a data set under the distribution. Higher means the distribution explains the data better. It is meaningful only for comparisons: between parameter values, or between distributions on the same data.

## Mixtures and Convolutions
A **mixture** describes a value drawn from one of several subpopulations chosen at random; its density is the weighted sum of the component densities, and can have several peaks. A **convolution** describes the sum of two independent values; its density is smoother and more spread out than either.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
