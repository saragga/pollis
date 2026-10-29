# Diagnostics

## Residuals vs Fitted
The most useful plot. The residuals should scatter evenly around zero, with no pattern. A **curve** means the mean is not linear in the predictors: add a transformation or a term. A **funnel**, wider at one end, means heteroskedasticity: use HC standard errors, or model the variance (weights, a log response).

## Residual Q-Q Plot
The quantiles of the standardised residuals against those of a normal distribution. Points on the line mean normal errors. Normality matters for exact tests in small samples; in large samples the estimates and robust tests remain valid without it. **Heavy tails** (both ends off the line) suggest outliers, or a heavy-tailed error distribution.

## Leverage and Influence
- **Leverage** (the diagonal of the hat matrix, h_ii) measures how unusual an observation's predictors are. The average is p/n; above **2p/n** is high.
- **Cook's distance** combines leverage and the size of the residual, and measures how much the fitted coefficients move when the observation is dropped. Values above **4/n**, or clearly apart from the rest, deserve a look.
An influential point is not necessarily wrong: check it, and report the fit with and without it if it changes the conclusions.

## Comparing Standard Errors
The robustness comparisons are diagnostics too:
- **HC Variants**: robust errors much larger than the classical ones signal heteroskedasticity.
- **HAC Kernels**: HAC errors larger than the HC ones signal autocorrelation. The three kernels should roughly agree; if not, the bandwidth matters and the inference is fragile.
- **Clustering Effect**: clustered errors much larger than HC1 mean the observations in a cluster carry less independent information than their number suggests.
- **Cross-Sectional Dependence**: Driscoll-Kraay errors larger than clustered ones signal common shocks across entities.

## Multicollinearity
Large standard errors, coefficients with unexpected signs, or estimates that change a lot when one predictor is added or dropped suggest predictors that are close to linear combinations of each other.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Residuals vs fitted | Even band around zero | Curve or funnel |
| Q-Q plot | Points on the line | Heavy tails, skew |
| Leverage | Below 2p/n | Isolated high values |
| Cook's distance | No point stands apart | One point drives the fit |
| Robust vs classical errors | Close | Robust much larger |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
