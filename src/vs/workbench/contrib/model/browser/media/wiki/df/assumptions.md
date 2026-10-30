# Assumptions

## The Family Is Chosen, Not Inferred
The targets fix as many features as the family has free parameters; everything else, the skewness, the tails, the mode, comes from the family. A Normal and a LogNormal with mean 5 and variance 2 agree on those two numbers and differ everywhere else. The choice of family is an assumption, best made from what is known about the quantity: positive, bounded, counts, symmetric.

## Feasibility
Not every family can meet every target:
- **Positive families** (Gamma, LogNormal, Weibull, Exponential) need a positive mean.
- **Exponential** has cv = 1, so its mean fixes its variance; **Poisson** has variance equal to its mean.
- **Beta** and **Uniform** need the mean inside their support and a variance small enough for it.
- **NegativeBinomial** needs a variance larger than the mean; **Binomial**, smaller.
- **TDist** needs a variance above 1, its minimum as the degrees of freedom grow.
dist_exists returns false for an infeasible combination; Discover lists the families that are feasible.

## Exact Matching
The parameters are solved so that the targets hold exactly, not approximately: there is no notion of error or uncertainty. If the targets are themselves uncertain, as estimates or expert guesses are, the **Sensitivity to the Targets** shows how far the parameters move when each target changes by 10%.

## Moments Must Exist
Targets on moments need the moments to exist: Cauchy has none and takes quantiles; Pareto and Frechet have a finite variance only for large enough shape; TDist a finite variance only above 2 degrees of freedom.

## Quantile Targets
Quantiles are robust to the tails and closer to how people state beliefs, "90% sure between 1 and 10", but two quantiles in the far tails give a distribution sensitive to their exact values.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
