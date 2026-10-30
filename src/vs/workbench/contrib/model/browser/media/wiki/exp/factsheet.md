# Expectations — Factsheet

The **expectation** E[f(X)] of a function of a random variable is the integral of f against the distribution of X. The Expectations panel computes it by **Gaussian quadrature**: a weighted sum of f at a few well-chosen nodes, exact for polynomials up to a high degree and very accurate for smooth functions.

| | |
|---|---|
| **Purpose** | Compute E[f(X)] for a univariate distribution, quickly and accurately, without simulation |
| **Input** | A distribution and its parameters, or a mixture; a function f(x); the number of nodes |
| **Core packages** | [Expectations.jl](https://github.com/QuantEcon/Expectations.jl) |
| **Models** | Normal, LogNormal, Gamma, Exponential, Beta, Uniform, ChiSq, MixtureModel |
| **Output** | E[f(X)], and the quadrature operator E with its nodes and weights |
| **Key choice** | The number of nodes: enough for f's smoothness, few enough to be cheap |

## When to Use

- **Economic models**: expected utility, expected values of next period's value function, asset prices, where E[.] is computed many times.
- **Moments and risk measures** of a known distribution.
- Anywhere Monte Carlo would be used for a **one-dimensional** expectation: quadrature is far more accurate at the same cost.

## What It Is Not

Not for many dimensions: product quadrature grows exponentially with the dimension, and Monte Carlo or sparse grids take over. Not for data: it needs the distribution, not a sample. Not accurate for kinked or discontinuous functions with few nodes, such as option payoffs: see [Assumptions](assumptions.md).

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
