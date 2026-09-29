# Distribution Comparison — Factsheet

**Distribution comparison** plots ask: does my sample follow a reference distribution, and do two samples share the same distribution? They are the visual companions to goodness-of-fit and two-sample tests.

| | |
|---|---|
| **Purpose** | Compare an empirical distribution to a theoretical one, or two empirical distributions |
| **Input** | One or two numeric samples |
| **Core packages** | [StatsPlots.jl](https://github.com/JuliaPlots/StatsPlots.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [HypothesisTests.jl](https://github.com/JuliaStats/HypothesisTests.jl) |
| **Plot types** | ECDF, QQ plot, marginal plot, correlogram |
| **Typical use** | Normality checks, model residual diagnostics, comparing groups |

## When to Use
- Checking whether data is approximately **normal** (or any reference) before a parametric method.
- Comparing the **distribution of two groups** beyond their means.
- Inspecting the **joint and marginal** structure of two variables.

## What It Is Not
These plots *suggest*; formal confirmation comes from goodness-of-fit tests (Kolmogorov–Smirnov, Anderson–Darling) in HypothesisTests.jl.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
