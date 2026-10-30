# Distribution Functions — Factsheet

A **probability distribution** describes the possible values of a random quantity and how likely each is. Distributions.jl represents each one as an object, such as Normal(0, 1) or Poisson(3), on which the same functions work: pdf, cdf, quantile, mean, var, rand, fit_mle and many more. The Distribution Functions panel evaluates those functions and shows the shape of the distribution.

| | |
|---|---|
| **Purpose** | Evaluate probabilities, densities, cumulative probabilities and quantiles, and see a distribution's shape, moments and tails |
| **Input** | A distribution and its parameters; the function (PMF, PDF, CDF or Quantile) and the point or probability |
| **Core packages** | [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Distributions** | Discrete, continuous, truncated, multivariate, matrix-variate, mixtures, products and convolutions |
| **Output** | The value of the function; plots of the density and the cdf; moments, entropy, quantiles and intervals |
| **Key choice** | The family, which should match the kind of values (counts, proportions, positive amounts, any real number) and the shape of their tails |

## When to Use

- You need a **probability, a critical value or a quantile** (a p-value, a 97.5% point, the chance of more than k events).
- You are **choosing a distribution** for a model, a prior or a simulation, and want to see how its parameters change its shape.
- You want to **check** what a parametrisation means: Distributions.jl's Gamma takes a shape and a scale, not a rate.

## What It Is Not

The Distribution Functions panel evaluates distributions whose parameters you give it; it does not choose a distribution from data, beyond the refit check. For fitting and comparing distributions on data see the fitting panels; for simulation studies and sampling methods see Distribution Sampling.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
