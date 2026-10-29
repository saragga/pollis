# Interpretation

## Coefficients
Each coefficient is the expected change in the response for a one-unit increase in its predictor, **holding the other predictors fixed**. It is an association, not an effect, unless the predictor is exogenous. The intercept is the expected response when every predictor is zero, which may lie outside the data and mean nothing.

With logs: in a log-log model a coefficient is an **elasticity** (the percentage change in y for a 1% change in x); with a log response and a level predictor, 100 beta is approximately the percentage change in y per unit of x.

## Standard Errors, Tests and Confidence Intervals
The **Confidence Intervals** are the estimate plus or minus a t quantile times the standard error. A 95% interval that excludes zero corresponds to a two-sided test rejecting at 5%. The interval is only as valid as the standard errors: under heteroskedasticity, autocorrelation or clustering, the classical ones are wrong, usually too small.

## Standardised Coefficients
**Standardised Coefficients** multiply each coefficient by the standard deviation of its predictor and divide by that of the response: the change in standard deviations of y per standard deviation of x. They put predictors on a common scale, but depend on the spread of the predictors in this sample.

## Fit
**R-squared** is the share of the variance of y explained by the model. It always rises when a predictor is added; **adjusted R-squared** penalises the extra parameters. A low R-squared does not invalidate the coefficients; a high one does not prove the model is right.

## Nested F-Test
The **Nested F-Test** asks whether a group of predictors adds explanatory power: it compares the residual sums of squares of the models with and without them. A small p-value says the restricted model fits significantly worse. It assumes classical errors; with robust errors use a Wald test with the robust covariance.

## Prediction
The **Confidence Interval** for the mean response at new predictor values reflects the uncertainty of the coefficients only, and narrows as n grows. The **Prediction Interval** for a single new observation adds the error variance, and never narrows below it.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
