# Decision Guide — Linear Models with Autocorrelation

The four tabs usually give close answers in long samples with moderate rho. The choice starts to matter when samples are short, rho is high or regressors trend.

## Which AR(1) Tab Fits Which Situation

| Situation | Tab | Why |
|---|---|---|
| Long sample and moderate rho, with a quick answer wanted | **Prais-Winsten (2-Step)** | One pass that keeps the first observation |
| Short sample or an imprecise first-stage rho | **Prais-Winsten (Iterated)** | Rho and the coefficients are updated until rho settles |
| Fear of a local optimum in the iteration | **Hildreth-Lu** | Fixed grid over rho, with a resolution of about 0.01 and without the first observation |
| Rho high or a likelihood value wanted | **Beach-MacKinnon** | Exact likelihood under normal errors, which holds rho inside the interval |
| Moment estimate of rho at or beyond one | **Beach-MacKinnon** or **Hildreth-Lu**, after reviewing the specification | The Prais-Winsten tabs stop with an error in that case |

## Whether a Regression Needs an AR(1) Correction at All

Start from **Serial Correlation Tests** and the correlograms. A small p-value says that residuals are correlated, and not why. Autocorrelation frequently signals an omitted variable, an unmodelled trend, a level shift or a dynamic effect, and adding that term to the model is a better remedy than correcting the errors. A correction then only hides the omission. If the coefficients are the interest and exogeneity is doubtful, keep the OLS estimates in view through **Compare with OLS**. GLS can be more sensitive to violations of exogeneity because it uses leads and lags of the regressors.

## Whether to Keep the First Observation in AR(1) Estimation

The Prais-Winsten and **Beach-MacKinnon** tabs keep the first row and **Hildreth-Lu** drops it. In a long sample the difference is small. In a short sample with trended regressors, one row can hold a good share of the information about the trend coefficients, since quasi-differencing removes most of the variation of the other rows when rho is high ([Park and Mitchell (1980)](#ref-PM1980a)). Those are the conditions in which **Hildreth-Lu** deserves least weight. The Cochrane-Orcutt lines in **All AR(1) Estimators** show the effect of the first row directly.

## How to Choose Between Two-Step, Grid and Likelihood Estimation of Rho

Iteration costs little in the panel, so **Prais-Winsten (Iterated)** suits most uses, but its convergence does not make its inference exact, since standard errors still condition on rho. **Hildreth-Lu** answers the worry about several minima, at the cost of the first row and a coarse grid. **Beach-MacKinnon** includes the first row and a stationarity term, and it provides `result.loglik`, which leaves out the constant −(n/2)(1 + log 2π). Differences in that value between fits on the same y are still meaningful. No tab here corrects the conditioning of standard errors on rho.

## When to Leave the Autocorrelation Panel for Another Approach

With lagged y among the regressors, the panel's estimators are inconsistent under autocorrelated errors, so a dynamic model or instrumental variables are the routes to consider. A changing error variance points to **Linear Models with Heteroskedasticity + AR(1)**. Dependence beyond one lag, or doubt about its form, points to OLS with standard errors of [Newey and West (1987)](#ref-NW1987a), which the panel does not compute. Unit roots in y and X call for differencing or a cointegration analysis, and not a value of rho close to one.

## References

<a id="ref-NW1987a"></a>Newey, W. K. and West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. *Econometrica* 55(3), 703–708. [doi:10.2307/1913610](https://doi.org/10.2307/1913610)

<a id="ref-PM1980a"></a>Park, R. E. and Mitchell, B. M. (1980). Estimating the autocorrelated error model with trended data. *Journal of Econometrics* 13(2), 185–201. [doi:10.1016/0304-4076(80)90014-7](https://doi.org/10.1016/0304-4076(80)90014-7)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
