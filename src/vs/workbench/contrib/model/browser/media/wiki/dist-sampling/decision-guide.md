# Decision Guide

## How Many Samples

| Goal | Samples |
|---|---|
| A quick look at the shape | 1,000 |
| Means and central quantiles to two significant digits | 10,000 |
| A probability near 1% within 10% of its value | About 1,000,000 |
| Comparison against exact values (the Next Steps) | 10,000 |

For a mean, the standard error is sigma / sqrt(n): to reach a precision h, take n of about (sigma / h)^2.

## Which Sampling Method

| Situation | Method |
|---|---|
| Standard use | **rand(rng, d, n)** |
| Many draws from one distribution with a costly set-up | **sampler(d)**, once, then rand from it |
| Common random numbers across distributions, or quasi-random points | **Inverse transform**, quantile(d, U) |
| A distribution known only up to a constant | Markov Chain Monte Carlo |

## Reproducibility
- **Always pass a seeded generator**, such as Xoshiro(seed), rather than relying on the global one.
- **Change the seed** to see the Monte Carlo variation; a conclusion that changes with the seed needs more draws.

## Decision Flow

1. **Does the distribution have a mean and a variance?** If not, track medians and quantiles, not means.
2. **What precision do you need?** Choose n from the standard error.
3. **Rare events?** Increase n, or use importance sampling.
4. **Performance matters?** Compare the methods with Samplers Compared.

## Rules of Thumb
- **Error falls as 1/sqrt(n)**: ten times the precision takes a hundred times the draws.
- **Check the support and the moments** before using a sampler in a larger simulation.
- **Seed everything.**

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
