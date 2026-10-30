# Overview

The Penalised & Projection Regression panel fits regressions that stay stable when there are **many predictors or strongly correlated ones**, where ordinary least squares overfits or becomes unstable. Two of its models **penalise** the size of the coefficients, shrinking them toward zero and, with an L1 penalty, setting some exactly to zero; the third **projects** the predictors onto a few latent components and regresses on those. The penalised models use Lasso.jl; partial least squares is written out with LinearAlgebra.

## Lasso
The **lasso** minimises the residual sum of squares plus lambda times the sum of the absolute coefficients (the L1 norm). As lambda grows, coefficients shrink and drop out one by one, so the lasso **selects variables**. Among strongly correlated predictors it tends to keep one and drop the others.

## ElasticNet
The **elastic net** mixes the L1 penalty with the ridge (L2) penalty on the squared coefficients: **alpha** = 1 is the lasso, alpha = 0 ridge, and values in between keep groups of correlated predictors together while still setting some coefficients to zero.

## Lambda and the Regularisation Path
Leaving **lambda** empty fits the whole **regularisation path**, from the penalty that removes every predictor down to almost none, and selects lambda by **AICc**. A value fixes the penalty instead. Predictors are standardised before the penalty is applied, so it treats them equally whatever their units, and the coefficients are reported on the original scale.

## PLSR
**Partial least squares regression** extracts a few components, linear combinations of the predictors chosen to have maximal covariance with the response, and regresses the response on them (the NIPALS algorithm). It keeps every predictor, but replaces many correlated ones by a few directions; the number of components plays the role of lambda.

## Common Workflow

1. Fit the model, and look at the **Coefficient Path** and the **Selected Coefficients**.
2. Check the fit with **Residuals vs Fitted**, and how reliable the selection is with **Selection Stability** and the **Bootstrap Coefficient Intervals**.
3. Measure prediction with the **Cross-Validated RMSE** and **Observed vs Fitted**.
4. Compare the **Selection Criteria** for lambda, and the coefficients **Against OLS**.
5. Read the **Predictor Importance** and the **Fit Summary**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
