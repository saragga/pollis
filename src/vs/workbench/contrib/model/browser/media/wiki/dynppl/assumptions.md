# Assumptions

Two kinds of assumption are at work. The model makes claims about how the data arose, and the sampler needs certain conditions to describe that model's posterior. A failure of either can go unnoticed if only the summary table is read.

## What the Likelihood in a Turing Model Assumes

Every line with `~` on the data is a claim about how the data arose. The template's `y .~ Normal(mu, sigma)` says that observations are independent and normal, with one mean and one spread. Outliers, skew, groups or dependence over time would all violate that, and the posterior would still look precise. **Posterior Predictive** is the check: simulate new data from the fit and compare its spread, tails and extremes with the real data. If the simulations miss a feature that matters, change the likelihood, for instance to a Student t for heavy tails or a hierarchical form for groups.

## What the Priors in a Turing Model Assume

Priors are part of the model and not a formality. The template's `mu ~ Normal(0, 1)` says that the mean is very likely within about 2 of zero, which suits standardised data but can pull an estimate hard towards zero on other scales. **Prior Predictive** draws the parameters from their priors, so check that their ranges make sense in real units. Its code gives the parameters only, so simulating observations from them needs a further step. **Prior Sensitivity** refits at prior standard deviations of 0.5, 1, 2 and 5 for `mu`, and a large movement in the posterior mean means that the data alone do not settle it.

## What Gradient-Based Samplers Assume About the Model

**No-U-Turn Sampler** and **Hamiltonian Monte Carlo** need a log density that is differentiable in the parameters. Discrete parameters cannot be sampled this way, so they must be summed out, or moved to a combined sampler. Functions with jumps or kinks give poor gradients, and code that breaks automatic differentiation will fail with an error. Very different scales across parameters, and funnel shapes common in hierarchical models, force small steps. Divergent transitions are the warning sign, and a non-centred parameterisation is often the remedy.

## What MCMC Assumes About Convergence

Theory guarantees that the chains reach the posterior only in the limit, so any finite run is an approximation. A chain has to forget its start, move between all regions of the posterior, and run long enough to estimate the quantity of interest. Several well-separated modes break this, since a chain may stay in one region. Starting chains from dispersed points and comparing them helps, as **R-hat** does. Agreement between chains is necessary but does not prove convergence, as all of them can miss the same region.

## What Priors Must Do for the Posterior to Be Proper

A posterior has to integrate to a finite value for its summaries to mean anything. Flat priors on unconstrained parameters can fail this requirement, and samplers will then drift without settling, or simply give numbers that look like an answer. Proper priors avoid the problem, which is one reason for preferring them. Weakly informative priors also help the sampler by ruling out extreme regions, where the geometry is at its worst. Trends in **Trace Plot** that never settle are a typical symptom of an improper or very weakly identified posterior.

## What Parameter Identification Requires

If different values of the parameters give the same likelihood, only the priors separate them. Mixture labels that can swap and strongly collinear predictors are the usual causes. **Parameter Correlations** shows long ridges or multiple blobs in such cases, and **R-hat** can stay high however long the run. Ordering constraints, fewer parameters or stronger priors are the usual remedies, as more draws cannot add information that the data lack.

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
