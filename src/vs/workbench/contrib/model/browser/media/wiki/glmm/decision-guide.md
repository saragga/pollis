# Decision Guide

| Response | Family | Link |
|---|---|---|
| 0/1 outcome | **Bernoulli** | Logit (odds ratios), probit, cloglog for rare events or discrete-time hazards |
| Successes out of a known number of trials | **Binomial** | Logit |
| Counts, variance about equal to the mean | **Poisson** | Log (rate ratios) |
| Counts, variance larger than the mean | **NegativeBinomial** | Log |
| Positive, skewed, constant coefficient of variation | **Gamma** | Inverse (canonical) or log |
| Positive, heavier right tail | **InverseGaussian** | Canonical or log |
| Continuous, normal errors | **Normal** | Identity: a linear mixed model |

## Decision Flow

1. **Choose the family** from the type of response, as in a GLM.
2. **Start with a random intercept** for each grouping factor; add random slopes only where theory and the data support them.
3. **Counts?** Run the Overdispersion Check; if the ratio is well above 1, switch to NegativeBinomial or add an observation-level random effect.
4. **Binary data with small groups?** Compare Laplace with adaptive quadrature.
5. **Singular fit?** Simplify the random effects until it disappears.
6. **Need population-averaged effects** (for policy, across all groups)? A GLM with cluster-robust standard errors answers that question; the GLMM answers the within-group one.

## Rules of Thumb
- **Log link for counts and positive values** when you want multiplicative effects; it keeps the mean positive.
- **Do not compare AIC across families** fitted to differently transformed responses.
- **Report the variance components** with the fixed effects: they say how much the groups matter.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
