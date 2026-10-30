# Overview

The Generalized Linear Mixed-Effects Models panel fits **generalized linear mixed-effects models** (GLMMs): generalized linear models for binary, count or positive responses, with random effects for grouped data. The linear predictor combines fixed effects, shared by all observations, with random intercepts and slopes for each group; a link function maps it to the mean of the response, and a family gives its distribution. Models are fitted by maximum likelihood with MixedModels.jl.

## Families and Links
The **Family** sets the distribution of the response: Bernoulli for 0/1 outcomes, Binomial for proportions with a known number of trials, Poisson and NegativeBinomial for counts, Gamma and InverseGaussian for positive skewed values, and Normal. The **Link** defaults to each family's canonical link (logit, log, inverse); probit, complementary log-log, identity, square root and the others are available when theory calls for them.

## Random Effects
The **Random Effects** input takes MixedModels terms: a random intercept `(1|group)`, a random slope `(1+x|group)`, crossed factors `(1|g1) + (1|g2)` and nested ones `(1|g1/g2)`. The random effects are normal on the scale of the linear predictor.

## Estimation
The likelihood of a GLMM integrates over the random effects and has no closed form. MixedModels approximates it by the **Laplace approximation**, by default, or by **adaptive Gauss-Hermite quadrature**, which is more accurate but only available for a single scalar random effect.

## Common Workflow

1. Fit the model, and look at the **Random Effects Caterpillar** and the **Calibration Plot**.
2. Check the fit with the **Simulated Residuals**, the **Overdispersion Check**, the **Singular Fit Check** and the **Random-Effects Q-Q Plot**.
3. Compare **Conditional vs Population Predictions**, and measure the **Predictive Accuracy**.
4. Test the grouping **Against a GLM Without Random Effects**, and check the approximation with **Laplace vs Adaptive Quadrature**.
5. Read the **Exponentiated Coefficients** and the **Latent-Scale ICC**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
