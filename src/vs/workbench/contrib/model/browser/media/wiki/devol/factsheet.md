# Factsheet

**Differential Evolution** minimises a black-box function over a box, with classic, success-history, self-adaptive and constrained variants.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Global minimisation with no gradients |
| Julia stack | Base Julia for the four methods, `BlackBoxOptim.jl` and `Evolutionary.jl` for comparison, `Plots.jl` for figures |
| Tabs | **DE**, **SHADE**, **Adaptive DE**, **epsilonDE** |
| Main functions | `search`, `crossover`, `pick`, `record!` |
| Printed result | `best_point`, `best_value`, `evaluations` |

The CMA-ES comparison comes from the package of [Poliak (2021)](#ref-Pol2021a).

## What the Inputs of the Panel Default To

| Input | Default | Tabs |
|---|---|---|
| **Dimension (n)** | 5 | All |
| **Objective f(x)** | Rastrigin | All |
| **Lower Bounds** | `fill(-5.12, n)` | All |
| **Upper Bounds** | `fill(5.12, n)` | All |
| **Population Size** | 50 | All |
| **Generations** | 300 | All |
| **Scale Factor (F)** | 0.7 | **DE**, **epsilonDE** |
| **Crossover Rate (CR)** | 0.9 | **DE**, **epsilonDE** |
| **Memory Size (H)** | 10 | **SHADE** |
| **p-best Fraction** | 0.1 | **SHADE** |
| **Re-sampling Probability** | 0.1 | **Adaptive DE** |
| **Constraints g(x) <= 0** | `[1 - sum(x)]` | **epsilonDE** |
| **Epsilon Horizon** | 0.5 | **epsilonDE** |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Default seed | 1 |
| Evaluations | `NP * (gens + 1)` |
| Bound handling | `clamp`, for the mutant |
| Start of **SHADE** memories | F and CR at 0.5 |
| Spread around memories | 0.1, Cauchy for F, normal for CR |
| Range of re-sampled values in **Adaptive DE** | F in [0.1, 1], CR in [0, 1] |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Convergence Curve** | Best value by generation |
| **Population Diversity** | Mean spread by generation |
| **Parameter History** | Mean F and CR, and epsilon on **epsilonDE** |
| **Convergence Check** | Last improvement and a stagnation flag |
| **Multi-Start** | Ten seeds, values and distances |
| **Population Size Study** | Five sizes at equal evaluations |
| **Evaluate at Minimum** | Value and gradient norm at the solution |
| **Bounds Sensitivity** | Box shrunk, enlarged and shifted |
| **Dimension Scaling** | Dimensions 2, 5, 10 and 20 |
| **Compare with Library DE** | Against `BlackBoxOptim.jl` |
| **DE vs CMA-ES** | Against CMA-ES |
| **Budget Study** | Five budgets, three seeds each |
| **Solution Summary** | Point, value and spread |
| **Bounds Check** | Coordinates at the bounds |
| **Algorithm Info** | Properties of the selected variant |

## References

<a id="ref-Pol2021a"></a>Poliak, A. (2021). Evolutionary.jl: a Julia package for evolutionary algorithms. [doi:10.5281/zenodo.5781169](https://doi.org/10.5281/zenodo.5781169)

## See Also

- [Overview](overview.md) · [Classic DE](de.md) · [SHADE](shade.md) · [Adaptive DE](adaptive-de.md)
