# Factsheet

**Genetic Algorithms** minimises a function over a box with four variants, all written out in the generated Julia code and recording the best value and diversity per generation.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Derivative-free global search over a box |
| Julia stack | Plain Julia, `Plots.jl` for figures, `BlackBoxOptim.jl` and `Evolutionary.jl` for comparisons |
| Tabs | **GA**, **Compact GA**, **BRKGA**, **MCCGA** |
| Main function | `search(; gens, NP, seed, lb, ub)` |
| Printed result | `best_point`, `best_value`, `generations`, `evaluations` |

## What the Inputs of the Panel Default To

| Input | Default | Tabs | Role |
|---|---|---|---|
| **Dimension (n)** | 5 | All | Number of variables |
| **Objective f(x)** | Rastrigin | All | Julia expression in x |
| **Lower Bounds**, **Upper Bounds** | ±5.12 | All | Box |
| **Population Size** | 50 | All | Population, or virtual size |
| **Generations** | 300 | All | Rounds |
| **Crossover Rate** | 0.9 | **GA** | Chance a child uses crossover |
| **Mutation Rate** | 0.1 | **GA** | Chance per gene |
| **Bits per Variable** | 16 | **Compact GA** | Fixed-point resolution |
| **Elite Fraction** | 0.2 | **BRKGA** | Share kept |
| **Mutant Fraction** | 0.15 | **BRKGA** | Share of fresh keys |
| **Elite Inheritance** | 0.7 | **BRKGA** | Chance per key from the elite parent |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Seed of the main run | 1 |
| **GA** selection | Tournament of 3 |
| **GA** crossover | BLX-0.25, applied per gene |
| **GA** mutation size | 10% of the range |
| **GA** elitism | 1 individual |
| **MCCGA** bits | 32 per variable |
| Compact stop | Every bit within 1e-9 of 0 or 1 |
| **Multi-Run Reliability** | 10 seeds |
| **Sensitivity Analysis** | 2000 points at four radii |
| **Population Size Study** | 10, 20, 50, 100, 200, 3 seeds |
| **Compare with DE**, **Compare with CMA-ES** | 5 seeds |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Convergence Plot** | Best value per generation |
| **Population Diversity** | Spread, or undecidedness of bits |
| **Fitness Landscape** | Heatmap of the first two variables |
| **Stagnation Check** | Last gain, idle generations, `premature` flag |
| **Convergence Rate** | Generations to reach four tolerances |
| **Multi-Run Reliability** | Spread across seeds |
| **Best Solution** | Point and re-evaluated value |
| **Evaluate New Point** | A chosen point against the best |
| **Sensitivity Analysis** | Share of better points per radius |
| **Compare with DE** | Selected tab against adaptive DE |
| **Population Size Study** | Value at equal evaluations |
| **Compare with CMA-ES** | Selected tab against CMA-ES |
| **Solution Summary** | Position of each variable in its range |
| **Operator Statistics** | Settings and cost of the run |
| **Bounds Feasibility** | Coordinates against a bound |

## See Also

- [Overview](overview.md) · [Classic GA](ga.md) · [Compact GA](cga.md) · [BRKGA](brkga.md)
