# Overview

This webview estimates linear models with **endogenous regressors**, variables correlated with the error because of omitted variables, simultaneity or measurement error, where least squares is biased whatever the sample size. **Two-stage least squares** uses **instruments**, variables that move the endogenous regressors but affect the response only through them, to isolate the part of their variation that is unrelated to the error. The fit uses FixedEffectModels.jl.

## The Two Stages
In the **first stage**, each endogenous regressor is regressed on all the instruments: the exogenous regressors (included instruments) and the excluded instruments. In the **second stage**, the response is regressed on the exogenous regressors and the first-stage fitted values. The coefficients are those of the second stage; the standard errors are computed from the structural residuals, with the actual endogenous regressors, not from the second-stage regression.

## Inputs
The panel builds the formula `y ~ exog + (endog ~ instruments)` from the names in **Response**, **Exogenous Regressors**, **Endogenous** and **Instruments (Excluded)**, and adds the intercept. **Standard Errors** chooses classical, heteroskedasticity-robust (HC1) or clustered errors, with **Cluster By** naming the groups. Every fit reports the Kleibergen-Paap first-stage F.

## Identification
The model is **just identified** with as many excluded instruments as endogenous regressors, and **overidentified** with more; with fewer, it cannot be estimated. Overidentification allows a test of whether the instruments agree with each other.

## Common Workflow

1. Fit the model and read the first-stage F at the bottom of the table.
2. Check the instruments with **First-Stage Strength**; test the need for them with the **Endogeneity Test (Durbin-Wu-Hausman)**, and their coherence with the **Overidentification Test (Sargan)**.
3. Look at the **Residual Diagnostics**.
4. Compare **OLS vs 2SLS**, and the **Standard Errors Compared**.
5. Read the **Coefficient Table** and the **Confidence Intervals**; with weak instruments, the **Weak-Instrument Robust Interval (Anderson-Rubin)**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
