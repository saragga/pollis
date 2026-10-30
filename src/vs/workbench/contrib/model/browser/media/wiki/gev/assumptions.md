# Assumptions

## The Limit Holds
The GEV is an asymptotic result: it describes the maximum of a block only when the block is large. Annual maxima of daily data, 365 values, usually qualify; maxima of blocks of 10 do not. The theorem also requires that a limit exists, which holds for almost every continuous distribution met in practice.

## Independent, Stationary Blocks
The maxima are assumed independent and identically distributed:
- **Stationarity**: no trend in the maxima. A rising sea level or a changing climate violates it; the GEV parameters can then be made functions of time, which this panel does not do.
- **Independence**: one block's maximum does not predict the next. Dependence within a block, such as clusters of hot days, is allowed: it changes the parameters, not the GEV form.
- **Seasonality**: annual blocks absorb it; monthly blocks mix different seasons.

## Enough Blocks
The shape xi is estimated from the few largest values: with under about 50 blocks its interval is wide, and the return levels for long periods far wider. Port Pirie's 65 years give a 95% interval for xi that includes 0.

## Maximum Likelihood Regularity
The usual properties of the MLE, consistency and normal intervals, hold for xi > -0.5. Below it, the endpoint is estimated unusually fast and the intervals are unreliable; below -1 the MLE may not exist. Such short-tailed maxima are rare in practice.

## Extrapolation
A return level beyond the record relies entirely on the fitted shape. Small changes in xi move the 500-block level a lot: the intervals, not the point estimate, describe what the data support.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
