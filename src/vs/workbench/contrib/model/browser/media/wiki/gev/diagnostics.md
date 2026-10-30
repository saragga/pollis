# Diagnostics

The actions of the Generalized Extreme Value panel use the fit of the main code, by the estimation method chosen; with Bayesian Estimation, the fitted distribution is taken at the posterior means of the parameters.

## Fit Diagnostics
**Fit Diagnostics** draws two plots, with the plotting positions (i - 0.5) / n of the sorted maxima:
- **Probability Plot**: the fitted CDF of each maximum against its empirical probability. Points on the diagonal mean a good fit in the body.
- **Quantile Plot**: the fitted quantiles against the observed maxima. It shows the tail: the largest points bending away from the line mean the fitted tail is too light (above) or too heavy (below).
One or two points off the line at the top are common with few blocks; a systematic curve is a misfit.

## Return Level Plot
**Return Level Plot** draws the fitted return level against the return period, 2 to 500 blocks, on a log axis, with its 95% interval (delta method for Maximum Likelihood, bootstrap for Probability-Weighted Moments, credible for Bayesian), and the observed maxima at their empirical return periods. The shape of the curve shows xi: straight for Gumbel, curving up for Frechet, flattening toward the bound for Weibull. The data should lie within the band, and the band widens quickly beyond the length of the record.

## Interval of xi
The fit prints the 95% interval of xi. Whether it contains 0 decides whether the data distinguish the tail type at all, which **Tail Behaviour** reports.

## Comparing Methods
Fitting the same series with Maximum Likelihood, Probability-Weighted Moments and Bayesian Estimation, and running the actions after each, should give similar parameters and plots; a large difference in xi signals that the sample is too small to pin the tail down.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Probability plot | On the diagonal | S-shape |
| Quantile plot | Top points on the line | Systematic bend |
| Return levels | Data inside the band | Data outside |
| xi interval | Narrow enough to decide | Spans -0.5 to 0.5 |
| Methods | Agree | Differ in xi |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
