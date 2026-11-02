# Hildreth-Lu

The Hildreth-Lu tab estimates rho by trying a fixed list of values. It keeps the one that leaves the smallest residual sum of squares.

## What the Hildreth-Lu Estimator Computes

For each candidate rho, Hildreth-Lu quasi-differences y and X, fits least squares and records the residual sum of squares. The value of rho with the smallest sum and the coefficients from that regression form the estimate. The method needs no starting value and no iteration, and its objective is the same as that of a Cochrane-Orcutt iteration: the conditional sum of squares, without the first observation. The code does not refine the answer between grid points. It also computes no likelihood, so `result.loglik` is `NaN` for this tab.

## What Formula the Hildreth-Lu Search Uses

The panel uses the following steps.

- Candidates: 200 equally spaced values from −0.99 to 0.99, about 0.00995 apart.
- Transform for t from 2 to T: y*_t = y_t − rho y_(t−1), and x*_t = x_t − rho x_(t−1), including the intercept column.
- Objective: S(rho), the sum of squared residuals from OLS of y* on x*.
- Estimate: the candidate with the smallest S(rho), which is stored in `result.rss`.

Standard errors are those of the final regression, on T − 1 rows.

## Which Inputs the Hildreth-Lu Tab Uses

**Hildreth-Lu** calls `hildreth_lu(Xm, yv)` with **Regressors (X)**, without a column of ones, and **Response (y)**. Neither the grid nor its size is a panel input. The package has a keyword `nrho` for the number of points, which a user can pass by editing the generated code. The printed result reports 200 iterations, which counts grid points, and always reports convergence. Neither figure is evidence that the search found a good optimum.

## Where the Hildreth-Lu Estimator Is Strong

A grid has no starting value to get wrong, and it inspects the objective across the whole range. That protects against the several admissible minima which [Dufour, Gaudry and Liem (1980)](#ref-DGL1980a) showed can trap the Cochrane-Orcutt iteration. The rho stays within [−0.99, 0.99] even when the moment estimate of Prais-Winsten would fall outside the valid range. So **Hildreth-Lu** also serves as a check on whether the iterative tabs have settled on the lowest point of the conditional sum of squares.

## Where the Hildreth-Lu Estimator Misleads

The search covers −0.99 to 0.99 at a spacing of about 0.01, so it is global only up to that resolution. A narrow minimum can fall between points, and the reported rho cannot be more precise than the grid. A value of exactly −0.99 or 0.99 means that the search hit its edge and the true minimum may lie outside. The first row is always dropped, which costs information in short samples with trended regressors. Standard errors treat the selected rho as known and ignore the fact that it was searched for.

## What to Compare the Hildreth-Lu Estimator With

The closest relative is **Cochrane-Orcutt (iterated)** in **All AR(1) Estimators**, which aims at the same objective by iteration. A material gap between them points to several minima or to non-convergence. A difference from **Prais-Winsten (Iterated)** or **Beach-MacKinnon** often reflects the first observation instead. To see the shape of the objective, a user can run the transform over a list of values and plot S(rho), which the panel does not do.

## References

<a id="ref-DGL1980a"></a>Dufour, J.-M., Gaudry, M. J. I. and Liem, T. C. (1980). The Cochrane-Orcutt procedure: numerical examples of multiple admissible minima. *Economics Letters* 6(1), 43–48. [doi:10.1016/0165-1765(80)90055-5](https://doi.org/10.1016/0165-1765(80)90055-5)

## See Also

- [Factsheet](factsheet.md) · [Prais-Winsten](prais-winsten.md) · [Beach-MacKinnon](beach-mackinnon.md) · [Decision Guide](decision-guide.md)
