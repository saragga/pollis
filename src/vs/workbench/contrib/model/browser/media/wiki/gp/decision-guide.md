# Decision Guide

| Situation | Method |
|---|---|
| The whole series available, interest in the tail | **Fit** the GP over a threshold |
| Only one maximum per block | The GEV panel |
| Standard analysis | **Maximum Likelihood** |
| Few exceedances | **Probability-Weighted Moments** |
| Full uncertainty of the tail | **Bayesian Estimation** |
| Known parameters, a probability or quantile | **Evaluate** |
| Simulation of large losses | **Sample** |

## Decision Flow

1. **Choose a starting threshold**, the 90th or 95th percentile.
2. **Check stability**: refit at several thresholds and pick the lowest above which xi is stable.
3. **Check independence**: decluster if the exceedances come in bunches.
4. **Fit and check** the probability and quantile plots.
5. **Report tail quantiles with their uncertainty**.

## Rules of Thumb

- **50 to 200 exceedances** is a workable range.
- **POT over block maxima** when the series is available: it uses more of the tail.
- **Threshold stability** before anything else.
- **Decluster** daily environmental and financial data.
- **xi > 0.5** means infinite variance: means and standard deviations of the losses are not meaningful summaries.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
