# Interpretation

## Parameters and Their Names
**Parameters and Their Names** gives each distribution's parameters by their field names in Distributions.jl: Normal (mu, sigma), Gamma (alpha, theta) for shape and scale, LogNormal (mu, sigma) of log X, Beta (alpha, beta). With the default mean 5 and variance 2, the Gamma has shape 12.5 and scale 0.4: shape = mean^2 / var, scale = var / mean.

## Tail and Interval Probabilities
**Tail and Interval Probabilities** gives, for each family, the probability within one, two and three spreads of the centre, and above three. The centre and spread are the mean and standard deviation, or the median and the IQR / 1.349 when the variance is infinite. A Normal gives 68%, 95% and 99.7%; a heavier-tailed family puts more beyond three spreads, which is often what matters for risk.

## Shape Across Matching Families
**Shape Across Matching Families** lists the skewness, excess kurtosis, mode and support of every family meeting the targets. Families with the same mean and variance can range from symmetric to strongly skewed: the targets alone leave the shape open.

## Tail Weight Across Families
**Tail Weight Across Families** gives the 95%, 99% and 99.9% quantiles of each feasible family and plots their upper tails on a log scale. The 99.9% quantile can differ by a factor of two or more between families with identical mean and variance: if the conclusion depends on the tail, the choice of family is the main assumption.

## Plain-Language Statement
**Plain-Language Statement** writes, for each family, the interval holding the central 90% of values and the chance of exceeding the first family's 95% quantile, in a sentence. It is a check that the distribution says what was intended, and a way to report it.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
