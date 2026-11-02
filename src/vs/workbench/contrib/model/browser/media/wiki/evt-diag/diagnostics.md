# Diagnostics

The Next Steps of the Extreme Value Diagnostics panel are **Mean Excess Plot** and **Hill Estimator Plot** under Diagnose, and **Threshold Stability** under Interpret. All three bear on the threshold. None of them is a formal test, and a good result is a stretch of the plot that agrees with other evidence.

## How to Use the Mean Excess Plot to Find a Threshold

**Mean Excess Plot** draws the sample mean excess over a grid of **Grid points** thresholds. Unlike the **Mean Excess** tab, the action uses a fixed upper limit at the 95th percentile and a fixed minimum of 10 exceedances, so it ignores **Upper pct** and **Min obs**.

A good result is a plot that becomes roughly straight above some threshold. Take the lowest threshold where the line begins, which keeps the most excesses. A bad result is a plot with no straight part, or a straight part defined by a few erratic points at the right. The right-hand points average few losses and are noisy, so they deserve little weight. If the plot stays curved, compare it with **Threshold Stability** and report the doubt. `mrlplot(y)` in Extremes.jl draws a mean residual life curve with a confidence band.

## How to Read a Stable or Unstable Hill Estimator Plot

**Hill Estimator Plot** draws the same curve as the **Hill Plot** tab without the printed values. A good result is a flat stretch over a wide range of k, away from the small k where noise dominates. A curve that drifts steadily with k suggests that the tail is not purely Pareto-type, and then no value on the curve is a safe estimate.

Reading the curve on a linear scale of k can mislead, because the range of k that matters is often at the left. [Drees, Resnick and de Haan (2000)](#ref-DRH2000a) proposed plotting against a logarithmic scale, which they find more revealing unless the data are Pareto. The action caps k at 200, so with a long series the curve covers only a small share of the sample. To see more, change the cap in the code.

## How to Judge Threshold Stability from the Printed Table

**Threshold Stability** fits a GP by maximum likelihood at the 70th, 75th, 80th, 85th and 90th percentiles, skipping any with 10 or fewer excesses. It always uses maximum likelihood, and prints u, **xi_hat**, the modified scale sigma − xi u, and n. The output is text, not a plot.

A good result has **xi_hat** and the modified scale roughly constant from some threshold upward, within what the shrinking n allows. Choose the lowest such threshold. A steady change at every level suggests a higher threshold is needed, and the fixed grid may stop short of it. The action prints no intervals, so small changes cannot be told from noise. To obtain intervals, use `cint(fm)` on each fit, or rerun the loop at other percentiles.

## How to Read the Fit Figures of the QQ Plot Tab

The **QQ Plot** tab prints two summaries of how far the points lie from the 45-degree line. The QQ correlation is near 1 for a straight plot, but it ignores a shift or a wrong slope, and it is high for most sorted samples. The QQ RMSE over the standard deviation gives the deviation in units of the data's spread, and so does respond to a shift or slope.

A good result has points along the line, including the largest few. Points that bend upward at the right mean that the data have a heavier tail than the fit, and a downward bend means a lighter one. Neither summary is a test, and the code computes no p-value. `qqplotci(fm)` in Extremes.jl adds a confidence band to the plot, which helps to separate a real bend from the scatter expected at the extreme points.

## What to Do When Extreme Value Checks Are Missing from the Panel

| Concern | Check available outside the panel's Next Steps |
|---|---|
| Clustering of large losses | Plot exceedance times; group them with `getcluster(y, u)` and fit the cluster peaks |
| Change over time | Repeat the tabs on separate periods and compare the fits |
| Uncertainty of the shape | `cint(fm)` on the fitted model |
| Other views of the fit | `probplot(fm)`, `returnlevelplot(fm)` and `diagnosticplots(fm)` in Extremes.jl |
| Out-of-sample fit | Fit on an early part of the series and compare with the later losses |

The Extremes.jl plotting functions draw with Gadfly, not with the Plots.jl used by the panel.

## References

<a id="ref-DRH2000a"></a>Drees, H., Resnick, S. and de Haan, L. (2000). How to make a Hill plot. *The Annals of Statistics* 28(1), 254–274. [doi:10.1214/aos/1016120372](https://doi.org/10.1214/aos/1016120372)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
