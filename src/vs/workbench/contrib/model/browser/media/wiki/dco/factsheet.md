# Factsheet

**Discrete and Combinatorial Optimisation** solves a random travelling-salesman instance with GRASP, variable neighbourhood descent and variable neighbourhood search.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Find a short closed tour through random cities |
| Julia stack | Base Julia for the methods, `TravelingSalesmanHeuristics.jl` for comparison and bounds, `Plots.jl` for figures |
| Tabs | **GRASP**, **VND**, **VNS** |
| Main functions | `search`, `vnd!`, `construct`, `two_opt!`, `or_opt!`, `swap!` |
| Printed result | `tour_length`, `tour`, `iterations`, `improving_moves` |

## What the Inputs of the Panel Default To

| Input | Default | Role | Tabs |
|---|---|---|---|
| **Cities (n)** | 40 | Size of the instance | All |
| **Neighbourhoods** | 3 | 1 = 2-opt, 2 adds or-opt, 3 adds swap | All |
| **Iterations** | 100 | Rounds of the method | All |
| **Greediness (alpha)** | 0.3 | 0 = nearest neighbour, 1 = uniform random | **GRASP** |
| **Shaking Levels** | 3 | Largest number of double-bridge moves | **VNS** |

## What One Iteration Does in Each Tab

| Tab | One iteration |
|---|---|
| **GRASP** | Randomised construction, then full descent |
| **VND** | Full descent from a random tour; the first from nearest neighbour |
| **VNS** | Shake the best tour, then full descent |

Iterations therefore differ in cost between tabs, so compare time, and not iteration counts, when comparing the tabs.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Instance seed | 1 |
| Move rule | First improvement |
| Numerical margin for a move | 1e-12 |
| Default search seed | 1 |
| Seeds in **Restart Study** and **Multistart** | 1 to 10 |
| Budgets in **Budget Impact** | 1, 10, 50, and 1, 2 and 5 times **Iterations** |
| Limit in **Time Budget** | 2 seconds, editable |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Convergence Curve** | Best length per iteration |
| **Tour Plot** | Best tour through the cities |
| **Neighbourhood Usage** | Improving moves per neighbourhood |
| **Restart Study** | Lengths across 10 seeds |
| **Construction Quality** | Nearest neighbour, one descent, full method |
| **Budget Impact** | Length and time by budget |
| **Solution** | Tour sequence, and a validity check |
| **Multistart** | Best of 10 runs |
| **Time Budget** | Stop on a time limit |
| **Compare with 2-opt Baseline** | Against nearest neighbour plus 2-opt |
| **Compare with Library** | Against `solve_tsp` and simulated annealing |
| **Neighbourhood Count** | Results with 1, 2 and 3 neighbourhoods |
| **Summary** | Configuration and result |
| **Neighbourhood Analysis** | Whether each move can still improve the tour |
| **Objective Gap** | Length against a lower bound |

## See Also

- [Overview](overview.md) · [GRASP](grasp.md) · [VND](vnd.md) · [VNS](vns.md)
