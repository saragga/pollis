# Factsheet

**Hierarchical Optimisation** solves a leader-follower problem in scalars x and y, through a KKT reformulation or a grid search over the leader.

## What the Hierarchical Optimisation Panel Does

| Item | Detail |
|---|---|
| Purpose | Find the leader's best decision given the follower's optimal response |
| Julia stack | `BilevelJuMP.jl` for the reformulation, `JuMP.jl` for modelling, `HiGHS.jl` for linear and mixed-integer solves, `Plots.jl` for figures |
| Tabs | **KKT Reformulation**, **Leader Grid Search** |
| Follower requirement | Linear in y, in both objective and constraints |
| Printed result | `leader_x`, `follower_y`, `leader_objective`, `follower_objective`, `solved` |
| Result type | Optimistic Stackelberg solution, in `sol` |

## What the Inputs of the Hierarchical Optimisation Panel Default To

| Input | Default | Tabs |
|---|---|---|
| **Leader Objective F(x, y)** | `x - 4y` | All |
| **Leader Constraints G(x, y) <= 0** | `[-x]` | All |
| **Follower Objective f(x, y)** | `y` | All |
| **Follower Constraints g(x, y) <= 0** | `[3 - x - y, y - 2x, 2x + y - 12, 3x - 2y - 4, -y]` | All |
| **Big-M** | 100 | **KKT Reformulation** |
| **Grid Points** | 401 | **Leader Grid Search** |

## What Work Each Solution Method Does

| Item | **KKT Reformulation** | **Leader Grid Search** |
|---|---|---|
| Problem solved | One mixed-integer linear program | Two linear programs per grid point |
| Leader variables | Any number, with edits to the code | One |
| Solution accuracy | Exact, within solver tolerance | Grid spacing |
| Main risk | **Big-M** set too small | A narrow optimum between points |
| Default solves | 1 | 802 |

## Which Functions the Next Steps Reuse

| Function | Returns | Used by |
|---|---|---|
| `follower(x)` | Optimistic response, follower value, multipliers | **Reaction Curve**, **Response Table**, checks |
| `high_point()` | Joint optimum ignoring the hierarchy | **Cooperative Bound**, **Price of Hierarchy** |
| `solve_kkt` | Reformulated solution | **KKT vs Grid Search** |
| `solve_grid` | Grid solution | **Optimality Check**, **KKT vs Grid Search** |
| `solve_bilevel` | The current tab's method | **Parametric Solve** |

`xlo` and `xhi` hold the leader's range, found by minimising and maximising x over the joint constraints.

## See Also

- [Overview](overview.md) · [Bilevel Optimisation](bilevel.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
