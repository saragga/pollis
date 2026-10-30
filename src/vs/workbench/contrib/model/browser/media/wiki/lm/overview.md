# Overview

The Linear Regression panel fits **linear regression** by ordinary least squares: the expected response is a linear combination of the predictors, and the coefficients minimise the sum of squared residuals. The estimates are the same in every model of the panel; what changes is how their **standard errors** are computed, which decides the confidence intervals and tests. The panel offers the classical errors and four robust alternatives, through GLM.jl, Regress.jl and CovarianceMatrices.jl.

## Standard
Classical OLS standard errors, which assume the errors are independent with constant variance. Exact under normal errors, and the baseline for every comparison.

## HC0-HC3
**Heteroskedasticity-consistent** standard errors (White's sandwich and its refinements), for independent errors whose variance changes with the predictors. HC3 is the safest in small samples.

## HAC
**Heteroskedasticity and autocorrelation consistent** standard errors (Newey-West and its relatives), for time series whose errors are correlated over time. The rows must be in time order.

## Clustered
**Cluster-robust** standard errors, for observations grouped into clusters (firms, states, schools) whose errors are correlated within a cluster and independent across clusters.

## Driscoll-Kraay
For **panel data** whose errors are correlated across entities at the same date as well as over time: a HAC estimator applied to the cross-sectional averages of the scores.

## Common Workflow

1. Fit the model, and look at **Fitted vs Observed** and the **Coefficient Plot**.
2. Check the fit with **Residuals vs Fitted**, the **Residual Q-Q Plot** and **Leverage and Influence**.
3. Choose the standard errors: compare **HC Variants**, **HAC Kernels**, the **Clustering Effect** or **Cross-Sectional Dependence**.
4. Compare nested models with the **Nested F-Test**.
5. Predict with a **Confidence Interval** for the mean or a **Prediction Interval** for a new observation.
6. Read the **Confidence Intervals** and the **Standardised Coefficients**; **Replicate** checks the code against published results.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
