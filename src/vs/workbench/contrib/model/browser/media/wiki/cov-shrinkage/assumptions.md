# Assumptions

Regularised estimators need fewer conditions than a parametric model, but they still assume that rows are comparable and that the chosen structure is a sensible place to shrink towards. A failed assumption rarely gives an error, so the checks matter.

## Why Rows Should Be Independent Draws from One Distribution

All four tabs treat rows of **X (n × p)** as exchangeable draws with a single covariance. Dependence between rows, as in serially correlated returns, means there is less information than n suggests, so an estimator may shrink too little. A covariance that changes over time leaves an average of several regimes, which suits no period well. Check for this by estimating on separate periods and comparing them, and by looking at autocorrelation in each column. If dependence is strong, thin the data or model it first. **Held-Out Log-Likelihood** splits rows at random, so it cannot reveal a change over time.

## Why Scale Affects the Result

| Estimator | Dependence on scale |
|---|---|
| **Linear** with DiagonalCommonVariance | Pulls all variances to a common level, which only makes sense on one scale |
| **Linear** with ConstantCorrelation | Keeps each variance, and shrinks correlations |
| **Nonlinear** | Treats eigenvalues, which large-scale variables dominate |
| **Woodbury** | Its spikes follow large-scale variables |
| **Biweight** | Scales each column by its own median absolute deviation |

Standardise variables with different units, and record that the result is then in the standardised scale. If scale carries meaning, as with assets in one currency, keep it.

## What Linear Shrinkage Requires of Its Target

Shrinkage is helpful when the target describes broad features of the true covariance. With a target far from the truth, a good rule for the weight should give it little weight, though errors in estimating that weight remain. The optimal-weight results rest on finite fourth moments in [Ledoit and Wolf (2004)](#ref-LW2004a), so very heavy tails make the rule less reliable. The `:oas` and `:rblw` rules are derived for Gaussian data by [Chen, Wiesel, Eldar and Hero (2010)](#ref-CWEH2010a), and they accept only the DiagonalCommonVariance target.

## What Nonlinear and Woodbury Estimators Assume

**Nonlinear** keeps the sample eigenvectors and relies on theory for large p and n, so a very small p is outside its intended range. It cannot repair eigenvectors that are themselves poor. **Woodbury** assumes a few directions standing clear of a noise level, which suits data driven by factors. If eigenvalues decline smoothly with no clear gap, any choice of **Rank** is arbitrary, and **Eigenvalue Spectrum** shows that lack of a gap directly.

## What Biweight Assumes About Outliers

**Biweight** treats outliers as individual extreme values, measured column by column against each median. An outlying combination that looks ordinary in each column separately gets no down-weighting. Each entry is computed from a pair of columns, so the full matrix need not be positive definite, and **Conditioning** should be checked before inverting. A smaller **Tuning Constant c** also removes genuine tail values, which understates spread when tails are a real feature of the data.

## Why Held-Out Scores Have Limits

**Held-Out Log-Likelihood** and **Compare Estimators** use a Gaussian likelihood, so heavy-tailed data can score poorly under any estimate, and a few rows can dominate the mean. The sample covariance scores `-Inf` when it is singular on the fitting half. Rankings among estimators are often more useful than the levels, and a use that does not rest on a Gaussian density should be scored in its own terms.

## References

<a id="ref-CWEH2010a"></a>Chen, Y., Wiesel, A., Eldar, Y. C. and Hero, A. O. (2010). Shrinkage algorithms for MMSE covariance estimation. *IEEE Transactions on Signal Processing* 58(10), 5016–5029. [doi:10.1109/TSP.2010.2053029](https://doi.org/10.1109/TSP.2010.2053029)

<a id="ref-LW2004a"></a>Ledoit, O. and Wolf, M. (2004). A well-conditioned estimator for large-dimensional covariance matrices. *Journal of Multivariate Analysis* 88(2), 365–411. [doi:10.1016/S0047-259X(03)00096-4](https://doi.org/10.1016/S0047-259X(03)00096-4)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
