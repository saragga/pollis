# Interpretation

The panel reports two equations, one for the mean of y and one for its spread. Each has its own standard errors and its own traps.

## How to Read the Weighted Coefficients of a Heteroskedastic Regression

**Coefficients** lists **estimate**, **std_error**, **t**, **p**, **lower95** and **upper95** for the mean equation. Each slope is the change in the mean of y per unit of the regressor, as in OLS, because the weights change precision and not the meaning of beta. Under **Maximum likelihood** the standard errors come from the inverse observed information. They depend on the normal likelihood and on the variance form being right ([White (1982)](#ref-Whi1982a)). A weighted estimate far from the OLS one is a warning about the specification and should not be read as a better estimate.

## Why FWLS Standard Errors Change with the Units of y

**std_error** under **Two-step FWLS** and **Iterated FWLS**, and **weighted_se** in **Compare with OLS**, use the frequency-weight degrees of freedom of `GLM.jl`, and **t**, **p** and the interval columns inherit the error through **std_error**. With sum(w) well under n, as when y has large units, the standard errors are too large. With sum(w) well over n, they are too small. Coefficients are unaffected. For standard errors that do not change with units, use **Maximum likelihood**, or run `using LinearAlgebra; X1 = hcat(ones(length(yv)), Xm); sqrt.(diag(inv(X1' * (X1 ./ variance(Zv)))))`.

## How to Read the Variance Equation in Each Tab

**Variance Equation** lists each gamma with **std_error**, **p** from the normal distribution and **meaning**. The step uses `diag`, which it does not load, so run `using LinearAlgebra` if it stops on that name.

| Tab | Meaning of the intercept | Meaning of a slope g |
|---|---|---|
| **Exponential** | Log of the baseline variance | Each unit of z multiplies the variance by exp(g) |
| **Power** | Log of the baseline variance | A 1% rise in abs(z) raises the variance by about g% |
| **Quadratic** | Baseline standard deviation | Each unit of z adds g to the standard deviation |
| **Linear** | Baseline variance | Each unit of z adds g to the variance |

## How Far to Trust the Standard Errors of the Variance Equation

Under FWLS the standard errors of gamma come from classical least squares on the auxiliary regression. For **Exponential** and **Power**, the log of a squared normal error has constant variance, so that calculation is reasonable under normal errors. For **Quadratic** and **Linear**, the auxiliary errors are themselves heteroskedastic, so those figures are rough and the tests based on them unreliable. Under **Maximum likelihood** they come from the observed information. A small **p** on a slope says the variance depends on that driver, and nothing about whether the mean does.

## How to Read Compare with OLS in a Heteroskedastic Regression

**Compare with OLS** lists **ols**, **ols_se**, **white_se**, **weighted** and **weighted_se** by term. **white_se** is the HC1 form of the estimator of [White (1980)](#ref-Whi1980a) and applies to the OLS coefficients. A gap between **ols_se** and **white_se** measures how far heteroskedasticity disturbs classical inference for OLS. **weighted_se** belongs to a different estimator, and under FWLS it carries the unit problem of `GLM.jl`, so a smaller value is not by itself a gain in precision.

## How to Read Predictions at New Values

**Predict at New Values** gives **prediction**, **sd**, **lower95** and **upper95** for each row of **New regressors**. **sd** is the fitted error standard deviation at the new drivers, and the interval is 1.96 times that around the prediction. Uncertainty in beta and gamma is ignored, so intervals are too narrow, most of all far from the data. When **Variance drivers (Z)** was set, supply **New variance drivers**, because leaving it as `nothing` evaluates the variance at the new regressors instead, or stops on a size mismatch if Z and X have different numbers of columns.

## References

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

<a id="ref-Whi1982a"></a>White, H. (1982). Maximum likelihood estimation of misspecified models. *Econometrica* 50(1), 1–25. [doi:10.2307/1912526](https://doi.org/10.2307/1912526)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
