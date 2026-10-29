# Diagnostics

## Residuals vs Fitted
**Residuals vs Fitted** should show no curvature. For quantile regression, about a share tau of the points should lie below zero at every fitted level; a share that changes with the fitted value means the quantile is not linear in the predictors.

## Outlier and Weight Check
For **robust regression**, the **Outlier and Weight Check** shows each observation's final IRLS weight. Weights near 1 are treated as ordinary; low weights are the points the loss has discounted. Look at them: they are data errors, a different population, or a sign of a missing predictor. With a redescending loss a weight of zero means the point is ignored. For **quantile regression**, it refits on a random 70% of the rows and checks that the share of held-out observations below the fitted quantile is close to tau; in sample it matches tau by construction.

## Leverage Points
**Leverage Points** shows the hat values of the design. Observations with leverage well above 2p/n are far from the others in predictor space; M-estimators and quantile regression do not protect against them. If one drives the fit, consider whether it belongs to the population, or use a high-breakdown estimator.

## Quantile Process
The **Quantile Process** re-estimates each coefficient at tau from 0.1 to 0.9, beside the least-squares estimate. A flat line means the predictor shifts the whole distribution equally (a location shift); a rising or falling line means it changes the spread or skewness.

## 90% Prediction Band
The **90% Prediction Band** fits the 5% and 95% conditional quantiles on 70% of the rows and reports the coverage on the other 30%. Coverage close to 90% means the band is calibrated; well below it, the quantile model does not extrapolate to new data.

## Alternative Estimators
**Alternative Estimators** refits with other losses (robust) or at the three quartiles (quantile). Coefficients that barely move mean the conclusion does not depend on the choice.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Residuals vs fitted | No curve; share below zero about tau | Curve; share drifting |
| IRLS weights | Few low weights, explicable | Many low weights |
| Leverage | Below 2p/n | Isolated high values |
| Held-out share below quantile | Close to tau | Far from tau |
| Prediction band coverage | About 90% | Well below 90% |
| Alternative estimators | Coefficients stable | Signs or sizes change |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
