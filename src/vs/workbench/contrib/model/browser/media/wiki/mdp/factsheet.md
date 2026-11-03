# Single-Agent Decision Processes: Factsheet

A quick reference for **Single-Agent Decision Processes**: the three models, their inputs, the fixed values in their code and what each action computes. **MDP** and **POMDP** are written through `POMDPs.jl`, and **Semi-MDP** is hand-written in Base Julia.

## Models, problems and solvers

| Model | Default problem | Solver in the code | Main objects |
|---|---|---|---|
| **MDP** | Inventory with Poisson demand | `ValueIterationSolver(max_iterations=1000, belres=1e-6)` | `m`, `policy`, `V`, `act` |
| **POMDP** | The Tiger problem | `QMDPSolver(max_iterations=1000)` | `m`, `policy`, `belief`, `V`, `act` |
| **Semi-MDP** | Machine maintenance | `value_iteration(tol=1e-8, maxiter=10_000)` | `outcomes`, `tau`, `R`, `Q`, `vi`, `rollout` |

On **POMDP**, `V` and `act` take p, the probability that the tiger is behind the left door. On the other two they take a state.

## Inputs and their defaults

| Input | Default | Models | Meaning |
|---|---|---|---|
| **States (S)** | 10 | **MDP**, **Semi-MDP** | Warehouse capacity, or the top condition level |
| **Largest Order (A)** | 5 | **MDP** | Orders 0 to A are available |
| **Mean Demand** | 3 | **MDP** | Mean of the Poisson demand per period |
| **Listening Accuracy** | 0.85 | **POMDP** | Chance that listening reports the correct side |
| **Degradation Probability** | 0.6 | **Semi-MDP** | Chance of losing one level in a period of operation |
| **Discount (gamma)** | 0.95 | All | In [0, 1), per period on **Semi-MDP** |

## Values fixed in the code

Some numbers have no input of their own, and they are part of the example. To change them, edit the code.

| Model | Quantity | Value |
|---|---|---|
| **MDP** | `price`, `order_cost`, `holding_cost` per unit | 8.0, 2.0, 0.5 |
| **MDP** | Start of every simulation | Empty warehouse |
| **POMDP** | Listen, tiger's door, other door | −1, −100, +10 |
| **POMDP** | After a door opens | The tiger is reshuffled |
| **Semi-MDP** | `operate`, `maintain`, `replace`: duration | 1, 2 and 4 periods |
| **Semi-MDP** | `operate`, `maintain`, `replace`: reward | Current condition, −5, −20 |
| **Semi-MDP** | `maintain`, `replace`: effect | Up two levels, back to S |

## What each model prints

| Model | Printed result |
|---|---|
| **MDP** | `order_by_stock`, `value_when_empty`, `value_when_full` |
| **POMDP** | `action_at_uniform_belief`, `action_when_90pct_left`, `value_at_uniform_belief` |
| **Semi-MDP** | `action_by_condition`, `value_when_new`, `value_when_failed`, `iterations` |

The values are discounted totals in the units of the reward. On **POMDP**, the value is that of QMDP, and the actions are those of its policy.

## Visualise, Diagnose and Predict actions

| Action | **MDP** | **POMDP** | **Semi-MDP** |
|---|---|---|---|
| **Value Function** | V by stock | V by belief | V by condition |
| **Policy Map** | Order by stock | Action by belief | Action by condition |
| **Policy Simulation** | 20 steps: `stock`, `order`, `reward` | 20 steps: `tiger`, `action`, `heard`, `reward`, `belief_left` | 30 periods: `time`, `condition`, `action`, `reward` |
| **Belief Update / Bellman Residual** | `max_bellman_residual` | `heard`, `belief_left`, `next_action` | `max_bellman_residual`, `iterations` |
| **Monte Carlo Return** | `mean_return`, `standard_error`, `value_function_prediction` | The same | The same |
| **Online Planning / Reward Rate** | `mcts` against `value_iteration` per stock | `pomcp` against `qmdp` at three beliefs | `reward_per_period`, `share_of_decisions` |

## Compare and Interpret actions

| Action | **MDP** | **POMDP** | **Semi-MDP** |
|---|---|---|---|
| **Global vs Online Planning** | `value_iteration`, `mcts` | `qmdp`, `pomcp` | `semi_markov_policy`, `constant_discount_policy`, `policies_differ_at` |
| **Solver vs Baseline** | `optimal`, `myopic` | `actions`, `value_at_uniform`, `simulated_return` for QMDP and SARSOP | `optimal`, `run_to_failure` |
| **Alpha Vectors / Q-Values** | Heatmap of Q(s, a) | Lines of the alpha vectors | Heatmap of Q(s, a) |
| **State Value Lookup** | `stock`, `value`, `order` | `belief_left`, `value`, `action` | `condition`, `value`, `action` |

## Packages and textbooks

`POMDPs.jl`, from [Egorov, Sunberg, Balaban, Wheeler, Gupta and Kochenderfer (2017)](#ref-ESBWG...2017a), separates the statement of a problem from the solver, so `DiscreteValueIteration`, `QMDP`, `SARSOP`, `MCTS` and `BasicPOMCP` all work on the same `m`.

The theory of discounted and average-reward MDPs, with continuous-time models, is set out by [Puterman (2005)](#ref-Put2005a). [Kochenderfer (2015)](#ref-Koc2015a) covers decision making under uncertainty more broadly, including the online and belief-state methods.

## References

<a id="ref-ESBWG...2017a"></a>Egorov, M., Sunberg, Z. N., Balaban, E., Wheeler, T. A., Gupta, J. K., & Kochenderfer, M. J. (2017). POMDPs.jl: A Framework for Sequential Decision Making under Uncertainty. *Journal of Machine Learning Research*. [Online](https://jmlr.org/papers/v18/16-300.html)

<a id="ref-Koc2015a"></a>Kochenderfer, M. J. (2015). *Decision Making Under Uncertainty: Theory and Application*. MIT Press. [Online](https://mitpress.mit.edu/9780262029254/)

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
