# Assumptions

## All Families
- **Independent observations.** With clusters (patients in hospitals, firms in industries), use the **Clustered** inference or a mixed model; with time ordering, **HAC**.
- **The right link.** The linear predictor is linear in the covariates on the link scale: log odds for the logit, log mean for the log link. Curvature needs transformed covariates or splines.
- **The right variance function.** Each family fixes how the variance grows with the mean: constant (Normal), mean (Poisson), mean squared (Gamma), mean cubed (Inverse Gaussian). The coefficients stay consistent if only the variance is wrong, but the standard errors do not: use robust inference.
- **No perfect separation** (binary families): if a covariate predicts the outcome exactly, the estimates run to infinity.

## Bernoulli and Binomial
The probability of success depends only on the covariates; for the Binomial, the trials within an observation are independent with the same probability. Correlated trials make the counts overdispersed.

## Poisson
The **variance equals the mean**. Counts usually vary more than that (overdispersion), which makes the Poisson standard errors too small. Events occur independently at a rate that depends on the covariates; an exposure (time at risk, population) enters as an offset of log exposure.

## Negative Binomial and Geometric
The variance is mean + mean^2 / theta, so it grows faster than the mean. The Geometric fixes theta = 1; the Negative Binomial estimates it.

## Gamma and Inverse Gaussian
A **strictly positive** response, with a constant coefficient of variation (Gamma) or a variance growing with the cube of the mean (Inverse Gaussian). Zeros are not allowed.

## Normal
Constant variance and normal errors, as in linear regression.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
