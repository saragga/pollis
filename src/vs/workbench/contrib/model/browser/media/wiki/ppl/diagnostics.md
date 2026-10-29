# Diagnostics

MCMC draws are only useful if the chains have **converged** to the posterior and **mixed** well through it. Check every run.

## Trace Plots
The **Trace Plot** shows each parameter's draws against the iteration, one line per chain. Good chains look like stationary noise, the "hairy caterpillar", with all chains overlapping. Warning signs: a trend (not yet converged), chains at different levels (stuck in different modes), long flat stretches (MH rejecting proposals), or slow wandering (high autocorrelation).

## R-hat
**R-hat** compares the variance between chains with the variance within them. It is 1 when all chains sample the same distribution. Values above **1.01** mean the chains disagree: run longer, reparametrise or check the model.

## Effective Sample Size
Successive MCMC draws are correlated, so n draws carry the information of fewer independent ones: the **Effective Sample Size** (ESS). Below about **100 per chain**, means and especially interval endpoints are unreliable. Report the bulk ESS (for the centre) and the tail ESS (for the intervals).

## Autocorrelation
The **Autocorrelation** plot shows the correlation of the draws at increasing lags. It should fall to zero within a few lags for NUTS. Slow decay explains a low ESS. Thinning (keeping every k-th draw) does not help: it discards information; read the ESS instead.

## Divergences
NUTS and HMC report **divergent transitions** where the numerical trajectory breaks down, typically in regions of high curvature. Even a few divergences mean part of the posterior was not explored. Raise the **target acceptance** (towards 0.95 or 0.99), which shortens the steps, or reparametrise.

## Posterior Predictive Check
The **Posterior Predictive Check** draws replicated data sets from the fitted model and plots them with the observed data. The observed data should look like one of the replicates. A systematic difference (heavier tails, more zeros, a skew) shows what the model misses.

## LOO and Pareto k
**LOO-CV** reports, for each observation, a Pareto k value. Values above **0.7** mean the leave-one-out estimate for that observation is unreliable, often because it is an influential outlier.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Trace plot | Overlapping stationary chains | Trends, separated chains, flat stretches |
| R-hat | Below 1.01 | Above 1.01 |
| ESS | Above 100 per chain | Below 100 per chain |
| Divergences | None | Any: raise the target acceptance or reparametrise |
| Posterior predictive | Data look like the replicates | Systematic difference |
| Pareto k | Below 0.7 | Above 0.7 for some observations |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
