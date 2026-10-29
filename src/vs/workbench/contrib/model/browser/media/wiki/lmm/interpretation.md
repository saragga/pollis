# Interpretation

## Fixed Effects
In the mixed model the fixed-effect coefficients are **population-level** effects: the change in the mean response for a one-unit change in a predictor, for a typical group (one whose random effects are zero). For a linear model this is also the average effect across groups. In the fixed-effects models a coefficient is a **within** effect: how the response changes when the predictor changes over time for the same entity, every time-invariant characteristic held fixed.

## Variance Components
The mixed model reports the standard deviation of each random effect and of the residual. A random-intercept standard deviation of 2 means group intercepts typically lie within about plus or minus 4 of the population intercept; a random-slope standard deviation says how much the effect of its predictor differs across groups.

## Variance Decomposition
For the mixed model, the **Variance Decomposition** gives the **intraclass correlation**: the between-group variance over the total, which is the share of the variation due to groups and also the correlation between two observations of the same group. Near zero, the grouping hardly matters; near one, observations within a group are almost the same. For the fixed-effects models it compares the overall R-squared, which credits the fixed effects, with the **within R-squared**, the share of the within-entity variation the predictors explain.

## Random Effects
The predicted random effects (BLUPs, conditional modes) are each group's deviation from the population, **shrunk toward zero**: the fewer observations a group has and the noisier they are, the more it is shrunk. They are predictions, not estimates of fixed parameters, and their intervals are approximate.

## Against Pooled OLS
**Against Pooled OLS** tests whether the grouping is needed. For the mixed model it is a likelihood ratio test of the random-intercept variance against zero; since the variance cannot be negative, the p-value is conservative (halving it is the usual correction). For the fixed-effects models it shows the pooled and the within estimates side by side: a large difference means the entity effects are correlated with the predictors.

## Random vs Fixed Group Effects
**Random vs Fixed Group Effects** runs a Hausman test. A small p-value means the random-effects and fixed-effects estimates differ by more than chance, so the random effects are correlated with the predictors and the fixed-effects estimates should be used. A large p-value allows the more efficient random-effects model.

## Coefficient Plot and Parametric Bootstrap
The **Coefficient Plot** shows each estimate with its 95% interval; an interval crossing zero is not significant at 5%. The **Parametric Bootstrap** simulates from the fitted model and refits it many times, giving intervals for the variance components too, which the normal approximation handles poorly near zero.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
