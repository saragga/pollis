# Interpretation

## The Posterior Summary
**Posterior Summary** gives, for each parameter, the posterior **mean** and **standard deviation**, quantiles, R-hat and ESS. The mean is the usual point estimate; the standard deviation plays the role of a standard error. Every number is an average over draws, so it has a Monte Carlo error that shrinks with the ESS.

## Credible Intervals
A 95% **credible interval** contains the parameter with posterior probability 0.95, given the model and the prior. That is the statement people often wrongly attach to a frequentist confidence interval. The **equal-tailed** interval cuts 2.5% from each end; the **HPD Interval** (highest posterior density) is the shortest interval with 95% of the mass, and differs from it when the posterior is skewed.

## Probabilities of Statements
Any statement about the parameters has a posterior probability: the share of draws for which it holds. The probability that a slope is positive is the share of positive slope draws. No test is needed.

## Prior and Posterior
**Marginal Posteriors** overlays the posterior on the prior. A posterior much narrower than the prior means the data were informative; one close to the prior means the data said little, and the conclusion rests on the prior.

## Hierarchical Models
Each group mean is pulled towards the global mean mu0, more strongly for groups with few observations or noisy data: **shrinkage**. The group spread sigma0 measures how different the groups really are; a sigma0 near 0 means the groups are much alike, and the model pools them.

## Joint Posteriors
The **Pair Plot** shows the joint draws of each pair of parameters. Strong correlations (an intercept and a slope, for a covariate far from 0) are normal and do not bias anything, but they slow the samplers; centring the covariates removes them.

## Comparing Models
**LOO Compare** ranks models by their **expected log predictive density** (ELPD), estimated by Pareto-smoothed leave-one-out cross-validation. Higher is better. A difference smaller than about twice its standard error is not a clear preference. **WAIC** estimates the same quantity, less reliably.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
