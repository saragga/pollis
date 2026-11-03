# Single-Agent Decision Processes: Diagnostics

A policy can be checked in three ways: whether the solver has converged, whether simulation returns what the values predict, and whether a simple baseline or an independent planner does any better.

## Has value iteration converged?

**Belief Update / Bellman Residual** on **MDP** and **Semi-MDP** applies the Bellman operator T once more to the solved values, and reports `max_bellman_residual`, the largest change in any state.

A residual r bounds the error in the values: the distance from V to V* is at most r / (1 − gamma), a standard result in [Puterman (2005)](#ref-Put2005a). So the residual has to be read with the discount in mind, as gamma near 1 enlarges the bound.

The stopping settings are `belres=1e-6` on **MDP** and `tol=1e-8` on **Semi-MDP**. On **Semi-MDP**, `iterations` should be well below `maxiter=10_000`, as reaching that figure means that the tolerance was not met.

## How should a belief respond?

**Belief Update / Bellman Residual** on **POMDP** feeds the observations `hear_left`, `hear_left`, `hear_right`, `hear_left`, `hear_left` to the updater, and shows `belief_left` and `next_action` after each.

The two equal reports pull the belief left, the opposite report takes it back exactly one step, and the next two bring it further left. With **Listening Accuracy** at 0.5, listening carries no information and the belief should not move at all. `next_action` shows the belief at which the policy stops listening and opens a door. A policy that opens the door after one report, or never at all, deserves a look at the rewards and the discount.

## Does simulation match the prediction?

**Monte Carlo Return** runs 500 episodes, and gives `mean_return`, `standard_error` and `value_function_prediction`.

| Model | Start | Expected relation |
|---|---|---|
| **MDP** | Empty warehouse, compared with `V(0)` | Agreement within about two standard errors |
| **Semi-MDP** | New machine, compared with `V(S)` | Agreement within about two standard errors |
| **POMDP** | Uniform belief, compared with `V(0.5)` | Below the prediction, since QMDP gives an upper bound |

A gap on **MDP** or **Semi-MDP** larger than the noise points to a mismatch between the simulated and the solved model, or to a truncation too short for the discount. On **POMDP**, the size of the gap tells you what QMDP's assumption costs, and **Solver vs Baseline** compares that with SARSOP.

## Reading one episode

**Policy Simulation** prints one episode, with seed 1, so that you can follow the logic by eye.

On **MDP**, look for stock levels being restored by the order and whether the costs and revenues make sense. On **POMDP**, follow `belief_left` through `heard`, and check that the door opens only after several reports, and that the belief returns towards 0.5 after a door opens, because the tiger is then reshuffled. On **Semi-MDP**, `time` advances by the duration of each action, 1, 2 or 4 periods, so the rows are not equally spaced in time. One episode is an illustration and not an estimate, and `discounted_return` varies widely between seeds.

## Does the policy have the expected shape?

**Policy Map** and **State Value Lookup** let you compare the result with intuition.

| Model | Shape to expect | A surprise suggests |
|---|---|---|
| **MDP** | Larger orders at lower stock, none when stock is high | Costs or demand are out of proportion |
| **POMDP** | Open right at low belief, listen in the middle, open left at high belief | A discount or reward that changes the balance |
| **Semi-MDP** | Operate at high condition, repair or replace at low condition | Costs that favour a different rule |

On **POMDP**, the policy in the middle band can be narrow or wide according to **Listening Accuracy** and **Discount (gamma)**. On **Value Function**, V should be non-decreasing in stock or condition for these examples, and convex in the belief on **POMDP**.

## Why might an online planner disagree?

**Online Planning / Reward Rate** lists `mcts` against `value_iteration` for each stock on **MDP**, and `pomcp` against `qmdp` at three beliefs on **POMDP**.

Disagreement is often harmless. Two actions can have nearly equal Q-values, in which case either is fine, and **Alpha Vectors / Q-Values** shows whether that is so. The planners are also random, so more simulations narrow the differences: raise `n_iterations` or `tree_queries`. A persistent difference on **POMDP** may be a true improvement, as POMCP plans on beliefs while QMDP assumes that uncertainty disappears after one step.

## Is the average really different?

**Global vs Online Planning** averages 50 episodes for each method on **MDP** and **POMDP**, and that sample gives a noisy result, while **Solver vs Baseline** uses 500.

Compute a standard error before reading a small difference as real. Raise the count `1:50` in the code when two figures lie close together. On **Semi-MDP**, the comparison uses 500 episodes, and `policies_differ_at` tells you directly whether the two policies differ. An empty list means that the durations did not change the decisions in this problem, so any gap in returns is then only noise.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| Error or `NaN` at **Mean Demand** of 0 | Poisson probabilities use log(0) | Use a small positive value |
| **Solver vs Baseline** fails on **POMDP** | `SARSOP` not installed or built | Check that package |
| Very slow value iteration | Gamma close to 1 | Lower gamma, or reduce **States (S)** |
| Same action everywhere | Rewards dominate the dynamics | Look at the size of the costs |
| Very low `reward_per_period` | Machine left failed | Check the policy at condition 0 |

## References

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
