# Overview

This webview **draws random samples** from probability distributions with Distributions.jl, and checks them against the distribution they came from. Sampling is the engine of simulation, Monte Carlo integration, the bootstrap and Bayesian computation; this panel shows what a sample of a given size can and cannot tell about its distribution, and how fast the draws are.

## Drawing a Sample
Choose a distribution group, a distribution and its parameters, the number of samples n and a seed. The panel draws n values with rand(rng, d, n), using a seeded random number generator, so that the same seed always gives the same sample. A larger sample of 10,000 draws is kept for the Next Steps.

## The Distribution Groups
- **Discrete** and **Continuous**: the standard univariate families.
- **Truncated**: a base distribution restricted to an interval.
- **Multivariate** (MvNormal, Dirichlet, Multinomial): each draw is a vector.
- **Matrix-Variate** (Wishart, InverseWishart, MatrixNormal): each draw is a matrix.
- **Mixture**: each draw picks a component at random, then draws from it.
- **Product**: independent components drawn separately and stacked.
- **Convolutions**: the sum of independent draws.

## Common Workflow

1. Draw the sample, and look at **Sample Against Distribution** and **Cumulative and Marginals**.
2. Check it with **Sample Against Exact Moments** and **Goodness of Fit**.
3. Read **Quantiles** and **Event Probabilities** from the sample, against the exact values.
4. See how the error shrinks with **Error Against Sample Size**, and how the methods compare with **Samplers Compared**.
5. Describe the distribution with the **Summary** and **Tails and Dependence**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
