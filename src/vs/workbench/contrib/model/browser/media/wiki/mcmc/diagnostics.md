# Diagnostics

## Trace Plots
The **Trace Plot** shows the draws of each parameter against the iteration. A well-mixing chain looks like stationary noise around a constant level. Warning signs: a **trend** (the chain has not reached the target), **long flat stretches** (Metropolis-Hastings rejecting every proposal), **slow wandering** (high autocorrelation), or **jumps between levels** (several modes).

## R-hat
**R-hat**, the potential scale reduction factor, compares the spread between chains (or between halves of one chain) with the spread within them. It approaches 1 as the chains converge to the same distribution. Values above **1.01** are a warning; run longer, or change the sampler or the parametrisation.

## Effective Sample Size
The **ESS** is the number of independent draws that would give the same precision as the correlated chain. NUTS often reaches an ESS close to the number of draws; Metropolis-Hastings, a small fraction of it. Below about **100 per chain**, estimates of the tails (interval endpoints) are unreliable.

## Autocorrelation
The **Autocorrelation** plot gives the correlation between draws k steps apart. It should drop to near zero within a few lags. Slow decay means slow mixing, and is what lowers the ESS.

## Acceptance Rate
- **Metropolis-Hastings**: an acceptance rate near **0.23** is the classic optimum for random-walk proposals in many dimensions, higher (up to about 0.44) in one dimension. Near 0 or near 1, rescale the proposal.
- **HMC and NUTS**: the adaptation targets an average acceptance statistic (0.65 here). Much lower after warm-up suggests the step size is too large for parts of the target.

## Divergences
HMC and NUTS flag **divergent transitions**, where the leapfrog integration has broken down. They mark regions the sampler cannot explore, so even a few bias the results. Raise the target acceptance (smaller steps) or reparametrise.

## Sampler Efficiency
**Sampler Efficiency** divides the ESS by the run time: the effective draws per second. It is the fair way to compare samplers, since a cheaper sampler may need many more draws.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Trace plot | Stationary noise | Trend, flat stretches, level jumps |
| R-hat | Below 1.01 | Above 1.01 |
| ESS | Above 100 per chain | Below 100 per chain |
| Autocorrelation | Near zero within a few lags | Slow decay |
| Acceptance (MH) | Around 0.2 to 0.45 | Near 0 or near 1 |
| Divergences (HMC, NUTS) | None | Any |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
