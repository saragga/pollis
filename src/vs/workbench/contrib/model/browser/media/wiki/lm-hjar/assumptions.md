# Assumptions

The combined correction replaces the assumptions of ordinary least squares with more specific ones about the errors. Standard errors from either tab are reliable only so far as the error model is close to the truth.

## Why AR(1) with Heteroskedasticity Needs Strictly Exogenous Regressors

Quasi-differencing mixes x_t with x_(t-1), so each error must be unrelated to the regressors of every period, and not only to those of its own. A lagged value of y among the regressors breaks that condition, because it is correlated with past errors. Rho and beta are then both inconsistent, whichever tab is used. Feedback from y to later values of x has a similar effect. The panel has no test for this failure. When a lagged response or feedback is part of the question, a dynamic model is the better starting point.

## What AR(1) Errors Assume About the Dependence over Time

Only one lag of the error is modelled, with a single rho for the whole sample. Seasonal or higher-order dependence stays in the errors, and standard errors remain wrong. Rho near 1 or -1 is a further warning, since the regression may be spurious or the errors close to non-stationary, and differencing may suit the data better. The two tabs treat this boundary differently. **Sequential** computes sqrt(1 - rho^2), so an estimate of rho beyond 1 in absolute value raises a `DomainError`. **Joint** optimises tanh of an unconstrained number, which keeps rho inside the interval.

## What the Exponential Variance Equation Assumes

Log(sigma_t^2) = z_t' gamma must describe how the variance of the shocks moves, with the right regressors. A variance driven by something missing from Z, a level shift for example, stays uncorrected. By default Z is **Covariate matrix (X)**, which suits a variance that follows the regressors but cannot capture one that follows time unless time is included. Each extra column adds one parameter, and the default doubles the regression's number of coefficients. Misspecified weights still give a usable beta under strict exogeneity, but the reported standard errors assume that the variance model is right.

## What the Heteroskedasticity + AR(1) Estimators Assume About Normality

The joint likelihood is Gaussian, and the log regression of **Sequential** relies on the same assumption in a different form. HARE.jl adds 1.2704, minus the mean of log chi-squared with one degree of freedom, to correct the intercept of gamma, and that value is exact only for normal shocks. Slopes of gamma are less sensitive to this. Heavy tails distort the likelihood of **Joint**. Log squares react strongly to residuals very close to zero, so a few tiny residuals can pull gamma in **Sequential**, and a residual of exactly zero leaves the logarithm undefined.

## What the First Observation Assumes in the AR(1) Transformation

Both tabs keep the first period and scale it by sqrt(1 - rho^2) / sigma_1. That treats u_1 as having variance sigma_1^2 / (1 - rho^2), which would be the stationary variance if the shocks kept the size of period one forever. With a changing variance the expression is an approximation. In long samples one period has little weight. In short samples, or with a first period that has a large weight, results may depend on it, and it helps to refit without that period to see how much.

## When Robust Standard Errors Are a Safer Choice than the Combined Correction

When the form of the error model is in doubt, OLS with a heteroskedasticity and autocorrelation consistent covariance matrix avoids choosing one, and [Newey and West (1987)](#ref-NW1987a) gave the usual form. [White (1980)](#ref-Whi1980a) treats heteroskedasticity alone. Such standard errors stay valid under weaker conditions, while the coefficients remain those of OLS and give up the possible gain in efficiency. The panel does not offer them. Large differences between robust and corrected standard errors point to a misspecified error model, and that comparison is worth making before relying on either tab.

## References

<a id="ref-NW1987a"></a>Newey, W. K. and West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. *Econometrica* 55(3), 703–708. [doi:10.2307/1913610](https://doi.org/10.2307/1913610)

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

## See Also

- [Overview](overview.md) · [Sequential Method](sequential.md) · [Diagnostics](diagnostics.md)
