# Choosing a Loss Risk Measure

The right measure depends on what the loss means to you: a path to live through, a target to clear or a tail to capitalise against. Data length then decides how far out you can go.

## Quick choices by situation

| Situation | Tab | Reason |
|---|---|---|
| Investors judge the fund by its worst fall and its recovery | **Drawdown** | Depends on the path and the order of returns |
| A target return or liability defines what counts as failure | **Downside Risk** | Measures shortfall from **MAR** |
| A simple threshold for limits or reporting | **Value at Risk** | Single loss level, easy to communicate |
| Capital, optimisation or fat tails | **Expected Shortfall** | Coherent and tail-sensitive |

## VaR or Expected Shortfall?

Use VaR when you need a simple threshold, a backtest with a well-established test, or to meet a rule stated in VaR. Use ES when you must add risks across positions, optimise them, or care about how far the tail runs. Portfolio limits set on VaR can be gamed by moving losses beyond the quantile, where they go unseen, and ES closes that gap.

Regulators made the same move: the Basel market-risk rules went from a 99% VaR to a 97.5% ES. For normal returns the two nearly match, at 2.326 and φ(1.96) / 0.025 ≈ 2.338 standard deviations, so the change matters mainly when the tails are heavy.

## Historical, normal or Cornish-Fisher?

Historical estimates need no shape assumption and reflect skewness and fat tails as they appeared in the sample. They cannot go beyond the worst observed loss and they need many points in the tail.

The normal version is smooth, stable and good for quick comparison, though usually too low at far tails. Cornish-Fisher sits between them. For skewness −0.5 and excess kurtosis 3, the 5% quantile moves from −1.645 to about −1.72 standard deviations, a modest correction that is useful when departures are moderate. With a thin tail sample and fat tails, a fitted tail model is a better route than any of the three.

## Which confidence level?

Pick the level your data can support. A handy guide is to want at least 10 or 20 points in the tail, so 1,000 returns support alpha 0.05 comfortably and alpha 0.01 only barely. **Rolling VaR Forecast** and **VaR Backtest** use 250-period windows, which suit 5% and leave little at 1%.

A higher level sounds more prudent, yet it may be less accurate. Estimating a far quantile with few points can be worse than scaling a nearer one under a stated assumption. To compare, the table of normal multiples in [Factsheet](factsheet.md) gives the scaling, and a stress test covers what no sample can.

## Which target for downside measures?

**MAR** should reflect a real goal. Zero means capital preservation, a risk-free rate means beating cash, and a liability rate suits a pension fund. Convert an annual target to one period first: 5% a year is about 0.02% a day over 252 days.

A change of target can change rankings between strategies, since Sortino and Omega both move with it. Report the target with the ratio. `semi_dev` uses the mean as its target, so it needs no setting, but it treats a fund with a high mean more harshly than one with a low mean for the same absolute return. On **Risk-Adjusted Performance**, **MAR** also serves as the risk-free rate in Sharpe.

## Measuring or optimising?

The panel measures risk on a given series. Optimising a portfolio against those measures is a different step, and the choice matters there. A historical ES objective can be reduced to a linear program, which [Rockafellar and Uryasev (2000)](#ref-RU2000a) showed, and that makes it tractable with many assets.

VaR is not convex as a function of the weights, so optimising it directly can trap the search in local solutions and push risk into the unseen tail. Drawdown can also be optimised, with more effort. Whichever measure you choose, an optimiser concentrates on estimation errors, and a solution that looks best in sample will usually disappoint out of sample.

## References

<a id="ref-RU2000a"></a>Rockafellar, R. T., & Uryasev, S. (2000). Optimization of Conditional Value-at-Risk. *Journal of Risk* 2(3), 21-41. [doi:10.21314/JOR.2000.038](https://doi.org/10.21314/JOR.2000.038)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
