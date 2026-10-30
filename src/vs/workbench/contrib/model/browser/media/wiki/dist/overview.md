# Overview

The Distribution Functions panel evaluates **probability distributions** with Distributions.jl: choose a distribution and its parameters, and the panel computes one of four functions at a point. The same distribution objects are what Pollis' other panels fit, sample from and use as priors, so this is the place to see how a distribution behaves before using it.

## The Four Functions
- **Probability Mass Function** (discrete): pdf(d, k), the probability that X equals k.
- **Probability Density Function** (continuous): pdf(d, x), the density at x. A density is not a probability: it can exceed 1, and only its integral over an interval is a probability.
- **Cumulative Distribution Function**: cdf(d, x), the probability that X is at most x.
- **Quantile**: quantile(d, p), the inverse of the cdf, the value below which a share p of the probability lies.

## The Distribution Groups
- **Discrete** and **Continuous**: the standard univariate families, from Bernoulli and Poisson to Normal, Gamma, Beta, Weibull and the extreme value laws.
- **Truncated**: a base distribution restricted to an interval, renormalised to integrate to 1.
- **Multivariate**: MvNormal, Dirichlet and Multinomial, whose values are vectors.
- **Matrix-Variate**: Wishart, InverseWishart and MatrixNormal, whose values are matrices, such as covariance matrices.
- **Mixture**: a weighted combination of component distributions, for populations made of subgroups.
- **Product**: independent components put together into a vector.
- **Convolutions**: the distribution of the sum of two independent random variables.

## Common Workflow

1. Choose the group, the distribution, its parameters and the function, and look at the **Density Plot** and the **Cumulative Distribution Plot**.
2. Check the **Moments**, the **Parameters and Support** and the **Entropy**.
3. Simulate with **Random Draws**, verify with the **Monte Carlo Check**, and read **Tail Probabilities**.
4. Compare with **Refit by Maximum Likelihood**, the **Normal Approximation** and the **Q-Q Plot vs Normal**.
5. Summarise with the **Quantile Table**, the **95% Central Interval** and the **Log-Likelihood of Data**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
