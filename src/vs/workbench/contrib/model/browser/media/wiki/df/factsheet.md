# Distribution Factories — Factsheet

A **distribution factory** builds a probability distribution from what is known about it, its mean and variance, its median and interquartile range, a mode, a support or a few quantiles, rather than from its parameters. DistributionsFactories.jl solves for the parameters of a chosen family that meet those targets, or lists every family that can.

| | |
|---|---|
| **Purpose** | Turn summary statistics or expert judgements into a distribution for simulation, priors or risk analysis |
| **Input** | A family and one or two targets as key=value pairs, or a set of constraints to search the families with |
| **Core packages** | [DistributionsFactories.jl](https://github.com/Distribution-Matching/DistributionsFactories.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Models** | Moments, Discover |
| **Output** | A Distributions.jl object with the parameters that match the targets, or the list of feasible families |
| **Key choice** | The family: the targets fix the location and spread, the family fixes the shape and the tails |

## When to Use

- **Priors and inputs from expert judgement**: "the cost is about 5, and 90% sure between 1 and 10".
- **Matching published statistics** when only a mean and a standard deviation are reported.
- **Sensitivity analysis**: the same targets met by several families, to see how much the conclusions depend on the shape.

## What It Is Not

Not fitting to data: it matches targets exactly, without a sample, standard errors or a likelihood; for data, see Density Estimation. A distribution with the right mean and variance can still have the wrong tails: the targets do not determine the shape.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
