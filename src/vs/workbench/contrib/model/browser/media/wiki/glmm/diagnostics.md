# Diagnostics

## Simulated Residuals
Ordinary residuals of binary or count models are hard to read. The **Simulated Residuals** (DHARMa-style) simulate 250 responses from the fitted model for each observation and take the rank of the observed value among them: if the model is right, the ranks are **uniform**. The uniform Q-Q plot should follow the diagonal, and the KS test should not reject. A U-shape means overdispersion; an inverted U, underdispersion; a shift, a misspecified mean.

## Overdispersion Check
The **Overdispersion Check** divides the Pearson chi-square by the residual degrees of freedom. For Poisson or aggregated Binomial data a ratio well above 1 means more variation than the family allows, and standard errors that are too small. Remedies: the NegativeBinomial family, an observation-level random effect `(1|obs)`, or a missing predictor. The check is not informative for 0/1 data.

## Singular Fit Check
The **Singular Fit Check** detects variance components estimated at zero or correlations of plus or minus 1: the random-effects structure is too rich. Simplify it, starting with the correlations and the random slopes.

## Random-Effects Q-Q Plot
The **Random-Effects Q-Q Plot** compares the random intercepts with the normal distribution the model assumes. With binary data and small groups the predicted effects are strongly shrunk and the plot is not very sensitive.

## Calibration Plot
The **Calibration Plot** sorts the observations into ten bins of fitted mean and plots the observed against the predicted average in each bin. Points on the diagonal mean the predicted probabilities or rates are right on average; an S-shape means the predictions are too extreme or not extreme enough.

## Laplace vs Adaptive Quadrature
**Laplace vs Adaptive Quadrature** refits the model with 9-point adaptive Gauss-Hermite quadrature. If the estimates, especially the variance components, move noticeably, report the quadrature fit.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Simulated residuals | Uniform, KS not rejected | U-shape, shift |
| Pearson ratio (counts) | Close to 1 | Well above 1 |
| Singular fit | No component at zero | Variance at zero, correlation of +/-1 |
| Calibration | Bins on the diagonal | S-shape, offset |
| Laplace vs quadrature | Estimates agree | Variance components move |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
