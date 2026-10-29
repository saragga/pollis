# Assumptions

## Parameters and Parametrisation
Every family has a valid parameter range: probabilities in [0, 1], scales positive, degrees of freedom positive. Distributions.jl checks them and raises an error otherwise. The **parametrisation** is the most common source of mistakes:
- **Normal(mu, sigma)** takes the standard deviation, not the variance.
- **Gamma(alpha, theta)** takes a shape and a **scale**; a rate beta corresponds to theta = 1/beta.
- **Exponential(theta)** takes the scale (the mean), not the rate.
- **NegativeBinomial(r, p)** counts failures before the r-th success.
- **Geometric(p)** counts failures before the first success, starting at 0.
- **MvNormal(mu, Sigma)** takes a covariance matrix, which must be symmetric positive definite.

## Support
Each distribution lives on a **support**: the non-negative integers for Poisson, (0, 1) for Beta, the positive reals for Gamma. The pdf is zero outside it, and the log density is -Inf. **Parameters and Support** shows whether the evaluation point is inside it.

## Moments May Not Exist
Some distributions have **no mean or variance**: the Cauchy has neither, Student's t with 2 or fewer degrees of freedom has no variance, and a Pareto with a small shape has no mean. Their moments are reported as NaN or Inf, and sample means of their draws never settle.

## Truncation, Mixtures and Products
- A **truncated** distribution renormalises the base distribution on the interval; its moments are not those of the base.
- A **mixture** assumes the weights are non-negative and sum to 1.
- A **product** assumes the components are **independent**; for dependence, use a multivariate family.
- A **convolution** is the distribution of the sum of two **independent** variables, available in closed form only for some pairs (Normal and Normal, Poisson and Poisson, Gamma with the same scale).

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
