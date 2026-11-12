# Factsheet

**Evolution Strategies** minimises a function over a box with six population-based methods, recording each evaluation for inspection.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Global, derivative-free minimisation of a continuous function |
| Julia stack | `Evolutionary.jl`, `BlackBoxOptim.jl`, `GCMAES.jl` with `ForwardDiff.jl`, `NLopt.jl`, `Plots.jl` |
| Tabs | **CMA-ES**, **xNES**, **dxNES**, **GCMAES**, **ISRES**, **ESCH** |
| Main function | `search(; budget, seed, lb, ub)` |
| Printed result | `best_point`, `best_value`, `evaluations`, `status` |

All six tabs share the Next Steps, which call the `search` of the selected tab.

## What the Inputs of the Panel Default To

| Input | Default | Tabs | Role |
|---|---|---|---|
| **Dimension (n)** | 5 | All | Number of variables |
| **Objective f(x)** | Rastrigin | All | Julia expression in x |
| **Lower Bounds** | `fill(-5.12, n)` | All | One per variable |
| **Upper Bounds** | `fill(5.12, n)` | All | One per variable |
| **Budget** | 20000 | All | Objective evaluations |
| **Initial Step Size** | 0.3 | **CMA-ES**, **GCMAES** | Fraction of the widest box side |
| **Constraint g(x)** | `1 - x[1]^2 - x[2]^2` | **ISRES** | Feasible where g(x) ≤ 0; -1 for none |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Seed of the main run | 1 |
| Population in **CMA-ES**, **GCMAES** | 4 + ⌊3 ln d⌋, which is 8 at d = 5 |
| Parents in **CMA-ES** | Half the population |
| Start in every tab | Random point in the box |
| Gradient in **GCMAES** | `ForwardDiff.gradient` |
| **Multi-Start Analysis** | 10 seeds |
| **Budget Sensitivity** | 5% to 200% of the budget, 3 seeds each |
| **Neighbourhood Check** | 2000 points at four radii |
| **Dimension Scaling** | d of 2, 5, 10, 20, 40 |
| **ES vs DE** | 5 seeds |
| **Compare Strategies** | 3 seeds, without **GCMAES** |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Convergence Curve** | Best value and all evaluations |
| **Population Spread** | Points in (x1, x2) over the contours |
| **Search Radius History** | Spread of samples through the run |
| **Convergence Check** | Status, best reached at, bound contact |
| **Multi-Start Analysis** | Spread across seeds |
| **Budget Sensitivity** | Best value against budget |
| **Evaluate at Minimum** | Re-evaluation and gradient norm |
| **Neighbourhood Check** | Share of better points at each radius |
| **Bounds Sensitivity** | Result under changed boxes |
| **ES vs DE** | Selected tab against adaptive DE |
| **Compare Strategies** | Five methods at one budget |
| **Dimension Scaling** | Time and value as d grows |
| **Solution Summary** | Point, value and status |
| **Bounds Check** | Coordinates at a bound |
| **Algorithm Info** | Properties of the selected method |

## See Also

- [Overview](overview.md) · [CMA-ES](cmaes.md) · [ISRES](isres.md) · [Decision Guide](decision-guide.md)
