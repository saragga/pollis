# Generalized Extreme Value Distribution — Overview

The GEV has CDF G(z) = exp(-(1 + xi (z - mu) / sigma)^(-1/xi)) where 1 + xi (z - mu) / sigma > 0. The shape xi decides the family:
- **xi > 0, Frechet**: a heavy, polynomial upper tail with no upper bound.
- **xi = 0, Gumbel**: an exponential tail, the limit as xi goes to 0.
- **xi < 0, Weibull**: a bounded upper tail, ending at mu - sigma / xi.

## Fit
**Block maxima series** is the vector of maxima, one per block. The default is the annual maximum sea levels at Port Pirie, South Australia, 1923-1987, 65 years in metres, the first example of Coles (2001). **Estimation method**:
- **Maximum Likelihood** (gevfit): the standard, with intervals from the observed information.
- **Probability-Weighted Moments** (gevfitpwm): closed-form, robust in small samples.
- **Bayesian Estimation** (gevfitbayes): MCMC draws; the point estimate printed is the posterior mean.
The fit prints mu, sigma and xi, with the 95% interval of xi.

## Evaluate
With **mu**, **sigma** and **xi** given, **Evaluate** gives the density and CDF at **Eval point x**, how often x is exceeded in blocks, and the quantile at **Quantile p**, the 1 / (1 - p)-block return level.

## Sample
**Sample** draws **Sample size n** maxima and compares their mean and standard deviation with the theoretical, which exist only for xi < 1 and xi < 0.5.

## Common Workflow

1. Build the **Block maxima series**; choose the **Estimation method**; **Fit**.
2. Check the **Fit Diagnostics** probability and quantile plots.
3. Read the **Return Level Plot**.
4. Read the **Tail Behaviour**: the tail type and the chance of a new record.
5. **Evaluate** or **Sample** a GEV with chosen parameters.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
