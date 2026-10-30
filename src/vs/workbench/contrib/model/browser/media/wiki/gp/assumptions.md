# Assumptions

## The Threshold Is High Enough
The GP is the limit of the excesses as the threshold rises. Below the level where it holds, the fit mixes the body of the distribution with the tail and biases xi. Above a valid threshold u0, the excesses over any higher u are also GP with the same xi and a scale sigma_u = sigma_u0 + xi (u - u0), which gives two checks:
- **Threshold stability**: xi, and the modified scale sigma_u - xi u, should stay roughly constant as u rises; **Threshold Stability** plots both.
- **Mean excess plot**: the mean of X - u over X > u, plotted against u, should be linear above a valid threshold, with slope xi / (1 - xi); **Mean Excess Plot** draws it.

## Enough Exceedances
Raising the threshold reduces bias but leaves fewer excesses and more variance. With the 90th percentile of 1000 observations, 100 excesses; below about 50, xi is poorly determined.

## Independent Exceedances
The excesses are assumed independent. Time series of losses, rainfall or river flows cluster: one storm gives several days above u. The standard remedy is **declustering**, keeping the largest value of each cluster, which the Generalized Pareto Distribution panel does not do; without it, the standard errors are too small.

## Stationarity
The tail is assumed the same throughout the series. A change in volatility or climate shifts it; filtering, for example by a GARCH model, or covariates in the parameters address it.

## Maximum Likelihood Regularity
As for the GEV, maximum likelihood behaves well for xi > -0.5.

## Evaluate and Sample
In **Evaluate** and **Sample** the parameters are given, not estimated: the GP there is an exact distribution, starting at the **Threshold mu**.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
