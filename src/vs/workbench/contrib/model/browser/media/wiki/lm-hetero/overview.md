# Overview

Many regressions have errors whose spread grows or shrinks with size, income or some other variable. The panel models that spread directly and uses it to weight the observations.

## Why Non-Constant Error Variance Leads to Weighted Regression

Under heteroskedasticity, with exogenous regressors, OLS coefficients stay unbiased but are inefficient, and the classical OLS standard errors are wrong. Two remedies exist. The covariance estimator of [White (1980)](#ref-Whi1980a) repairs OLS standard errors without any variance model, and leaves the estimates alone. Weighted least squares goes further, giving noisy observations less weight, which can reduce the variance of the estimates when the variance is modelled well ([Greene (2018)](#ref-Gre2018a)). The panel follows the second route and shows the first in **Compare with OLS**.

## How Feasible Weighted Least Squares Estimates a Variance Model

Feasible weighted least squares has three steps. OLS gives residuals e_i. A regression of some function of e_i on the drivers gives gamma and thus fitted variances. Least squares with weights 1/sigma_i² then gives beta. **Two-step FWLS** stops there. **Iterated FWLS** recomputes residuals from the weighted fit and repeats. **Maximum likelihood** instead maximises the normal likelihood over beta and gamma together with L-BFGS, starting from the OLS coefficients and the auxiliary regression on their residuals, or for **Linear** from a constant variance.

## How the Exponential and Power Tabs Model the Variance

**Exponential** follows the multiplicative model of [Harvey (1976)](#ref-Har1976a), in which log sigma_i² is linear in z. Harvey's auxiliary regression uses log(e²), and the constant 1.2704, the negative of the mean of a log chi-squared variable with one degree of freedom, corrects its intercept. **Power** applies the same regression to log abs(z), a form used by [Park (1966)](#ref-Par1966a). Its slopes are elasticities of the variance. Neither form can give a negative variance.

## How the Quadratic and Linear Tabs Model the Variance

**Quadratic** makes the standard deviation linear in z. [Glejser (1969)](#ref-Gle1969a) regressed absolute residuals on such variables to test for heteroskedasticity, and [Rutemiller and Bowers (1968)](#ref-RB1968a) estimated a regression whose error standard deviation is linear in a covariate. The tab scales the fit by sqrt(pi/2) to pass from mean absolute residual to standard deviation under normality. **Linear** regresses e² on z. Such regressions of squared residuals appear in the random coefficients model of [Hildreth and Houck (1968)](#ref-HH1968a), where the variance is linear in squared regressors. Nothing keeps these two fits positive, so the code clips them.

## A Common Workflow for Heteroskedastic Regression in the Panel

1. Run **Heteroskedasticity Tests** on OLS residuals, choosing **Variance drivers (Z)** from knowledge of the data.
2. Fit a tab, and read **Residual Spread** and **Standardised Residuals**.
3. Rank the four forms with **Compare Variance Models**, without treating the ranking as decisive.
4. Run **Remaining Heteroskedasticity** on the chosen form.
5. Read **Compare with OLS**, **Coefficients** and **Variance Equation**.
6. Finish with **Prediction Intervals** and **Predict at New Values**.

## References

<a id="ref-Gle1969a"></a>Glejser, H. (1969). A new test for heteroskedasticity. *Journal of the American Statistical Association* 64(325), 316–323. [doi:10.1080/01621459.1969.10500976](https://doi.org/10.1080/01621459.1969.10500976)

<a id="ref-Gre2018a"></a>Greene, W. H. (2018). *Econometric Analysis*, 8th ed. Pearson.

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

<a id="ref-HH1968a"></a>Hildreth, C. and Houck, J. P. (1968). Some estimators for a linear model with random coefficients. *Journal of the American Statistical Association* 63(322), 584–595. [doi:10.1080/01621459.1968.11009277](https://doi.org/10.1080/01621459.1968.11009277)

<a id="ref-Par1966a"></a>Park, R. E. (1966). Estimation with heteroscedastic error terms. *Econometrica* 34(4), 888. [doi:10.2307/1910108](https://doi.org/10.2307/1910108)

<a id="ref-RB1968a"></a>Rutemiller, H. C. and Bowers, D. A. (1968). Estimation in a heteroscedastic regression model. *Journal of the American Statistical Association* 63(322), 552–557. [doi:10.1080/01621459.1968.11009274](https://doi.org/10.1080/01621459.1968.11009274)

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
