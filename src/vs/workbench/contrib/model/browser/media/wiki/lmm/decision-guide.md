# Decision Guide

| Situation | Model | Formula |
|---|---|---|
| Groups differ in level; group effects unrelated to the predictors | **Mixed-Effects** | `(1|group)` |
| The effect of a predictor differs across groups | **Mixed-Effects** | `(1+x|group)` |
| Two grouping factors (subjects and items) | **Mixed-Effects** | `(1|g1) + (1|g2)`, crossed, or `(1|g1/g2)`, nested |
| Group effects may be correlated with the predictors | **Panel Fixed-Effects** | `fe(id)` |
| Common shocks in each period as well | **Two-Way Fixed-Effects** | `fe(id) + fe(t)` |
| An endogenous regressor in a panel | **IV / 2SLS** | `(x_end ~ z_iv)` with `fe(id)` |

## Decision Flow

1. **Is the question about the groups themselves** (how much schools differ, a predicted effect for each)? A mixed model estimates and predicts them; fixed effects only remove them.
2. **Could unobserved group characteristics be correlated with the predictors?** If yes, or if the Hausman test rejects, use fixed effects.
3. **Does a predictor of interest not vary within groups?** Fixed effects absorb it; only the mixed model can estimate it.
4. **Are there few groups** (below about 5 to 10)? The between-group variance is unreliable; use fixed effects or include the group as a predictor.
5. **Is a regressor endogenous for reasons other than the group effects?** Use IV / 2SLS with strong instruments.

## Choosing the Random-Effects Structure
Start with the random intercept. Add a random slope when theory says the effect varies by group and there is within-group variation in the predictor. If the fit is singular, simplify: remove the correlation, then the slope.

## Rules of Thumb
- **ML to compare fixed effects, REML for variance components**: likelihood ratio tests of fixed effects need ML fits.
- **Cluster the fixed-effects standard errors by entity** unless you have a reason not to.
- **Check the Hausman test** before trusting the random-effects estimates of the fixed effects.
- **The predicted group effects are shrunk**: do not rank groups by them without their intervals.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
