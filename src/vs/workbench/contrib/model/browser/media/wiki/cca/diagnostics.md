# Diagnostics

A high canonical correlation is easy to produce with many variables, so the main task of diagnostics is to separate a real link from an artefact of the fit.

## How to Test Dimensions with Bartlett's Approximation

**Bartlett Test** runs a sequence of chi-squared tests, using classical correlations in every tab. The test for dimension j asks whether j and all later correlations are zero:

- chi2 = −(n − 1 − (p + q + 1) / 2) × log(product of (1 − r_i²) from i = j onwards)
- df = (p − j + 1)(q − j + 1)

Read from the first row, and stop at the first large p-value. [Bartlett (1941)](#ref-Bar1941a) gave this form, which relies on normality and large n. A significant test only says that a correlation is not zero, and says nothing about whether it matters.

## How to Set a Chance Level by Permutation

**vs Permuted Y** shuffles the rows of Y 100 times, refits a single dimension with the current tab's method, and reports the 95th percentile of the largest correlation, next to the one found. A found value well above this level suggests a real link. A value near it means that the first pair could easily be chance. Permutation needs no normality, but it requires rows that can be exchanged. With 100 shuffles the percentile is rough, so raise the number for a closer call. It tests only the first dimension.

## How to Detect Overfitting on Held-Out Rows

**Held-Out Correlations** fits on a random half of the rows and correlates the variates on the other half. Reported `test` values should be well above zero, and a big drop from `train` indicates overfitting. Note that `train` here is `rho`, from the full fit, and it does not come from the half used, so a part of the gap reflects the smaller fit. Each call uses a different random split, so repeat a few times. Use this action to choose **lambda (ridge)**: try several values, and keep the one with the best `test` figures.

## How Much Variance a Dimension Really Shares

**Redundancy Index** reports the share of Y's variance explained by each X variate, and the reverse. [Stewart and Love (1968)](#ref-SL1968a) proposed the index, because a high correlation between two variates may link only a small part of each block. The code averages squared correlations across the variables in the block. The two directions usually differ, and a large `rho` with a low redundancy means that a strong link exists between small parts of each set. Summing across dimensions gives a total, if the variates are uncorrelated.

## How to Look for Outliers and Curves

**Joint Embedding** plots the X variate against the Y variate for one dimension. Points should form a roughly straight cloud. A correlation driven by a few far points, or by separate clusters, shows at once. Groups in the data can create a high correlation with little relation inside each group, as the three cultivars in the Wine data may do. Change `j` in the code to look at later dimensions. A curve suggests that a transformation of a variable is needed. **Canonical Correlations** gives the matching bar chart of all dimensions at a glance.

## How to Check Stability of Weights

Refit on subsamples and compare the weights, up to a flip of sign, since a variate and its negative are equally good. Large swings show unstable directions. Compare **Canonical Coefficients** with **Structure Correlations**: if the two tell different stories, collinearity is likely to be at work. Move to **Regularised CCA** if so, as ridge shrinkage is aimed at that problem, and [Vinod (1976)](#ref-Vin1976a) proposed it for such ill-conditioned covariances. Different values of **k** should leave the first pairs unchanged, a further easy check of the code.

## References

<a id="ref-Bar1941a"></a>Bartlett, M. S. (1941). The statistical significance of canonical correlations. *Biometrika* 32(1), 29–37. [doi:10.1093/biomet/32.1.29](https://doi.org/10.1093/biomet/32.1.29)

<a id="ref-SL1968a"></a>Stewart, D. and Love, W. (1968). A general canonical correlation index. *Psychological Bulletin* 70(3), 160–163. [doi:10.1037/h0026143](https://doi.org/10.1037/h0026143)

<a id="ref-Vin1976a"></a>Vinod, H. D. (1976). Canonical ridge and econometrics of joint production. *Journal of Econometrics* 4(2), 147–166. [doi:10.1016/0304-4076(76)90010-5](https://doi.org/10.1016/0304-4076(76)90010-5)

## See Also

- [Assumptions](assumptions.md) · [CCA](cca.md) · [Interpretation](interpretation.md)
