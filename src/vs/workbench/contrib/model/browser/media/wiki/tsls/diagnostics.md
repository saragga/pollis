# Diagnostics

## First-Stage Strength
**First-Stage Strength** reports the F statistic of the excluded instruments in each first-stage regression, and the joint **Kleibergen-Paap F**, robust to heteroskedasticity and clustering. The classical rule of thumb is **F above 10** (Staiger and Stock); recent work suggests much higher thresholds (around 100) for the usual t test to keep its size with robust errors. Below 10 the instruments are weak: the estimate is biased toward OLS and the confidence intervals are too narrow. Use the Anderson-Rubin interval.

## Endogeneity Test (Durbin-Wu-Hausman)
The **Endogeneity Test** is a control-function test: it adds the first-stage residuals to the OLS regression and tests their coefficients. A small p-value means the regressors are endogenous and 2SLS is needed; a large one means OLS and 2SLS do not differ significantly, and OLS, which is more precise, may be preferred. The test is only as good as the instruments.

## Overidentification Test (Sargan)
With more instruments than endogenous regressors, the **Overidentification Test** regresses the 2SLS residuals on all instruments; n R-squared is chi-square with degrees of freedom equal to the number of overidentifying restrictions. A small p-value means the instruments disagree: at least one is invalid, or the effects are heterogeneous. A large p-value does not prove validity: if all instruments share the same flaw, the test cannot see it. It assumes homoskedastic, independent errors; Hansen's J test in Generalized Method of Moments is the robust version. Not available when the model is just identified.

## Residual Diagnostics
**Residual Diagnostics** shows the structural residuals, y - X beta-hat, and a check for heteroskedasticity. If the variance changes with the regressors, use robust or clustered standard errors.

## Standard Errors Compared
**Standard Errors Compared** fits the same model with classical, robust and, when selected, clustered errors. Clustered errors much larger than robust ones mean the within-cluster correlation matters.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| First-stage F | Well above 10 | Below 10 |
| Endogeneity test | Small p-value (2SLS needed) | Large p-value: OLS may do |
| Sargan test | Large p-value | Small p-value |
| OLS vs 2SLS | Difference explained by the story | 2SLS absurdly large |
| Robust vs clustered errors | Close | Clustered much larger |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
