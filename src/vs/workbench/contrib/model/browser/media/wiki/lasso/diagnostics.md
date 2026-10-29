# Diagnostics

## Coefficient Path
The **Coefficient Path** plots every coefficient against the L1 norm of the coefficient vector, from the strongest penalty (all zero) to the weakest. Predictors that enter early and stay are the strongest; coefficients that change sign along the path, or that enter and leave, point to correlated predictors competing.

## Residuals vs Fitted
**Residuals vs Fitted** should show no structure. A curve means a nonlinear term or an interaction is missing; the penalty cannot supply it.

## Selection Stability
**Selection Stability** refits the model on 100 bootstrap resamples and counts how often each predictor is selected. Predictors chosen in nearly every resample are reliable; those chosen in under half are not, and their presence in the selected model is close to chance. Two correlated predictors that each appear about half the time are usually substitutes for each other.

## Bootstrap Coefficient Intervals
The **Bootstrap Coefficient Intervals** resample pairs (Bootstrap.jl), refit and report 95% percentile intervals with the share of resamples in which each coefficient is exactly zero. They show the variability of the penalised estimates; because of the shrinkage they are not confidence intervals for the true coefficients in the classical sense.

## Cross-Validated RMSE
The **Cross-Validated RMSE** compares 5-fold prediction error with ordinary least squares on the same folds. A penalised model that does not beat OLS here gains nothing in prediction; with few predictors and many observations that is expected.

## Observed vs Fitted
In **Observed vs Fitted**, shrinkage pulls the fitted values toward the mean: points flatter than the 45-degree line are the price of the lower variance.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Coefficient path | Clear early entrants | Sign changes, entries and exits |
| Selection frequency | Selected predictors near 100% | Below 50% |
| Residuals vs fitted | No structure | Curve |
| CV RMSE vs OLS | Lower | Higher or equal |
| Criteria for lambda | AICc, BIC and CV agree | Very different model sizes |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
