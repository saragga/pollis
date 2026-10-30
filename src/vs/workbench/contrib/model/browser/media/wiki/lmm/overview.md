# Overview

The Linear Mixed-Effects Models panel fits models for **grouped data**: repeated observations of the same firms, people, schools or regions, whose observations within a group are more alike than observations from different groups. The panel offers two ways of handling the groups. **Mixed-effects models** treat the group effects as random draws from a distribution and estimate its variance, through MixedModels.jl. **Fixed-effects models** give each group (and, in the two-way model, each period) its own intercept and absorb it, through FixedEffectModels.jl, which also fits instrumental variables with fixed effects.

## Mixed-Effects
A **linear mixed-effects model** adds random effects to the linear predictor: a random intercept per group, `(1|group)`, random slopes, `(1+x|group)`, and crossed or nested grouping factors. The fixed effects are the population-level coefficients; the random effects are the deviations of each group, shrunk toward zero. The model estimates the variance components, and so how much of the variation lies between groups.

## Panel Fixed-Effects
Each entity gets its own intercept, `fe(id)`, which removes everything about the entity that does not change over time, observed or not. The coefficients come only from variation **within** entities.

## Two-Way Fixed-Effects
Entity and time fixed effects together, `fe(id) + fe(t)`: removes what is constant for each entity and what is common to all entities in each period.

## IV / 2SLS
Two-stage least squares with entity fixed effects absorbed, for a regressor correlated with the error: `(x_end ~ z_iv)` instruments the endogenous regressor with variables that move it but do not affect the response directly.

## Common Workflow

1. Fit the model, and look at **Residuals vs Fitted** and the **Group Effects**.
2. Run the **Model Health Checks** (a singular fit, convergence of the demeaning, weak instruments), then **Residual Normality** and the **Random-Effects Q-Q Plot**.
3. Check prediction with **Observed vs Fitted** and the **Hold-Out Prediction Error**.
4. Test the grouping **Against Pooled OLS**, and choose between **Random vs Fixed Group Effects** with the Hausman test.
5. Read the **Variance Decomposition** and the **Coefficient Plot**; the **Parametric Bootstrap** gives intervals for the variance components as well.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
