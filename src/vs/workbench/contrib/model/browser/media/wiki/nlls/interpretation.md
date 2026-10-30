# Interpretation

## Summary
The **Summary** gives the fitted parameters, the sum of squared residuals (SSR), the **residual standard error** s = sqrt(SSR / (m - n)), the degrees of freedom, and the solver's convergence flag and iterations. s estimates the standard deviation of the errors, in the units of y.

## Parameter Estimates
**Parameter Estimates** gives each estimate with its standard error, from the linearised covariance s^2 (J'J)^-1, and its t-statistic, estimate over standard error. It also reports the **correlation matrix** of the estimates: off-diagonal values near +1 or -1 mean the data cannot separate the two parameters, so their individual values are imprecise even when the fit is good. In p1 exp(-p2 t), the amplitude and rate are typically positively correlated: a higher start can be offset by a faster decay.

## Parameter CI
**Parameter CI** gives approximate 95% intervals, estimate plus or minus the t quantile with m - n degrees of freedom times the standard error. They are **linearised** (Wald) intervals: accurate when the model is close to linear in p over the interval, which holds for large samples and moderate curvature. For strongly nonlinear models or small samples, profile likelihood or bootstrap intervals are more reliable, and can be asymmetric.

## Goodness of Fit
**Goodness of Fit** gives an R-squared analogue, 1 - SSR / SST, the RMSE and the residual norm relative to the data norm. In nonlinear models without an intercept R-squared is only descriptive and can be misleading; the residual standard error and the residual plot say more.

## Predictions
**Fitted Values** lists observed, fitted and residual values. **New-Point Eval** predicts at a new t, by default 20% beyond the data, with a delta-method standard error from the gradient of f in p: the interval is for the **mean** response, not for a new observation, which would add s^2. Extrapolation relies entirely on the model's form.

## Compare Solvers
**Compare Solvers** fits with Levenberg-Marquardt, Dogleg, Gauss-Newton and NonlinearSolve's trust region from the same start. They should reach the same SSR and parameters; a difference shows a hard problem, a poor start or several local minima.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
