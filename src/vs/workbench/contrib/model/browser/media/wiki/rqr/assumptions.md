# Assumptions

## Both Models
- **Linearity** of the conditional mean (robust) or of the conditional quantile (quantile) in the parameters.
- **Independent observations.**
- **Exogeneity.** The predictors are uncorrelated with the errors (robust) or the quantile condition holds given the predictors; outliers caused by omitted variables are a model problem, not noise.
- **Outliers in y, not in x.** Both protect against outlying responses; a point with extreme predictor values (high leverage) can still have large influence.

## Robust Regression
- **Symmetric errors** for the robust fit to estimate the conditional mean. With skewed errors the M-estimate targets a different centre, between the mean and the median.
- **A good scale estimate.** The residuals are scaled by a robust scale; redescending losses depend on a sensible starting fit, and can land in a local minimum.
- **The standard errors** from the asymptotic M-estimator theory assume homoskedastic errors.
- **The ridge penalty** depends on the scale of the predictors; standardise them if their units differ.

## Quantile Regression
- **No distributional assumption** on the errors: that is its strength.
- **The quantile lines should not cross.** Fits at different tau are estimated separately and can cross where data are sparse, a sign that the linear model is wrong there.
- **The standard errors** of the package use an iid sparsity estimate; under heteroskedasticity the panel's pairs bootstrap intervals are the safer choice.
- **Extreme quantiles** (tau below 0.05 or above 0.95) are estimated from few observations and are noisy.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
