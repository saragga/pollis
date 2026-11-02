# Overview — Linear Models with Autocorrelation

Regressions on time series often leave errors that resemble their own recent past. This panel treats the simplest such pattern, in which each error equals rho times the previous error plus fresh noise.

## Why Autocorrelated Errors Call for a Correction in Regression

When the regressors are strictly exogenous, ordinary least squares stays unbiased under autocorrelated errors, but it is no longer efficient and its classical standard errors are wrong. With positive rho and slowly moving regressors those standard errors are usually too small, so t statistics look better than they are. [Cochrane and Orcutt (1949)](#ref-CO1949a) studied this problem and proposed transforming the data before applying least squares. The correction changes how the data are weighted. It does not repair a regression that lacks a relevant variable or has the wrong functional form.

## How Quasi-Differencing Removes First-Order Autocorrelation

Subtracting rho times last period's equation from this period's equation gives y_t − rho y_(t−1) = (x_t − rho x_(t−1))' beta + v_t, and v_t has no first-order autocorrelation left. The slopes keep their original meaning, because beta is the same in both equations. Quasi-differencing leaves T − 1 equations, so the method of Cochrane and Orcutt loses the first period. [Prais and Winsten (1954)](#ref-PW1954a) kept that period by multiplying its row by sqrt(1 − rho²), which gives it the same error variance as the other rows.

## How the Prais-Winsten Tabs Estimate Rho

**Prais-Winsten (2-Step)** regresses y on X by OLS, computes rho from the residuals as sum e_t e_(t−1) / sum e_(t−1)², transforms the data and runs OLS once more. **Prais-Winsten (Iterated)** then recomputes rho from y − X b and repeats until rho moves by less than 1e-8, with at most 100 passes. The simulations of [Park and Mitchell (1980)](#ref-PM1980a) on trended regressors favoured keeping the first observation over dropping it, which is the reason for this transform when regressors trend.

## How the Hildreth-Lu Tab Searches for Rho

**Hildreth-Lu**, from [Hildreth and Lu (1960)](#ref-HL1960a), avoids iteration altogether. For each of 200 equally spaced values of rho from −0.99 to 0.99, the tab quasi-differences the data, drops the first observation and records the residual sum of squares. The value with the smallest sum is kept. A fixed grid cannot be trapped by a local minimum between its points, a hazard that [Dufour, Gaudry and Liem (1980)](#ref-DGL1980a) documented for the Cochrane-Orcutt iteration. The answer can sit only on a grid point, about 0.01 apart.

## How the Beach-MacKinnon Tab Uses the Likelihood

[Beach and MacKinnon (1978)](#ref-BM1978a) gave a full maximum likelihood procedure for regression with AR(1) errors under normality, including the first observation. **Beach-MacKinnon** concentrates beta and the error variance out of that likelihood and searches over rho alone with Brent's method. The term −(1/2) log(1 − rho²) in the likelihood keeps the answer strictly inside the unit interval. Coefficients come from one Prais-Winsten regression at the chosen rho.

## A Common Workflow for AR(1) Regression in the Panel

1. Run **Serial Correlation Tests** and **ACF and PACF** to see whether a correction is needed and whether AR(1) is a plausible form.
2. Fit a tab, usually **Prais-Winsten (Iterated)** or **Beach-MacKinnon**.
3. Read **Is AR(1) Enough?** and the innovation panel of **ACF and PACF**.
4. Set the correction against the uncorrected fit with **Compare with OLS**, and test sensitivity with **All AR(1) Estimators**.
5. Read **Coefficients** and **Autocorrelation Strength**, then use **Forecast** with real values in **Future regressors**.

## References

<a id="ref-BM1978a"></a>Beach, C. M. and MacKinnon, J. G. (1978). A maximum likelihood procedure for regression with autocorrelated errors. *Econometrica* 46(1), 51. [doi:10.2307/1913644](https://doi.org/10.2307/1913644)

<a id="ref-CO1949a"></a>Cochrane, D. and Orcutt, G. H. (1949). Application of least squares regression to relationships containing auto-correlated error terms. *Journal of the American Statistical Association* 44(245), 32–61. [doi:10.1080/01621459.1949.10483290](https://doi.org/10.1080/01621459.1949.10483290)

<a id="ref-DGL1980a"></a>Dufour, J.-M., Gaudry, M. J. I. and Liem, T. C. (1980). The Cochrane-Orcutt procedure: numerical examples of multiple admissible minima. *Economics Letters* 6(1), 43–48. [doi:10.1016/0165-1765(80)90055-5](https://doi.org/10.1016/0165-1765(80)90055-5)

<a id="ref-HL1960a"></a>Hildreth, C. and Lu, J. Y. (1960). Demand relations with autocorrelated disturbances. Technical Bulletin 276, Michigan State University Agricultural Experiment Station.

<a id="ref-PM1980a"></a>Park, R. E. and Mitchell, B. M. (1980). Estimating the autocorrelated error model with trended data. *Journal of Econometrics* 13(2), 185–201. [doi:10.1016/0304-4076(80)90014-7](https://doi.org/10.1016/0304-4076(80)90014-7)

<a id="ref-PW1954a"></a>Prais, S. J. and Winsten, C. B. (1954). Trend estimators and serial correlation. Cowles Commission Discussion Paper.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
