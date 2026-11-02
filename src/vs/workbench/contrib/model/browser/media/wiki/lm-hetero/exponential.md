# Exponential Variance Model

The exponential model makes the log of the error variance linear in the drivers, so every unit of a driver multiplies the variance by a constant factor.

## What the Exponential Variance Model Computes

The **Exponential** tab estimates a mean equation and a log-variance equation, following [Harvey (1976)](#ref-Har1976a). Weights equal the inverse of the fitted variance. Since the fitted variance is an exponential, it cannot be negative or zero, and no clipping is needed. Harvey's model is also the variance equation in the joint and sequential estimators of **Linear Models with Heteroskedasticity + AR(1)**, so results in the two panels can be set side by side when errors are independent.

## What Formula the Exponential Variance Model Uses

The variance form is sigma_i² = exp(gamma_0 + z_i' gamma). Under FWLS, with OLS residual e_i, the auxiliary regression is:

log(e_i²) + 1.2704 = gamma_0 + z_i' gamma + error

The constant 1.2704 removes the mean of the log of a chi-squared variable with one degree of freedom, on the assumption of normal errors. It alters only gamma_0. Weights are w_i = exp(−gamma_0 − z_i' gamma). Under **Maximum likelihood**, beta and gamma maximise the normal likelihood jointly.

## Which Inputs the Exponential Tab Uses

**Exponential** reads **Regressors (X)**, **Response (y)** and **Variance drivers (Z)**. With `nothing` as drivers, the code uses X with an intercept. **Estimation** selects `exponential_fwls`, `exponential_ifwls` or `exponential_mle`. Drivers may be negative or zero, as they enter linearly in the exponent. **New regressors** and **New variance drivers** feed **Predict at New Values**, where the fitted variance is exp.(hcat(1, Z) gamma). Positive variance is built in, since an exponential cannot be negative.

## Where the Exponential Variance Model Is Strong

Positivity holds without any clipping, so no row can get an absurd weight from a negative fit, and the auxiliary regression has a nearly constant error variance under normal errors. The slopes have a simple reading as proportional effects. The form also accepts any real-valued driver, which makes **Exponential** a sensible default if theory offers no form. Its likelihood is smooth, which suits the warm-started L-BFGS search of `exponential_mle`.

## Where the Exponential Variance Model Misleads

Exponential growth is steep. A driver with an extreme value receives a very large fitted variance, and thus almost no weight, even when the true spread levels off. The logarithm of a near-zero residual is a large negative number, so a handful of tiny residuals can pull gamma in FWLS. Non-normal errors shift gamma_0 and so all fitted variances, which distorts prediction intervals.

## What to Compare the Exponential Variance Model With

**Compare Variance Models** ranks **Exponential** against the other forms using two-step FWLS. **Power** is the closest alternative for a positive size variable, since it uses log z in place of z. **Maximum likelihood** provides a check on FWLS, as a large gap in gamma suggests small residuals are driving the auxiliary regression. **white_se** in **Compare with OLS** gives inference on the OLS slopes that assumes no variance form at all.

## References

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

## See Also

- [Factsheet](factsheet.md) · [Power](power.md) · [Quadratic](quadratic.md) · [Linear](linear.md) · [Decision Guide](decision-guide.md)
