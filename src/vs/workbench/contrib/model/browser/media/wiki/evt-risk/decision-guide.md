# Decision Guide

The tabs of the Extreme Value Risk Measures panel answer different questions about rare losses, so the choice starts from the question. The inputs that follow it, such as the threshold, the return period and alpha, often move the figures more than the choice of tab does.

## Which Extreme Value Risk Tab Answers Which Question

| Situation | Tab | Why |
|---|---|---|
| The loss expected once per so many years, with block maxima to hand | **Return Levels** | Gives the level exceeded with probability 1/T per block |
| The shape of the tail and how often it is entered | **Peaks-Over-Threshold** | Prints the scale, shape, exceedance rate and a conditional quantile |
| A capital or limit figure at a tail probability | **Tail Risk** | Gives VaR and ES at **alpha (level)** |
| How far the tail model moves a historical figure | **Empirical vs Extreme Value Risk** | Prints both pairs of figures at the same alpha |
| A forecast for the current market state | None of them | All the figures are unconditional |

## How to Choose Between Return Levels and a Threshold Fit

**Return Levels** suits a question posed per period, and data recorded as maxima. It uses one value per block, so a short record gives very few values. **Peaks-Over-Threshold** and **Tail Risk** use all the losses above u, and so make fuller use of a long daily series. In exchange they need a defensible threshold, and clusters of large losses reduce the information in the count of excesses.

To convert between them, note that a threshold fit gives the T-observation quantile through alpha = 1/T. Such a figure is per observation unless adjusted for the number of observations in a block.

## How to Set the Threshold for Extreme Value Risk Figures

Treat **Threshold u** as a modelling decision, with the 90th percentile only as a first entry. Each of the two threshold tabs keeps its own value, so a change in one does not carry to the other, and **Empirical vs Extreme Value Risk** reads the value from the **Tail Risk** tab.

A good working practice has three steps. Choose the level in the Extreme Value Diagnostics panel, with **Threshold Stability** and **Mean Excess**. Confirm that it leaves enough excesses, using **Exceedance Rate Analysis**. Then recompute the risk figures at one level on each side, and quote the spread with the figure.

## How to Choose the Return Period in the Return Levels Tab

**Return periods** takes any list of T values, counted in blocks. A T within the length of the record is close to interpolation, and the fit adds smoothing. A T beyond it is extrapolation, and its uncertainty grows quickly, more so with a positive shape.

Pick periods from the decision at stake and not from convention. Report the block length, the number of blocks and an interval with each figure. The default list of 10, 50 and 100 means little until the block is known. **Return Level Uncertainty** always asks for 10, 50 and 100, whatever the list holds.

## How to Choose Alpha for Value at Risk and Expected Shortfall

**alpha (level)** must be under the exceedance rate, or the VaR formula leaves the fitted tail. A regulation or policy often fixes the level. Otherwise pick alpha small enough to be in the tail, but with a view of the sample: at alpha much under 1/n the figure rests on the fitted form alone.

Prefer ES when losses beyond VaR matter, since VaR gives no information on their size, and since ES is the coherent measure of the two. [Acerbi and Tasche (2002)](#ref-AT2002a) give the case for it. ES depends more strongly on the shape, however, and with xi near 1 its estimate is not dependable.

## Which Estimation Method to Choose for Extreme Value Risk Measures

**Estimation method** offers **Maximum Likelihood**, **Probability-Weighted Moments** and **Bayesian Estimation**. For the GP, [Hosking and Wallis (1987)](#ref-HW1987a) favoured moment-based estimators under 500 observations, so a short tail sample gives a reason to compare with **Probability-Weighted Moments**. That method needs xi under 1. **Maximum Likelihood** is the usual default for larger samples.

**Bayesian Estimation** gives a posterior for every parameter, which suits a report of uncertainty, at the cost of a slower run. A large disagreement between the methods shows that the sample does not fix the tail, and this is worth reporting in its own right.

## References

<a id="ref-AT2002a"></a>Acerbi, C. and Tasche, D. (2002). Expected shortfall: a natural coherent alternative to value at risk. *Economic Notes* 31(2), 379–388. [doi:10.1111/1468-0300.00091](https://doi.org/10.1111/1468-0300.00091)

<a id="ref-HW1987a"></a>Hosking, J. R. M. and Wallis, J. R. (1987). Parameter and quantile estimation for the generalized Pareto distribution. *Technometrics* 29(3), 339–349. [doi:10.1080/00401706.1987.10488243](https://doi.org/10.1080/00401706.1987.10488243)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
