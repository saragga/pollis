# Factsheet

**Decomposition and Constrained Multi-Objective Optimisation** approximates a Pareto front with decomposition, coevolution, or an epsilon-box archive.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Find a spread of feasible trade-offs between objectives |
| Julia stack | `Metaheuristics.jl` for algorithms and indicators, `Plots.jl` for figures |
| Tabs | **MOEA/D**, **CCMO**, **Epsilon-Dominance Archive** |
| Algorithms in the code | `MOEAD_DE`, `CCMO(NSGA2)`, `NSGA2` with an archive after the run |
| Printed result | `front_size`, `ideal`, `nadir`, `hypervolume`, `all_feasible` |
| Problem form | `f(x)` returning objectives, g(x) ≤ 0 and h(x) = 0 |

The package comes from [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a).

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Objectives** | [x[1], (1 + x[2]) / x[1]] | Expressions to minimise |
| **Inequality Constraints** | [6 − (x[2] + 9x[1]), 1 + x[2] − 9x[1]] | g(x) ≤ 0, or [0.0] for none |
| **Equality Constraints** | [0.0] | h(x) = 0, none by default |
| **Bounds** | [0.1 0.0; 1.0 5.0] | Lower row, then upper row |
| **Population** | 100 | Typical 100 to 300; at most this many weight vectors for **MOEA/D** |
| **Iterations** | 250 | Generations, typical 200 to 500 |
| **Epsilon** | [0.01, 0.1] | Box size per objective, on **Epsilon-Dominance Archive** only |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Seed of the main run | 1 |
| Hypervolume reference | 10% beyond the nadir of the main front |
| Weights in **Weight Vectors** | 15, for two objectives only |
| Tolerance in **Active Constraints** | \|g\| below 0.01 |
| Seeds in **Hypervolume** | 1 to 5 |
| Budgets in **Budget Sensitivity** | 0.1, 0.25, 0.5, 1 and 2 times **Iterations** |
| Loosening in **Constraint Relaxation** | t = 0, 0.5, 1 and 2 |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Pareto Front Plot** | Front, feasible and infeasible individuals |
| **Weight Vectors** | Rays and the solution best serving each |
| **Constraint Check** | Feasibility of the front, and feasible share per generation |
| **Hypervolume** | Value and spread over five seeds |
| **Budget Sensitivity** | Hypervolume against generations |
| **Constraint Relaxation** | Fronts with g(x) ≤ t |
| **Compare Algorithms** | MOEA/D, CCMO and NSGA-II on one problem |
| **IGD Comparison** | Distance to the union's non-dominated set |
| **Decision Space** | Pareto set, and five spread solutions |
| **Active Constraints** | Binding constraints along the front |

## References

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A. and Mezura-Montes, E. (2022). Metaheuristics: a Julia package for single- and multi-objective optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [MOEA/D](moead.md) · [CCMO](ccmo.md) · [Borg MOEA](borg.md)
