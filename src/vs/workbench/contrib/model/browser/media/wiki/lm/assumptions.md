# Assumptions

## For the Estimates
- **Linearity.** The mean of y is linear in the parameters. Curvature can be modelled with transformed predictors (logs, squares, splines), but the model must contain it.
- **Exogeneity.** The errors have mean zero given the predictors. Omitted variables correlated with the predictors, reverse causality and measurement error in the predictors violate it, and then OLS is biased; no choice of standard errors repairs this.
- **No perfect collinearity.** No predictor is an exact linear combination of the others. Near-collinearity is allowed, but inflates the standard errors.

## For the Inference
Each model of the panel makes a different assumption about the errors:

| Model | Errors assumed |
|---|---|
| Standard | Independent, constant variance (normal for exact small-sample tests) |
| HC0-HC3 | Independent, variance may differ across observations |
| HAC | Correlated over time, with correlations that die out as the lag grows |
| Clustered | Correlated within clusters, independent across clusters |
| Driscoll-Kraay | Correlated across entities at each date and over time |

## Sample Size
- **Robust estimators are asymptotic.** HC0 understates the standard errors in small samples; HC1 to HC3 correct it in increasing strength.
- **Clustered errors need many clusters**: with fewer than about 30 to 50, they are too small and tests reject too often.
- **HAC and Driscoll-Kraay need a long time dimension**, since they estimate the autocorrelation from the series itself.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
