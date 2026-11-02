# Beach-MacKinnon (MLE)

The Beach-MacKinnon tab estimates a regression with AR(1) errors by exact maximum likelihood under normal errors, reduced to a search over rho.

## What the Beach-MacKinnon Estimator Computes

The likelihood covers all T observations and treats the first error as a draw from the stationary distribution of the process, as in [Beach and MacKinnon (1978)](#ref-BM1978a). For any fixed rho the best beta and error variance have closed forms, so the likelihood depends on rho alone. The code searches for the best rho, then runs one Prais-Winsten regression at that value for the coefficients and standard errors. Rho is the only quantity estimated by numerical search. Conditions on the errors are normality and a constant innovation variance.

## What Formula the Beach-MacKinnon Likelihood Uses

The code minimises the following function over rho in (−0.999, 0.999).

Q(rho) = (n/2) log(S(rho)/n) − (1/2) log(1 − rho²)

S(rho) is the residual sum of squares of least squares on the Prais-Winsten transformed data. The second term rises without limit as rho approaches one in absolute value, so the minimum stays inside the search range. The stored `result.loglik` equals −Q at the minimum, which leaves out the constant −(n/2)(1 + log 2π). The search uses Brent's method with an absolute tolerance of 1e-10.

## Which Inputs the Beach-MacKinnon Tab Uses

**Beach-MacKinnon** calls `beach_mackinnon(Xm, yv)` with **Regressors (X)**, without a column of ones, and **Response (y)** in time order. The panel offers no starting value or tolerance, and the search needs neither from the user. The printed result shows rho with its large-sample standard error, the coefficient table, and the log-likelihood value as stored. No Next Step reports `result.loglik` on its own, so it has to be read from the printed result or from the field itself.

## Where the Beach-MacKinnon Estimator Is Strong

Under normal errors the estimator uses all the information in the sample and imposes stationarity, so rho cannot leave the valid range. It returns a usable rho in the case where the moment formula of the Prais-Winsten tabs fails, namely when that formula passes one in absolute value. The objective has one parameter, so the search is quick. The likelihood value allows comparisons between fits to the same y, such as those required for a likelihood-ratio test of nested regressor sets.

## Where the Beach-MacKinnon Estimator Misleads

Brent's method looks for one local minimum, so it can miss another if Q(rho) has more than one, and the code does not examine the whole range. A rho close to ±0.999 indicates a boundary solution and should prompt a review of the specification, as trends or unit roots can produce one. Standard errors of beta come from the regression at the chosen rho, so they treat rho as known and do not use the full information matrix. Non-normal errors make the likelihood a working approximation. The log-likelihood printed for this tab should not be compared with a full likelihood from other software without adding the constant.

## What to Compare the Beach-MacKinnon Estimator With

**Prais-Winsten (Iterated)** uses the same transform but a moment formula for rho, and the two can drift apart at high rho, where the term in log(1 − rho²) gains weight. **Hildreth-Lu** gives an outside check on the objective for the case of several minima, despite its different treatment of the first row. In **All AR(1) Estimators**, a **Beach-MacKinnon** rho close to these others supports the result. **jarque_bera_p** in **Is AR(1) Enough?** reports whether normality looks tenable for the innovations.

## References

<a id="ref-BM1978a"></a>Beach, C. M. and MacKinnon, J. G. (1978). A maximum likelihood procedure for regression with autocorrelated errors. *Econometrica* 46(1), 51. [doi:10.2307/1913644](https://doi.org/10.2307/1913644)

## See Also

- [Factsheet](factsheet.md) · [Prais-Winsten](prais-winsten.md) · [Hildreth-Lu](hildreth-lu.md) · [Decision Guide](decision-guide.md)
