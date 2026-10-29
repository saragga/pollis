# Diagnostics

## Residuals
The **Residual Plots** show the Pearson residuals, (y - fitted) / sqrt(variance), against the fitted values. They should scatter evenly around zero with no pattern. A funnel means the variance function is wrong; a curve means the link or the covariates are; a few very large residuals are outliers or a sign of overdispersion. For 0/1 data the residuals fall on two curves by construction, so look for trends, not shape.

## Overdispersion
The **Overdispersion Check** divides the sum of squared Pearson residuals by the residual degrees of freedom. For a correct Poisson or Binomial count model it is about 1; well above 1, the counts vary more than the family allows and the standard errors are too small. Remedies: the **Negative Binomial**, or robust (**HC**) standard errors. The check does not apply to 0/1 data, nor to families that estimate their own dispersion (Gamma, Inverse Gaussian, Normal).

## Fit
**Fitted vs Observed** should lie along the diagonal. The **Deviance Analysis** reports the deviance explained, 1 - residual deviance / null deviance, a pseudo R-squared: it is not comparable with the R-squared of a linear model, and is usually lower.

## Model Comparison
The **Likelihood Ratio Test** compares the model with the intercept-only model: twice the gain in log-likelihood follows a chi-squared distribution with as many degrees of freedom as covariates. The **Information Criteria** (AIC, AICc, BIC) compare models of the same response, including different families; lower is better, and differences below about 2 are not meaningful.

## Separation and Convergence
Very large coefficients with huge standard errors in a binary model mean **separation**: some combination of covariates predicts the outcome perfectly. Drop or merge the offending covariate, or use a penalised fit.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Pearson residuals | Even scatter around zero | Funnel or curve |
| Dispersion (counts) | About 1 | Well above 1: use NegBin or robust errors |
| Fitted vs observed | Along the diagonal | Systematic bend |
| Coefficients | Moderate, with finite errors | Huge estimates and errors: separation |
| Robust vs standard errors | Close | Very different: variance function or clustering wrong |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
