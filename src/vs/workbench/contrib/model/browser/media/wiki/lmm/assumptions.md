# Assumptions

## For the Fixed Effects
- **Linearity.** The conditional mean is linear in the parameters, as in linear regression.
- **Exogeneity.** The errors and the random effects have mean zero given the predictors. For the mixed model this includes the **random effects being uncorrelated with the predictors**; the fixed-effects models drop this requirement for the entity effects, which is their main advantage.
- **No perfect collinearity.** In the fixed-effects models, a predictor that does not change within entities (sex, a firm's country) is absorbed by the entity effects and cannot be estimated.

## For the Random Effects
- **Normality.** The random effects are normally distributed with mean zero. Moderate departures change little in the fixed-effect estimates, but affect the predicted group effects and the variance components.
- **Independence across groups.** Groups are independent of each other; observations are correlated only within a group, through the random effects.
- **The covariance structure.** A random slope with an intercept, `(1+x|group)`, estimates their variances and correlation; `(1|group) + (0+x|group)` assumes they are uncorrelated. Too rich a structure for the data gives a singular fit.

## For the Errors
- **Independent, constant variance, normal** residuals within groups, given the random effects. In the fixed-effects models the **Inference** input relaxes this: robust, clustered by group, or two-way clustered by group and time.

## Sample Size
- **Number of groups.** The between-group variance is estimated from the groups, not the observations: with fewer than about 5 to 10 groups it is poorly determined, and fixed effects are usually better.
- **Observations per group.** Many small groups are fine for a random intercept; a random slope needs enough within-group spread in its predictor.
- **Clustered standard errors** need enough clusters, roughly 30 to 50 or more.

## For IV / 2SLS
- **Relevance.** The instruments predict the endogenous regressor, after the fixed effects (a first-stage F well above 10).
- **Exclusion.** The instruments affect the response only through the endogenous regressor.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
