# Factsheet

**Chance-Constrained and Distributionally Robust Optimisation** sets a production plan under random resource use, with probabilistic or worst-case protection.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Choose decisions that respect a capacity with stated reliability |
| Julia stack | `JuMP.jl` for modelling, `Clarabel.jl` for conic solves, `Distributions.jl` for sampling and quantiles, `Plots.jl` for figures |
| Tabs | **Chance-Constrained**, **Distributionally Robust** |
| Decision | Two non-negative quantities |
| Printed result | `x`, `profit`, `true_violation`, `target`, `solved` |
| Other functions | `solve_cc`, `solve_dro`, `solve_box`, `solve_model`, `violation` |

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Samples (n)** | 100 | Draws of xi that the decision may use |
| **Violation Probability (epsilon)** | 0.05 | Allowed chance of exceeding capacity, below 0.5 |
| **Wasserstein Radius (theta)** | 0.02 | Size of the ball, used by **Distributionally Robust** and comparisons |

All three inputs appear in both tabs, since the comparisons use them.

## What the Example Problem Fixes

| Item | Value |
|---|---|
| Profit per unit, `c` | 1 and 1.5 |
| Capacity, `b` | 10 |
| True mean of xi | 1 and 2 |
| True covariance of xi | [0.30 0.10; 0.10 0.60] |
| Seed of the samples | 1 |
| Test draws, `XTEST` | 100000, seed 99 |
| Box baseline | Mean + 3 standard deviations for each coefficient |

All of them sit at the top of the generated code and can be edited.

## What Each Constraint Says

| Method | Constraint on x |
|---|---|
| Nominal | mean(xi)'x ≤ b |
| Box robust | (mean(xi) + 3 sd(xi))'x ≤ b |
| Chance-constrained | mean(xi)'x + z ‖L x‖ ≤ b, with z the 1 − epsilon normal quantile |
| Distributionally robust | CVaR at epsilon of (xi'x − b), on the samples, plus theta ‖x‖ / epsilon, at most 0 |

## What Each Next Step in the Panel Runs

| Action | Solves |
|---|---|
| **Reliability** | 100 new data sets |
| **CC vs DRO** | 20 data sets at each of six sizes, for both methods |
| **Epsilon Sweep** | Seven values of epsilon |
| **Shadow Prices** | Two extra solves |
| **Robust and Nominal Baselines** | Four formulations on the same data |

## See Also

- [Overview](overview.md) · [Chance-Constrained](chance-constrained.md) · [Distributionally Robust](dro.md) · [Diagnostics](diagnostics.md)
