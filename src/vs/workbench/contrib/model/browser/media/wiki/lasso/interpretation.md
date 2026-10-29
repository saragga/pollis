# Interpretation

## Coefficients
A penalised coefficient is the change in the predicted response per unit of its predictor, the others fixed, **shrunk toward zero**. Its magnitude is smaller than the least-squares estimate, by design. A coefficient of exactly zero means the penalty removed the predictor at this lambda, not that it has no relationship with the response: it may be correlated with a predictor that was kept.

## Selected Coefficients
The **Selected Coefficients** chart shows the chosen model; bars at zero are the predictors the penalty dropped. Read it with Selection Stability: a selected predictor that is rarely chosen in the resamples should not be interpreted.

## Against OLS
**Against OLS** puts the penalised and unpenalised coefficients side by side. The gap is the shrinkage. If the lasso drops a predictor whose OLS coefficient is large but imprecise, the data cannot tell it apart from noise.

## Selection Criteria
**Selection Criteria** compares four ways of choosing lambda: **AICc**, **BIC** (sparser, aims at the true model), **10-fold CV at the minimum error** (aims at prediction, usually keeps more predictors) and the **one-standard-error rule** (the largest lambda whose CV error is within one standard error of the minimum: the sparsest model that predicts about as well).

## Predictor Importance
**Predictor Importance** ranks the selected predictors by their standardised coefficient, the coefficient times the predictor's standard deviation: the change in the response for a one-standard-deviation change in the predictor. It makes predictors in different units comparable.

## Fit Summary
The **Fit Summary** gives the pseudo R-squared, 1 - deviance / null deviance, the share of the variation explained, and the number of non-zero coefficients. In-sample it is optimistic; the cross-validated RMSE is the honest measure.

## PLSR
The PLSR coefficients are on the original scale of the predictors, computed from the components; every predictor gets a non-zero coefficient. The components themselves are directions in predictor space; the first explains the most covariance with the response. Too few components underfit, too many approach least squares.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
