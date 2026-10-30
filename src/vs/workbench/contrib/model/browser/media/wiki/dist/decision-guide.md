# Decision Guide

## Which Family

| Kind of value | Families |
|---|---|
| Yes or no | Bernoulli |
| Successes in n trials | Binomial; Hypergeometric when drawing without replacement |
| Counts of events | Poisson; NegativeBinomial when the variance exceeds the mean |
| Waiting for the first success | Geometric |
| One of k categories | Categorical; Multinomial for counts over categories |
| Any real number, symmetric | Normal; TDist, Laplace, Logistic or Cauchy for heavier tails |
| Any real number, skewed | SkewNormal |
| Positive amounts | Gamma, LogNormal, Weibull, InverseGaussian, Exponential |
| Proportions in (0, 1) | Beta; Dirichlet for proportions that sum to 1 |
| Heavy right tails, extremes | Pareto, GeneralizedPareto, GeneralizedExtremeValue, Gumbel, Levy |
| A bounded range | Uniform, Triangular, Beta (rescaled), or a truncated distribution |
| Correlated real vectors | MvNormal |
| Covariance matrices | Wishart, InverseWishart |
| Subpopulations | Mixture |

## Which Function

| Question | Function |
|---|---|
| How likely is exactly k? | PMF |
| How dense is the probability at x? | PDF |
| How likely is at most x? | CDF |
| Below which value lies a share p? | Quantile |
| How likely is more than x? | Tail Probabilities (ccdf) |

## Decision Flow

1. **What values can the quantity take?** That narrows the families.
2. **How heavy are the tails?** Compare the Normal Approximation and the Q-Q plot.
3. **Is it bounded?** Choose a family with that support, or truncate one.
4. **Several subgroups?** A mixture. **Dependent components?** A multivariate family, not a product.

## Rules of Thumb
- **Check the parametrisation** in the docstring before trusting a result.
- **Use log and ccdf functions in the tails.**
- **Look at the plot** before reading a number.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
