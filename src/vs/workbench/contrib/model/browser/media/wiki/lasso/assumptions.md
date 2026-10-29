# Assumptions

## The Model
- **Linearity.** The response is linear in the predictors, as in least squares. The penalty does not find nonlinear effects; they must be added as transformed predictors or interactions.
- **Independent observations** with constant error variance, for the fit and especially for cross-validation, whose folds assume exchangeable rows. Time-ordered or grouped data need time-series or group-aware folds.

## Sparsity (Lasso)
- The lasso works best when **only a few predictors matter**. When many have small effects, ridge or the elastic net predicts better.
- **Selection consistency** (picking exactly the true predictors) needs the relevant predictors not to be too correlated with the irrelevant ones, and their effects to be large enough to stand out from the noise. These conditions are rarely checkable, which is why Selection Stability matters.

## Scale
- The penalty depends on the scale of the predictors: Lasso.jl **standardises** them before fitting, so each is penalised on the same footing. The PLSR code **centres** the predictors but does not scale them; predictors measured in very different units should be standardised first, or the large-variance ones dominate the components.
- The **intercept** is not penalised.

## Choosing Lambda
- **AICc and BIC** assume the model is close to correct and use the number of non-zero coefficients as its degrees of freedom.
- **Cross-validation** assumes the folds are representative of new data. With few observations its estimate of the error is noisy, and the one-standard-error rule guards against it.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
