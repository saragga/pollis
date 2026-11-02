# Sequential Method

The **Sequential** tab removes the autocorrelation and then models the variance of what is left, using only least squares. HARE.jl calls it Sequential HARE, and each pass ends with a weighted regression.

## What the Sequential Estimator Computes in Each Step

| Step | Computation | Result |
|---|---|---|
| 1 | Fit OLS and regress its residuals on their lag, with no intercept: rho = sum(u_t u_(t-1)) / sum(u_(t-1)^2) | rho |
| 2 | Apply Prais-Winsten: y_t - rho y_(t-1) and x_t - rho x_(t-1), with the first row multiplied by sqrt(1 - rho^2) | Transformed y and X |
| 3 | Fit OLS on the transformed data, then regress log(residual^2) + 1.2704 on Z | gamma |
| 4 | Fit weighted least squares on the transformed data, with weights 1 / exp(z_t' gamma) | beta and its covariance matrix |

The transformation follows [Prais and Winsten (1954)](#ref-PW1954a), and the log regression follows [Harvey (1976)](#ref-Har1976a).

## How Two-Step and Iterated Work in the Sequential Tab

With **Two-Step**, `two_step_sequential` runs steps 1 to 4 once, and it always reports `converged` as true with one iteration. With **Iterated**, `iterated_sequential` computes a new rho from y - X beta after step 4 and goes back to step 2. It stops when beta and rho both change by less than 1e-8, or after 100 passes with `converged` false. No warning appears in that second case. Gamma is not part of the stopping rule. Step 3 always starts from an unweighted fit on the transformed data, so the weights of one pass do not feed into the residuals of the next.

## How Sequential Reads the Panel Inputs

**Covariate matrix (X)** and **Response vector (y)** enter the mean equation, with an intercept added by HARE.jl. **Variance regressors (Z) — optional** enters step 3 with its own intercept, and the default of `nothing` uses X with the intercept. **Method** selects the function. The tolerance and the iteration limit are keyword arguments, `tol` and `maxiter`, which can be added to the generated call. Because rows are read as periods, gaps in the series or a shuffled order would make rho meaningless, and the code does not detect either.

## What the Sequential Method Does Well

Every step is a linear regression, so no optimiser can stop early and there are no starting values to choose. The steps are also open to inspection: the residuals of any stage can be computed and plotted by hand. Each correction can be understood apart from the other, which helps when explaining a result. Under the model's conditions, rho and gamma are consistent, and the feasible estimator of beta has the same limiting distribution as GLS with known rho and gamma. That result concerns large samples and gives no assurance for a short series.

## Where the Sequential Method Misleads

Least squares on log squares loses information. The slopes of gamma have a variance with a factor of pi^2 / 2, about 4.93, where maximum likelihood under normality has a factor of 2, as [Harvey (1976)](#ref-Har1976a) showed. Rho also takes no account of the changing variance, so volatile periods count more in its estimate than they would in a weighted fit. The covariance matrix of beta treats rho and gamma as known, which understates uncertainty in small samples. `result.gamma_vcov` comes from the auxiliary regression and carries its own assumption of independent errors.

## What to Compare the Sequential Estimates With

**Joint** on the same data is the natural comparison, since it estimates the same parameters. Similar coefficients and standard errors give some reassurance, and large gaps call for a look at the residuals. Compare **Two-Step** with **Iterated** in **Sequential** to see how much the update of rho matters. **Compare with OLS** shows what the correction has changed. The separate panels for autocorrelation and for heteroskedasticity show whether a single correction would explain most of the change.

## References

<a id="ref-Har1976a"></a>Harvey, A. C. (1976). Estimating regression models with multiplicative heteroscedasticity. *Econometrica* 44(3), 461–465. [doi:10.2307/1913974](https://doi.org/10.2307/1913974)

<a id="ref-PW1954a"></a>Prais, S. J. and Winsten, C. B. (1954). Trend estimators and serial correlation. Cowles Commission Discussion Paper.

## See Also

- [Joint Method](joint.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
