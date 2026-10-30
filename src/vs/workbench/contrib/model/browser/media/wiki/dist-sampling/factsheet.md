# Distribution Sampling — Factsheet

**Random sampling** turns a distribution into data: draws whose frequencies, averages and quantiles approach those of the distribution as their number grows. In Distributions.jl, rand(rng, d, n) draws n values from any distribution d, through a sampler chosen for that family; a seeded generator makes the draws reproducible.

| | |
|---|---|
| **Purpose** | Draw reproducible samples from a distribution, and see how well a sample of size n represents it |
| **Input** | A distribution and its parameters; the number of samples (n) and the seed |
| **Core packages** | [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [Random](https://docs.julialang.org/en/v1/stdlib/Random/) |
| **Distributions** | Discrete, continuous, truncated, multivariate, matrix-variate, mixtures, products and convolutions |
| **Output** | The sample; its histogram, moments, quantiles and event frequencies against the exact values; goodness-of-fit checks; timings |
| **Key choice** | The sample size: Monte Carlo errors shrink as 1/sqrt(n), so each extra digit of precision costs a hundred times more draws |

## When to Use

- You are building a **simulation** and need draws from a given distribution.
- You want to know **how many draws** a Monte Carlo estimate needs.
- You want to **check a sampler** or a distribution set-up against its exact properties.

## What It Is Not

The Distribution Sampling panel samples from distributions you specify; it does not fit them to data. Its goodness-of-fit checks test the sampler against the distribution it was given, not a model against real data. For exact probabilities and quantiles without sampling, see Distribution Functions; for sampling from posteriors known only up to a constant, see Markov Chain Monte Carlo.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
