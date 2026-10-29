# Assumptions

## The Model
- **Family.** Given the random effects, the response follows the chosen distribution: its variance is tied to its mean (p(1 - p) for Bernoulli, the mean for Poisson). When the data vary more than that, the model is **overdispersed**.
- **Link.** The linear predictor is linear in the parameters on the link scale; nonlinear relationships must be modelled with transformed predictors.
- **Exogeneity.** The random effects are uncorrelated with the predictors. Unlike the linear case, there is no simple fixed-effects alternative that removes this assumption for every family.

## The Random Effects
- **Normal on the link scale**, with mean zero, independent across groups.
- **The structure.** Each random slope adds a variance and correlations to estimate; binary data carry little information, so rich structures are often singular.

## Independence
- **Conditional independence.** Given the random effects, observations are independent. Remaining correlation (over time within a subject, say) needs another random effect or a different model.

## The Approximation
- **Laplace** is accurate when each group has many observations or the response is far from 0/1 at the extremes; with **binary data and small groups** it can bias the variance components downward. **Adaptive quadrature** (Laplace vs Adaptive Quadrature) checks it, for one scalar random effect.

## Sample Size
- **Groups.** The variance of the random effects is estimated from the groups: fewer than about 10 gives an unreliable estimate.
- **Events.** For binary outcomes the information is in the rarer outcome: as a rough rule, at least 10 events per fixed-effect parameter.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
