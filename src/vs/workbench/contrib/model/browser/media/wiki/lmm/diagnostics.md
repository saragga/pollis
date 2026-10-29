# Diagnostics

## Residuals vs Fitted
**Residuals vs Fitted** should show an even band around zero. Curvature means a missing term or transformation; a funnel means heteroskedasticity, which the fixed-effects models can absorb with robust or clustered standard errors.

## Residual Normality
**Residual Normality** shows a Q-Q plot of the standardised residuals with a Jarque-Bera test. Heavy tails or skew weaken the normal-theory standard errors and tests, mostly in small samples; with many observations the test rejects small departures that do not matter.

## Model Health Checks
**Model Health Checks** reports one problem per model:
- **Mixed-Effects: a singular fit.** A variance component estimated at zero, or a correlation of plus or minus 1, means the random-effects structure is richer than the data can support. Simplify it: drop the random slope, or the correlation between intercept and slope.
- **Fixed-effects: convergence.** The demeaning that absorbs the fixed effects is iterative; if it did not converge, the estimates are not reliable.
- **IV: weak instruments.** A first-stage Kleibergen-Paap F below about 10 means the instruments barely move the endogenous regressor, and the 2SLS estimate is biased toward OLS with unreliable standard errors.

## Random-Effects Q-Q Plot
The **Random-Effects Q-Q Plot** compares the predicted random intercepts with the normal distribution the model assumes. A few groups far from the line are worth looking at; a clear S-shape or skew suggests a missing group-level predictor. The predictions are shrunk toward zero, so the plot looks less spread than the true effects.

## Group Effects
The **Group Effects** plot (a caterpillar plot for the mixed model) shows each group's intercept with a 95% interval. Groups whose intervals overlap broadly differ little; a few outlying groups may deserve a closer look or a group-level predictor.

## Hold-Out Prediction Error
The **Hold-Out Prediction Error** refits on 80% of the rows and computes the RMSE on the other 20%. An RMSE much larger than the in-sample residual standard deviation means overfitting. The mixed model predicts groups it has not seen at the population level, with their random effect at zero.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Residuals vs fitted | Even band around zero | Curve or funnel |
| Singular fit | No variance component at zero | Variance at zero, correlation of +/-1 |
| Random-effects Q-Q | Points on the line | Skew, isolated groups |
| First-stage F (IV) | Well above 10 | Below 10 |
| Hausman test | Large p-value | Small p-value: use fixed effects |
| Hold-out RMSE | Close to the in-sample value | Much larger |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
