# Overview

This webview fits regressions that do not depend on the mean and the squared error. **Robust regression** estimates the same conditional mean as least squares, but with a loss that grows more slowly than the square, so that outlying responses pull the fit less. **Quantile regression** estimates a conditional **quantile** of the response instead of its mean: the median, the lower quartile, the 90th percentile. Both use RobustModels.jl.

## Robust Regression
An **M-estimator** minimises the sum of a loss rho(r / s) of the scaled residuals, fitted by iteratively reweighted least squares (IRLS): each observation gets a weight that falls as its residual grows. The **M-estimator** input chooses the loss:
- **Huber**: squared for small residuals, linear for large ones. Efficient when the errors are close to normal, moderately resistant.
- **Tukey bisquare**, **Hampel**, **Welsch**: **redescending** losses, whose weights fall to (or toward) zero for very large residuals, so gross outliers are effectively ignored.
- **L1 (LAD)**: the absolute residual; the median regression.

An optional **ridge (L2) penalty** shrinks the coefficients, for many or correlated predictors.

## Quantile Regression
Quantile regression minimises the **check function**: residuals above the fit weigh tau, those below weigh 1 - tau. At **tau** = 0.5 it is median regression. Fitting several tau shows how the predictors affect the whole distribution of the response, its spread and its tails, not only its centre.

## Common Workflow

1. Fit the model, and look at **Residuals vs Fitted** and the **Quantile Process**.
2. Run the **Outlier and Weight Check** and look at the **Leverage Points**.
3. Check prediction with **Observed vs Fitted** and the **90% Prediction Band**.
4. Compare the fit **Against OLS**, and with **Alternative Estimators**.
5. Read the **Coefficients With 95% CI** and the **Pseudo R-Squared**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
