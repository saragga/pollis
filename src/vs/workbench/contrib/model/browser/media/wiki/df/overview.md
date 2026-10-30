# Distribution Factories — Overview

This webview has two models, both built on DistributionsFactories.jl.

## Moments
**Moments** builds a distribution of the chosen **Distribution Family**, one of 27, from targets given as **Parameters** in key=value form: mean=5.0, var=2.0 by default. The keys are mean, var, std, cv (the coefficient of variation), scv (its square), second_moment (E[X^2]), mode, median, q1, q3, iqr, and quantiles, a vector of (p, q) pairs such as [(0.10, 1.0), (0.90, 10.0)]; support=0..Inf restricts the support. The number of targets matches the family's free parameters:
- **One** for one-parameter families: Exponential, Chisq, Poisson, Geometric, Rayleigh and others.
- **Two** for the rest: Normal, Gamma, LogNormal, Beta, Weibull, NegativeBinomial.
- For **TDist**, the variance (greater than 1) sets the degrees of freedom; **Cauchy** has no moments and takes two quantiles.
dist_exists checks first that the family can meet the targets, and make_dist solves for the parameters.

## Discover
**Discover** takes **Constraints** in the same form and lists, with available_distributions, every family that can meet them: mean=5.0 alone admits many; adding support=0..Inf and cv=1.5 narrows them. The actions then compare all the feasible families at once.

## Common Workflow

1. Choose **Moments** with a **Distribution Family** and its **Parameters**, or **Discover** with **Constraints**.
2. Look at the **Density of the Matched Distribution** and the **CDF With Quartiles**.
3. **Check the Targets Are Met** and the **Sensitivity to the Targets**.
4. Compute the **Tail and Interval Probabilities**; **Simulate From the Distribution**.
5. Compare the **Shape Across Matching Families** and the **Tail Weight Across Families**.
6. Read the **Parameters and Their Names** and the **Plain-Language Statement**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
