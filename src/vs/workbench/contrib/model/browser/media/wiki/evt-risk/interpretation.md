# Interpretation

The figures of the Extreme Value Risk Measures panel come in the units of the losses and are statements about a fitted tail. Each is a point estimate, and the tabs print no interval next to it.

## What a Return Level Means and What It Does Not

A return level z(T) from the **Return Levels** tab is exceeded with probability 1/T in any one block, under the fitted GEV. So the level is exceeded on average once in T blocks, in a stable process.

A return level is not a worst case. Exceedance within a period of T blocks is more likely than not: the chance of at least one is 1 − (1 − 1/T)^T, which is about 0.63 for large T. A second exceedance also need not wait T blocks after the first. The figure carries the meaning of the block, so a label such as 1-in-100-year holds only for annual maxima.

## How to Read the Output of the Peaks-Over-Threshold Tab

| Printed value | Meaning | How to read it |
|---|---|---|
| **sigma_hat (scale)** | Scale of the excesses over u | Depends on u, so it is not comparable across thresholds |
| **xi_hat (shape)** | Tail heaviness | Positive means heavy, near 0 exponential-like, negative bounded |
| **Exceedance rate** | Share of observations above u | Times n gives the number of excesses that support the fit |
| **99th pct above u** | Loss level exceeded by 1 percent of the losses above u | Conditional on exceeding u, so it is not the overall 99th percentile |

With the default threshold at the 90th percentile, the overall chance of passing **99th pct above u** is about 0.001.

## How to Read Value at Risk and Expected Shortfall from the Tail Risk Tab

**alpha (level)** is a tail probability. So an alpha of 0.05 gives the loss exceeded with probability 0.05, usually called the 95 percent VaR. **VaR (Extreme Value)** is that level, and **ES (Extreme Value)** is the average loss given that the VaR is exceeded.

ES is at least as large as VaR when xi is under 1, and the ratio of the two shows the heaviness of the tail. For a heavy tail at high levels, ES / VaR tends to 1 / (1 − xi). An ES far above VaR therefore goes together with a large **xi_hat**, and a small error in that shape has a large effect on the ES. Both figures are unconditional, so neither is a forecast for a particular day. Horizon follows the data: daily losses give a daily figure, which the tab does not convert to other horizons.

## How to Read Differences Between Empirical and Extreme Value Risk

**Empirical vs Extreme Value Risk** prints four figures. The empirical pair uses only observed losses, and the Extreme Value pair uses the GP fit above the threshold.

Empirical figures are bounded by the largest observed loss and are driven at small alpha by a few points. The Extreme Value figures smooth those points and can go past them. A higher Extreme Value ES is not by itself a correction of the empirical one, and a lower one does not show that the record overstated the risk. Read the gap as the effect of the tail model on the figure, then decide whether the model has earned that effect.

## Common Misreadings of Extreme Value Risk Measures

- A 100-period return level is not the largest loss to expect in 100 periods. A larger one occurs in most such stretches.
- **99th pct above u** is not an overall 99 percent VaR. Use the **Tail Risk** tab for that, with alpha at 0.01.
- A larger alpha gives a smaller VaR, because alpha is the tail probability and not the confidence level.
- A precise-looking figure has no interval attached in these tabs. Its printed digits do not reflect its accuracy.
- Two thresholds that give different figures do not imply that one is wrong. The gap measures part of the uncertainty.
- A **sigma_hat** that differs across thresholds is expected, even when the GP holds, since the scale moves with u.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
