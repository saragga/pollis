# Decision Guide

| Situation | Method |
|---|---|
| One maximum per year or period available | **Fit** the GEV |
| The whole series available | Consider the Generalized Pareto distribution over a threshold |
| Standard analysis, enough blocks | **Maximum Likelihood** |
| Few blocks, robustness needed | **Probability-Weighted Moments** |
| Prior knowledge of xi, full uncertainty | **Bayesian Estimation** |
| Known parameters, a probability or quantile | **Evaluate** |
| Simulation of maxima | **Sample** |

## Decision Flow

1. **Choose the block**: usually a year, to remove seasonality.
2. **Check stationarity**: plot the maxima against time.
3. **Fit by maximum likelihood** and check the probability and quantile plots.
4. **Read xi with its interval**, not alone.
5. **Report return levels with intervals**, and do not extrapolate far beyond the record without them.

## Rules of Thumb

- **At least 30 to 50 blocks** for a usable xi.
- **Annual blocks** for environmental data.
- **xi between -0.5 and 0.5** in most applications; outside, check the data.
- **Return periods up to about twice the record** are well supported; beyond, the interval is the result.
- **Trends** need a nonstationary GEV with covariates, not this fit.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
