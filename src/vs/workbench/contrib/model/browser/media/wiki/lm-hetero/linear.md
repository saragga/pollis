# Linear Variance Model

The linear model makes the error variance itself a linear function of the drivers. It is the most direct form in the panel and the one most exposed to negative fitted values.

## What the Linear Variance Model Computes

The **Linear** tab estimates a mean equation and an additive equation for sigma_i². Under FWLS the squared OLS residual stands in for the variance, since its expectation is the variance when beta is known. The idea of regressing squared residuals on variables appears in the random coefficients setting of [Hildreth and Houck (1968)](#ref-HH1968a), where the regressors enter the variance through their squares. In the panel, drivers enter as given, so squares have to be supplied in **Variance drivers (Z)** to obtain that form.

## What Formula the Linear Variance Model Uses

The form is sigma_i² = gamma_0 + z_i' gamma. The FWLS step is one regression:

e_i² = gamma_0 + z_i' gamma + error

Weights are the inverses of the fitted values. If any fitted value is zero or negative, `HARE.jl` stops with an error that gives the number of rows, as no weight exists for such a row. A value below 1e-6 of the mean fitted value counts as zero. Under **Maximum likelihood**, `Fminbox` starts from the FWLS fit, or from a constant variance if that fit has a value at or below zero or gamma_0 under 1e-8. gamma_0 has a lower bound of 1e-8, the other gamma are free, and the variance is held at 1e-10 during the search. The same error applies if a fitted variance is zero or negative at the optimum. The standard errors fall back on a pseudo-inverse if the inverted information matrix has a non-positive diagonal entry.

## Which Inputs the Linear Tab Uses

**Linear** reads **Regressors (X)**, **Response (y)** and **Variance drivers (Z)**. **Estimation** picks `linear_fwls`, `linear_ifwls` or `linear_mle`. With `nothing`, the drivers are X with an intercept. **Predict at New Values** evaluates the fitted line at **New variance drivers**, clipped at 1e-10, so a new row with a negative linear part gets a standard deviation of 1e-5 and a misleadingly tight interval.

## Where the Linear Variance Model Is Strong

Additive effects on the variance have a plain reading: each unit of a driver adds a set amount, in the squared units of y. Estimating gamma needs no distributional constant, so the FWLS means of e² are right for any error shape with finite variance. This form suits a variance built from separate sources, or with drivers that are shares or other bounded quantities, where fitted values stay comfortably above zero.

## Where the Linear Variance Model Misleads

Squared residuals are very noisy, and an outlier enters with its square, so gamma can be unstable. Negative fits are common with several drivers or a small baseline variance, and the error then points to **Exponential**, **Power** or OLS with robust standard errors. It usually means a straight line is the wrong form, but in a small or noisy sample the line can also cross zero by chance. **Compare Variance Models** lists **Linear** as not fitted in that case. The classical standard errors on gamma are rough, because the auxiliary regression has a strongly non-constant error variance.

## What to Compare the Linear Variance Model With

**Quadratic** offers a similar shape with less sensitivity to outliers. **Exponential** avoids the problem altogether. Under **Linear**, **Iterated FWLS** and **Maximum likelihood** can stop on data where **Two-step FWLS** runs, so a comparison of the three is a useful test of stability.

## References

<a id="ref-HH1968a"></a>Hildreth, C. and Houck, J. P. (1968). Some estimators for a linear model with random coefficients. *Journal of the American Statistical Association* 63(322), 584–595. [doi:10.1080/01621459.1968.11009277](https://doi.org/10.1080/01621459.1968.11009277)

## See Also

- [Factsheet](factsheet.md) · [Exponential](exponential.md) · [Power](power.md) · [Quadratic](quadratic.md) · [Decision Guide](decision-guide.md)
