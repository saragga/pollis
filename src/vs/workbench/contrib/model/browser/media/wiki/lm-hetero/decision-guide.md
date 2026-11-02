# Decision Guide

Two choices shape every fit in the panel: the form of the variance and the way it is estimated. A third comes first, namely whether to model the variance at all.

## Which Variance Tab Fits Which Situation

| Situation | Tab | Why |
|---|---|---|
| Spread grows multiplicatively with the drivers, or no form is favoured by theory | **Exponential** | Log variance is linear in z, and the variance is always positive |
| Variance scales with a power of a non-zero size variable | **Power** | Slopes are elasticities of the variance |
| Standard deviation grows in a straight line with z | **Quadratic** | Sigma is linear in z and fitted from absolute residuals |
| Variance itself is additive in z, with fitted values well above zero | **Linear** | The form is direct, but it needs clipping when a fit falls to zero |
| Drivers contain zeros, such as dummies | **Exponential** rather than **Power** | The logarithm in **Power** needs non-zero values |

## Whether to Model the Variance or Only Correct the Standard Errors

Consider leaving the coefficients alone when the aim is valid inference on OLS and no variance form has support. **white_se** in **Compare with OLS** gives that inference without assuming any form, as [White (1980)](#ref-Whi1980a) showed for large samples. Model the variance when the form is credible, when the efficiency gain matters, or when the prediction intervals need to follow the spread. [Romano and Wolf (2017)](#ref-RW2017a) argue for a combination, weighted fits with robust errors, which the panel leaves to the user.

## How to Choose Between FWLS and Maximum Likelihood for Heteroskedastic Regression

**Maximum likelihood** gives standard errors that do not depend on the units of y, and it is efficient if errors are normal and the form is right. It is more sensitive to a small misspecification of the variance form, as [Carroll and Ruppert (1982)](#ref-CR1982a) showed for variances tied to the regression parameter. **Two-step FWLS** and **Iterated FWLS** need no optimiser, but their coefficient standard errors follow the frequency-weight rule of `GLM.jl` and change with the scale of y. Use FWLS for the coefficients when the optimiser struggles, and take their standard errors from the hand calculation with `variance(Zv)` or compare them with the likelihood fit.

## How to Choose Variance Drivers for a Heteroskedastic Regression

Leaving **Variance drivers (Z)** at `nothing` uses every regressor, which spends degrees of freedom on variables that may not affect the spread, and with **Power** zeros are clipped and give meaningless exponents. Choosing a few drivers on substantive grounds gives a simpler, more stable equation. Scale variables, such as firm size or population, are common candidates. Choosing drivers after seeing many test results raises the chance of a spurious pattern. Keep in mind that **breusch_pagan_p** and **white_p** ignore this input.

## When to Leave the Heteroskedasticity Panel for Another Approach

Time-ordered data with correlated errors belong in **Linear Models with Heteroskedasticity + AR(1)**, where the variance form is exponential. A variance that depends on its own past, as in financial returns, calls for a volatility model, since the drivers here are given variables and not past shocks. Heavy tails may call for a transformation of y or a regression with non-normal errors, and a log transform may also remove the heteroskedasticity on its own. Group-specific variances are not available through any tab in the panel.

## References

<a id="ref-CR1982a"></a>Carroll, R. J. and Ruppert, D. (1982). A comparison between maximum likelihood and generalized least squares in a heteroscedastic linear model. *Journal of the American Statistical Association* 77(380), 878–882. [doi:10.1080/01621459.1982.10477901](https://doi.org/10.1080/01621459.1982.10477901)

<a id="ref-RW2017a"></a>Romano, J. P. and Wolf, M. (2017). Resurrecting weighted least squares. *Journal of Econometrics* 197(1), 1–19. [doi:10.1016/j.jeconom.2016.10.003](https://doi.org/10.1016/j.jeconom.2016.10.003)

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
