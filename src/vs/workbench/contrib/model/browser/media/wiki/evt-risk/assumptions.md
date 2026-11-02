# Assumptions

Risk figures from an extreme value fit depend on the tail model for every loss beyond the data. The conditions listed here decide whether a figure means what its label says, and some of them can be checked only in part.

## What Return Levels Assume About the Series of Block Maxima

The **Return Levels** tab treats the **Data series** as block maxima. The blocks must be long enough for the GEV limit to serve, and of equal length, so that one value stands for one period. Given every daily loss instead of maxima, the fit is misapplied, and the figure is then a level per observation that describes neither a year nor a month.

The tab cannot tell which it has received. The check is simple: confirm that the series has one value per block, and state the block length beside each return level. Short blocks add bias, since maxima of few observations are not yet near the limit. Long blocks leave few values and a wide fit.

## What Threshold Models Assume About the Choice of Threshold in Risk Estimates

**Peaks-Over-Threshold** and **Tail Risk** rely on excesses over **Threshold u** being close to GP. A threshold that is too low brings bias into every risk figure, and one that is too high makes them noisy. The panel does not test this, and the default of `quantile(losses, 0.9)` is not a verified choice. The default also names `losses`, so it needs rewriting when **Data series** names another variable.

Use the **Threshold Stability** step and the **QQ Plot** tab in the Extreme Value Diagnostics panel to examine the level. A risk figure that shifts widely with a small change of u is a sign that the fit is not settled.

## How Alpha Must Relate to the Exceedance Rate in the Tail Risk Tab

The VaR formula of the **Tail Risk** tab describes the region above u only. It needs **alpha (level)** under Nu/n, the exceedance rate.

| Relation of alpha to Nu/n | VaR from the formula | Meaning |
|---|---|---|
| Under Nu/n | Above u | Inside the GP tail, as intended |
| Equal to Nu/n | Equal to u | At the edge of the tail |
| Over Nu/n | Under u | Outside the fitted part, so not meaningful |

The code does not check the relation or warn. With the default threshold at the 90th percentile, the exceedance rate is about 0.10, so alpha must stay under that. An alpha smaller than 1/n is possible and then relies wholly on extrapolation.

## What Value the Shape Must Take for Expected Shortfall to Exist

ES under a GP tail is finite only for xi under 1. The formula (VaR + sigma − xi u) / (1 − xi) has no meaning at xi of 1 or more, yet the code contains no guard against it. An ES printed with a negative sign or an implausibly large size is therefore a reason to inspect **xi_hat** first.

The VaR formula divides by xi, so an estimate extremely close to 0 is numerically unstable, and the code has no separate branch for the exponential case. **Probability-Weighted Moments** also needs xi under 1, because its moments must exist. A shape near or above 1 means that averages of losses are unstable in any case, and a sample ES then says little.

## Why Unconditional Risk Measures Assume a Stable Series

The panel treats losses as draws from one distribution. Its figures therefore describe the long-run tail of the whole record, weighting calm and stressed periods by how often each occurred. They do not rise when volatility rises.

If losses cluster in time, as financial series do, the point estimates can stay usable, but their uncertainty is understated, and a figure for tomorrow requires a conditional model. [McNeil and Frey (2000)](#ref-MF2000a) fit a volatility model first and apply the tail model to its residuals, a step the panel does not perform. A trend or a structural break is a separate failure. Compare fits on separate periods to look for one.

## How Far Extreme Value Extrapolation Can Be Trusted

Return levels beyond the length of the record, and tail probabilities smaller than 1/n, rest on the fitted shape continuing to hold where no data exist. The interval on such a figure widens quickly with T, and even a wide interval covers only sampling error. An interval says nothing about a change in the process. The limit models give a reasoned basis for extrapolating, as [Coles (2001)](#ref-Col2001a) explains, but not a guarantee. Report the record length beside any extrapolated figure.

## References

<a id="ref-Col2001a"></a>Coles, S. (2001). *An introduction to statistical modeling of extreme values*. Springer London. [doi:10.1007/978-1-4471-3675-0](https://doi.org/10.1007/978-1-4471-3675-0)

<a id="ref-MF2000a"></a>McNeil, A. J. and Frey, R. (2000). Estimation of tail-related risk measures for heteroscedastic financial time series. *Journal of Empirical Finance* 7(3–4), 271–300. [doi:10.1016/S0927-5398(00)00012-8](https://doi.org/10.1016/S0927-5398(00)00012-8)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
