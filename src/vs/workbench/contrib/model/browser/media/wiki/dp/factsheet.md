# Factsheet

**Dynamic Programming** solves a discounted inventory problem exactly on a grid of stock levels, with known or random demand, using `QuantEcon.jl`.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Find the optimal value and the optimal policy for each state |
| Julia stack | `QuantEcon.jl` for solving, `Plots.jl` for figures |
| Tabs | **Deterministic**, **Stochastic** |
| Main solver | `solve(ddp, PFI)`, policy iteration |
| Printed result | `value_at_empty_stock`, `order_at_empty_stock`, `order_up_to`, `iterations` |

Both tabs share all the Next Steps, and they differ only in the demand they pass to `build`.

## What the Inputs of the Panel Default To

| Input | Default | Tabs | Role |
|---|---|---|---|
| **States (S)** | 50 | Both | Stock levels 0 to S − 1 |
| **Horizon (T)** | 10 | Both | Length of the simulation, and one more horizon to compare |
| **Discount (gamma)** | 0.95 | Both | Weight on the future, in (0, 1) |
| **Demand Scenarios (N)** | 10 | **Stochastic** | Equally likely demand values |

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Sale price, order cost, holding cost | 8, 2, 0.5 per unit |
| Largest order per period | 10 units |
| Unmet demand | Lost |
| Deterministic demand | 5 per period |
| Stochastic demand | `range(0, 10, length=N)` rounded to integers |
| **Convergence** | Tolerance 1e-8, up to 5000 sweeps |
| **Policy Evaluation** | 1000 runs, seed 1, horizon set by the discount |
| **Horizon Sensitivity** | 1, 2, 5, 10, 20, 50, 100, 200, and T |
| **Scenario Resolution** | N of 1, 2, 3, 5, 10, 20, 50 |
| **Discount Sensitivity** | 0.5, 0.7, 0.8, 0.9, 0.95, 0.99 |
| **State Value** | Stock of 20 |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Value Function** | V*(s) across stock levels |
| **Optimal Policy** | Order per stock level, and stock after ordering |
| **Convergence** | Bellman residual per sweep, against the γ^k rate |
| **Policy Evaluation** | Monte Carlo value against the exact value |
| **Policy Simulation** | Stock and orders over T periods |
| **Horizon Sensitivity** | Finite-horizon value at empty stock |
| **Value vs Policy Iteration** | Iterations, time and policy agreement for three methods |
| **Scenario Resolution** | Value at empty stock as N rises |
| **State Value** | Value, order and marginal value at one level |
| **Discount Sensitivity** | Value and order-up-to level for six discounts |

## See Also

- [Overview](overview.md) · [Deterministic DP](deterministic.md) · [Stochastic DP](stochastic.md) · [Decision Guide](decision-guide.md)
