# Quadratic Variance Model

The quadratic model makes the error standard deviation linear in the drivers. The variance is then the square of a linear function.

## What the Quadratic Variance Model Computes

The **Quadratic** tab estimates a mean equation and a linear equation for sigma_i. Absolute residuals, which are on the same scale as the standard deviation, serve as the data for that equation. The approach draws on the test of [Glejser (1969)](#ref-Gle1969a), which regressed absolute residuals on candidate variables, and on the regression of [Rutemiller and Bowers (1968)](#ref-RB1968a), whose standard deviation is linear in a covariate. The name refers to the variance, and the regression for sigma_i itself is linear in z with no squared terms in the drivers.

## What Formula the Quadratic Variance Model Uses

The form is sigma_i = gamma_0 + z_i' gamma, with the variance equal to its square. Under FWLS the auxiliary regression is:

abs(e_i) = a_0 + z_i' a + error

The code multiplies the estimates by sqrt(pi/2), about 1.2533, because the mean absolute value of a normal error is sigma_i sqrt(2/pi). The covariance of gamma is scaled by pi/2. Weights are 1/sigma_i². If any fitted sigma_i is zero or negative, `HARE.jl` stops with an error that gives the number of rows, under FWLS and **Maximum likelihood** alike. A value below 1e-6 of the mean fitted value counts as zero.

## Which Inputs the Quadratic Tab Uses

**Quadratic** reads **Regressors (X)**, **Response (y)** and **Variance drivers (Z)**, and any real drivers are allowed. With `nothing`, the drivers are X with an intercept. **Estimation** selects `quadratic_fwls`, `quadratic_ifwls` or `quadratic_mle`. The panel's helper `variance(Z)` returns the square of max(Z1 gamma, 1e-8), where `Z1` adds a column of ones, and **Predict at New Values** evaluates it at **New variance drivers**.

## Where the Quadratic Variance Model Is Strong

Absolute residuals are less sensitive to outliers than squares and, unlike the logarithm, are not thrown off by tiny residuals. So the FWLS step of **Quadratic** tends to be stable in small samples. Its slopes have the units of y per unit of the driver, which makes them easy to explain. Growth of the variance is moderate compared with **Exponential**, and the form suits data in which spread rises in a straight line, a common pattern with size variables.

## Where the Quadratic Variance Model Misleads

Nothing keeps gamma_0 + z_i' gamma positive. If it reaches zero the fit stops with an error, which usually means a straight line is the wrong form, though in a small or noisy sample the line can also cross zero by chance. A spread that falls and then rises again with z is not captured either, since a straight line cannot bend. The constant sqrt(pi/2) assumes normal errors, and heavier tails distort the scale of sigma_i. Since abs(e) has non-constant variance, the classical standard errors of gamma are rough.

## What to Compare the Quadratic Variance Model With

**Linear** is the natural alternative, modelling the variance in place of the standard deviation. A comparison with **Power**, on a single positive driver, shows whether an exponent near 2 is supported. **sd_standardised** in **Remaining Heteroskedasticity** shows whether the scale looks right. **Compare Variance Models** includes **Quadratic**, and lists it as not fitted if a fitted sigma_i reaches zero.

## References

<a id="ref-Gle1969a"></a>Glejser, H. (1969). A new test for heteroskedasticity. *Journal of the American Statistical Association* 64(325), 316–323. [doi:10.1080/01621459.1969.10500976](https://doi.org/10.1080/01621459.1969.10500976)

<a id="ref-RB1968a"></a>Rutemiller, H. C. and Bowers, D. A. (1968). Estimation in a heteroscedastic regression model. *Journal of the American Statistical Association* 63(322), 552–557. [doi:10.1080/01621459.1968.11009274](https://doi.org/10.1080/01621459.1968.11009274)

## See Also

- [Factsheet](factsheet.md) · [Exponential](exponential.md) · [Power](power.md) · [Linear](linear.md) · [Decision Guide](decision-guide.md)
