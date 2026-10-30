# Density Estimation — Factsheet

**Density estimation** recovers the probability density, or the probability mass, from which a sample was drawn. It can be done without assuming a family, by a histogram or a kernel density estimate, or by fitting a parametric distribution by maximum likelihood.

| | |
|---|---|
| **Purpose** | Describe the shape of a distribution from a sample: its modes, spread, skewness and tails |
| **Input** | A vector of observations, or two for bidimensional estimates; the bins, the kernel and bandwidth, or the distribution family |
| **Core packages** | [StatsBase.jl](https://github.com/JuliaStats/StatsBase.jl), [KernelDensity.jl](https://github.com/JuliaStats/KernelDensity.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Models** | Histogram, Kernel Density, Parametric |
| **Output** | The estimated density on a grid or by bin, or the fitted distribution with its parameters and moments |
| **Key choice** | The smoothing: the number of bins, the bandwidth, or the family that fixes the shape |

## When to Use

- **Exploring a sample** before modelling it: is it unimodal, skewed, heavy-tailed?
- **Smoothing** for display or for drawing new samples that look like the data.
- **Fitting a distribution** for simulation, risk or a likelihood, and choosing among families by AIC.

## What It Is Not

Not a regression: it describes one variable, or two jointly, not how one depends on others. Not reliable in many dimensions: histograms and kernels need far more data as the dimension grows, which is why the panel stops at two. Not a test of a hypothesis, although the **Goodness of Fit** action gives one for parametric fits.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
