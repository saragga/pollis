# Overview

The Generalized Linear Models panel fits **generalized linear models** (GLMs): regressions for responses that are not normal with constant variance, such as 0/1 outcomes, counts and positive skewed amounts. A GLM has three parts: a **family**, the distribution of the response; a **linear predictor**, b0 + b1 x1 + ... + bp xp; and a **link**, the function of the mean that equals the linear predictor. Models are fitted by maximum likelihood (iteratively reweighted least squares) with GLM.jl, and robust standard errors come from CovarianceMatrices.jl.

## Bernoulli and Binomial
**Binary response**: a 0/1 outcome (Bernoulli) or a number of successes out of n trials (Binomial). The default **logit** link gives logistic regression, whose coefficients are log odds ratios; **probit**, **complementary log-log** and **cauchit** are the alternatives.

## Poisson
**Counts** of events, with the **log** link: each covariate multiplies the expected count by exp(coefficient). The Poisson assumes the variance equals the mean.

## Negative Binomial and Geometric
**Overdispersed counts**, whose variance exceeds the mean. The Negative Binomial adds a dispersion parameter, estimated with the coefficients as in R's glm.nb; the Geometric is the Negative Binomial with that parameter fixed at 1.

## Gamma and Inverse Gaussian
**Positive continuous** responses, skewed to the right, whose spread grows with the mean: costs, durations, claim sizes. The Gamma's variance grows with the square of the mean, the Inverse Gaussian's with its cube. The canonical links are the inverse and the inverse square; the log link is often easier to interpret.

## Normal
The **ordinary linear model** written as a GLM, with the identity link. Other links (log, inverse) give a normal response with a non-linear mean.

## Inference
**Standard** errors from the model's own information matrix, or robust ones: **HC0 to HC3** for heteroskedasticity, **HAC** for heteroskedasticity and autocorrelation, and **Clustered** for observations grouped by a cluster variable.

## Common Workflow

1. Choose the **family** from the kind of response, and the **link** (start with the default).
2. Fit, and look at **Fitted vs Observed** and the **Coefficient Plot**.
3. Run the **Residual Plots** and, for counts, the **Overdispersion Check**; switch to the Negative Binomial if the counts are overdispersed.
4. Compare with an intercept-only model by the **Likelihood Ratio Test**, and between candidate models by the **Information Criteria**.
5. Report **Coefficient Interpretation** (odds or rate ratios) and **Marginal Effects**, with the **Deviance Analysis**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
