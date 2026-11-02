# Prais-Winsten

The Prais-Winsten estimator is feasible generalised least squares for a regression with AR(1) errors. It keeps all T observations.

## What the Prais-Winsten Estimator Computes

Prais-Winsten estimates the error autocorrelation rho, transforms y and X so that the errors of the transformed system are uncorrelated with equal variance, and applies least squares. The method comes from [Prais and Winsten (1954)](#ref-PW1954a). It differs from the earlier procedure of [Cochrane and Orcutt (1949)](#ref-CO1949a) in one respect: the first period stays in the regression through a rescaled row. The returned coefficients apply to the original variables. Fitted values and residuals are also returned on the original scale.

## What Formula the Prais-Winsten Transform Uses

Given rho, the transformed rows are as follows.

- First row: y*_1 = sqrt(1 − rho²) y_1, and x*_1 = sqrt(1 − rho²) x_1, including the intercept column.
- Later rows: y*_t = y_t − rho y_(t−1), and x*_t = x_t − rho x_(t−1), including the intercept column.

Rho itself comes from residuals e_t as rho = sum e_t e_(t−1) / sum e_(t−1)², with t running from 2 to T. Standard errors are those of OLS on the transformed rows, s² (X*'X*)^(−1).

## Which Inputs the Prais-Winsten Tabs Use

**Prais-Winsten (2-Step)** calls `two_step_prais_winsten(Xm, yv)` and **Prais-Winsten (Iterated)** calls `iterated_prais_winsten(Xm, yv)`. Both read **Regressors (X)** without a column of ones, and **Response (y)**, in time order. The panel exposes no tuning option. In the iterated form, the package stops when rho changes by less than 1e-8, with at most 100 passes, and the printed result shows the number of iterations and whether it converged. The two-step form always reports converged, because it has nothing to converge.

## Where the Prais-Winsten Estimator Is Strong

The estimator keeps every period, which matters in short samples and with trended regressors, as the simulations of [Park and Mitchell (1980)](#ref-PM1980a) showed. It requires no distribution for the errors in large samples and needs only a closed-form calculation at each pass. The two-step form never has convergence issues. Both forms are also easy to explain, because each one reduces to least squares on visibly transformed data, which makes the transformed regression straightforward to audit.

## Where the Prais-Winsten Estimator Misleads

Its standard errors treat rho as known, so they understate uncertainty when rho is imprecise. The moment formula has no bounds: a value at or beyond one in absolute value produces a `DomainError`, as the first-row factor then has no real value. In short samples the moment estimate tends to lean towards zero, leaving part of the autocorrelation uncorrected. Iterating does not turn the method into maximum likelihood, as the moment formula omits the first-observation term of the likelihood. With a lagged dependent variable among the regressors, rho and beta are both inconsistent.

## What to Compare the Prais-Winsten Estimator With

**All AR(1) Estimators** sets both forms beside Cochrane-Orcutt, **Hildreth-Lu** and **Beach-MacKinnon**. A difference from Cochrane-Orcutt reveals the weight of the first observation, and a difference from **Beach-MacKinnon** suggests that the likelihood's stationarity term matters, as it can when rho is high. **Compare with OLS** shows what the correction changed compared with no correction. **Is AR(1) Enough?** then tests whether the transformation left dependence in the innovations.

## References

<a id="ref-CO1949a"></a>Cochrane, D. and Orcutt, G. H. (1949). Application of least squares regression to relationships containing auto-correlated error terms. *Journal of the American Statistical Association* 44(245), 32–61. [doi:10.1080/01621459.1949.10483290](https://doi.org/10.1080/01621459.1949.10483290)

<a id="ref-PM1980a"></a>Park, R. E. and Mitchell, B. M. (1980). Estimating the autocorrelated error model with trended data. *Journal of Econometrics* 13(2), 185–201. [doi:10.1016/0304-4076(80)90014-7](https://doi.org/10.1016/0304-4076(80)90014-7)

<a id="ref-PW1954a"></a>Prais, S. J. and Winsten, C. B. (1954). Trend estimators and serial correlation. Cowles Commission Discussion Paper.

## See Also

- [Factsheet](factsheet.md) · [Hildreth-Lu](hildreth-lu.md) · [Beach-MacKinnon](beach-mackinnon.md) · [Decision Guide](decision-guide.md)
