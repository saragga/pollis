# Overview

This webview estimates a linear model with endogenous regressors by the **generalized method of moments** (GMM). The model implies **moment conditions**, expectations that are zero at the true parameters; here E[z_i (y_i - x_i'theta)] = 0 for every instrument z, the exogenous regressors and the excluded instruments. GMM picks the theta that makes the sample averages of these moments as close to zero as possible, weighted by a matrix W. It needs no distributional assumption on the errors. The fit uses GMMTools.jl, with the moment function written out in the code, so other models can be estimated by changing it.

## Two-Step Efficient GMM
The first step estimates theta with a preliminary weight; the second re-weights the moments by the inverse of their estimated covariance S, which gives the **efficient** estimator: the smallest asymptotic variance among GMM estimators using these moments, with heteroskedasticity allowed for. Hansen's J test of the overidentifying restrictions comes from this fit.

## One-Step GMM (2SLS Weights)
With the weight W = (Z'Z / n)^-1, GMM reproduces **two-stage least squares** exactly; the standard errors are the robust sandwich ones.

## Two-Step GMM, Cluster Bootstrap SEs
Two-step GMM with standard errors from a **cluster Bayesian bootstrap**: each refit gives every cluster a random Dirichlet weight, so the errors allow for correlation within clusters, named in **Cluster By**.

## Common Workflow

1. Fit the model, and read the coefficients with their sandwich standard errors.
2. Test the overidentifying restrictions with the **J-Statistic (Hansen Test)**; check the instruments with the **First-Stage Analysis**; look at the **Residual Diagnostics** and the moments at the estimate.
3. Compare **OLS vs GMM**, and the **Efficiency vs 2SLS**.
4. Read the **Coefficient Table**, the **Confidence Intervals** and the **Bootstrap Confidence Intervals**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
