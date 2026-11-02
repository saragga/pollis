# Diagnostics

The checks in the panel come in two kinds: tests of constant variance on OLS residuals, and checks of the fitted variance form after estimation.

## How to Test for Heteroskedasticity Before Weighting a Regression

**Heteroskedasticity Tests** reports four p-values on OLS residuals. **harvey_p** and **glejser_p** use **Variance drivers (Z)**, while **breusch_pagan_p** and **white_p** always use X. The first reflects [Harvey (1976)](#ref-Har1976a), the second [Glejser (1969)](#ref-Gle1969a). **breusch_pagan_p** is the n R² form of [Koenker (1981)](#ref-Koe1981a), which adapts the test of [Breusch and Pagan (1979)](#ref-BP1979a) to non-normal errors. **white_p** follows [White (1980)](#ref-Whi1980a), adding squares and cross-products of X. Small p-values reject constant variance. A large p-value only says that these tests, on these drivers, found nothing. A wrong mean equation can also produce small p-values.

## How to Read the Residual Spread of a Variance Model

**Residual Spread** plots absolute residuals against fitted values, with the line sqrt(2/pi) sigma_i, which is the expected absolute residual under normal errors. A line that rises and falls with the points suggests a suitable form. A fan that outgrows the line suggests a variance that increases faster than the form allows. When Z differs from X, the line can look jagged because sigma_i is no longer a function of the fitted value alone. That shape alone is no defect.

## How to Read Standardised Residuals in Heteroskedastic Regression

**Standardised Residuals** divides each residual by sigma_i and plots the result against fitted values, with lines at −2, 0 and 2. A good fit gives a band of even width around zero, with about one point in twenty beyond the outer lines if errors are near normal. A fan or funnel means the form has not captured the pattern. A curve in the band points to the mean equation. Isolated extreme points can indicate outliers or rows whose fitted variance was clipped.

## How to Test Whether the Variance Model Captured the Pattern

**Remaining Heteroskedasticity** regresses squared standardised residuals on a constant and the drivers. A small **breusch_pagan_standardised_p** means a pattern remains. For **Power**, the test uses the drivers themselves and not their logarithms. **sd_standardised** should lie near one. A value well away from one means the scale of the variance equation is off, which can come from non-normal errors under FWLS. **jarque_bera_p** uses the test of [Jarque and Bera (1987)](#ref-JB1987a) on the standardised residuals, and a small value warns against trusting 1.96 intervals.

## How to Check the Coverage of Heteroskedastic Prediction Intervals

**Prediction Intervals** draws a ribbon of 1.96 sigma_i around the fitted values and reports **coverage_model** and **coverage_constant_width**. Both are in-sample shares of residuals inside the band, so they flatter the model. Coverage near 0.95 is the aim. Aggregate coverage can look fine for both, since a constant-width band may overcover quiet regions and undercover noisy ones. Read the ribbon too, as it shows where points escape. Use a held-out set for a genuine test, which the panel does not run for you.

## How to Rank Variance Forms with Compare Variance Models

**Compare Variance Models** fits all four forms by two-step FWLS and sorts them by the criterion of [Akaike (1974)](#ref-Aka1974a). The normal likelihood is evaluated at the FWLS estimates, not maximised, so the ranking is approximate. **Linear** and **Quadratic** can be penalised heavily through clipped rows. A difference of a few units is weak evidence. When forms score closely, prefer the one that is easiest to defend, as the coefficients usually differ little. The step ignores the **Estimation** input.

## How to Spot Unreliable FWLS Standard Errors

Under **Two-step FWLS** and **Iterated FWLS**, the standard errors depend on the units of y. `GLM.jl` treats the weights as frequency weights, with sum(w) − k residual degrees of freedom, and sum(w) grows or shrinks with the scale of y. **weighted_se** in **Compare with OLS** can then be far too large or too small, and `Inf` once sum(w) falls to k or lower. As a check, compute `sum(1 ./ variance(Zv))`: a value far from n signals the problem. Refit with **Maximum likelihood** to compare.

## References

<a id="ref-Aka1974a"></a>Akaike, H. (1974). A new look at the statistical model identification. *IEEE Transactions on Automatic Control* 19(6), 716–723. [doi:10.1109/tac.1974.1100705](https://doi.org/10.1109/tac.1974.1100705)

<a id="ref-BP1979a"></a>Breusch, T. S. and Pagan, A. R. (1979). A simple test for heteroscedasticity and random coefficient variation. *Econometrica* 47(5), 1287. [doi:10.2307/1911963](https://doi.org/10.2307/1911963)

<a id="ref-Gle1969a"></a>Glejser, H. (1969). A new test for heteroskedasticity. *Journal of the American Statistical Association* 64(325), 316–323. [doi:10.1080/01621459.1969.10500976](https://doi.org/10.1080/01621459.1969.10500976)

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

<a id="ref-JB1987a"></a>Jarque, C. M. and Bera, A. K. (1987). A test for normality of observations and regression residuals. *International Statistical Review / Revue Internationale de Statistique* 55(2), 163. [doi:10.2307/1403192](https://doi.org/10.2307/1403192)

<a id="ref-Koe1981a"></a>Koenker, R. (1981). A note on studentizing a test for heteroscedasticity. *Journal of Econometrics* 17(1), 107–112. [doi:10.1016/0304-4076(81)90062-2](https://doi.org/10.1016/0304-4076(81)90062-2)

<a id="ref-Whi1980a"></a>White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. *Econometrica* 48(4), 817–838. [doi:10.2307/1912934](https://doi.org/10.2307/1912934)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
