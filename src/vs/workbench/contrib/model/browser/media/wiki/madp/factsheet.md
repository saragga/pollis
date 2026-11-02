# Multi-Agent Decision Processes: Factsheet

A quick reference for **Multi-Agent Decision Processes**: the two tabs, their inputs, their formulas and what each action computes. The solvers are written out in the panel's code, using Base Julia for **Dec-POMDP** and `JuMP` with `HiGHS` for **Stochastic Games**.

## Tabs, methods and formulas

| Tab | Method | Core formula | Main objects |
|---|---|---|---|
| **Dec-POMDP** | JESP with random restarts | Alternate exact best responses until neither agent improves | `jesp`, `best_response`, `evaluate`, `runs`, `best` |
| **Stochastic Games** | Shapley value iteration | V(s) ← value of the matrix game r(s) + gamma · sum over s' of P(s') V(s') | `matrix_game`, `stage`, `shapley`, `sh`, `eqs` |

A **Dec-POMDP** run reports `joint_value`, `local_optima_values` and each agent's first action. A **Stochastic Games** run reports `values_player1`, `iterations` and both players' strategies in state 1.

## Dec-POMDP inputs and defaults

| Input | Default | Meaning |
|---|---|---|
| **Listening Accuracy** | 0.85 | Chance that a listening agent hears the tiger's true side, when both listen |
| **Horizon (T)** | 3 | Number of decision stages; each policy tree has 2^T − 1 nodes |
| **JESP Restarts** | 10 | Random starting points, seeded 1 to the number of restarts |

Rewards, transitions and the two-observation structure are functions in the code (`reward`, `trans`, `obs`), and each JESP run stops after 50 iterations at most. The tooltip describes horizons up to 5 as quick. Horizons from 6 up also leave `centralised_pomdp` as `missing` in **Value of Communication / Discount Sensitivity**.

## Stochastic game inputs and defaults

| Input | Default | Meaning |
|---|---|---|
| **States (S)** | 5 | Number of states of the generated game |
| **Actions per Player (A)** | 3 | Actions of each player in every state |
| **Discount (gamma)** | 0.9 | Weight on the next stage, in [0, 1) |
| **Tolerance** | 1e-6 | Stop when the largest change in V is under this |
| **Random Seed** | 1 | Seed of the generated payoffs and transitions |

Payoffs come from `randn` rounded to two digits, and each transition row from normalised `rand` draws. Value iteration stops after 5000 iterations at most, a limit with no input of its own.

## Dec-Tiger reward table

Rewards per stage, for the pair of actions the two agents choose, in either order.

| Actions of the two agents | Reward |
|---|---|
| Both listen | −2 |
| Both open the safe door | +20 |
| Both open the tiger's door | −50 |
| One listens, the other opens the safe door | +9 |
| One listens, the other opens the tiger's door | −101 |
| They open different doors | −100 |

Listening leaves the tiger in place, and any door opening puts it back behind either door with probability 0.5. Observations carry information only when both agents listen.

## Visualise, Diagnose and Predict actions

| Group | Action | **Dec-POMDP** output | **Stochastic Games** output |
|---|---|---|---|
| Visualise | **Joint Value** | Best JESP value for horizons 1 to T | Bar chart of V by state |
| Visualise | **Policy Profile** | Both policy trees | Player 1's probabilities by state |
| Diagnose | **JESP / Shapley Convergence** | Value per iteration, one line per restart | Largest change in V per iteration, log scale |
| Diagnose | **Equilibrium Check** | `best_response_agent1`, `best_response_agent2`, `is_equilibrium` | `gain_player1`, `gain_player2` per state |
| Predict | **Joint Simulation** | 20,000 episodes against `exact_value` | 2000 plays of 200 stages from state 1 |
| Predict | **Value of Communication / Discount Sensitivity** | `centralised_pomdp`, `fully_observed`, `cost_of_decentralisation` | `value_state1` for several discounts |

## Compare and Interpret actions

| Group | Action | **Dec-POMDP** output | **Stochastic Games** output |
|---|---|---|---|
| Compare | **Local vs Global / Pure vs Mixed** | `exhaustive_optimum` against `jesp_best`, horizon 3 at most | `pure_maximin`, `mixed_value`, `pure_minimax` per state |
| Compare | **Against Baselines** | `always_listen`, `listen_then_open`, `random_trees` | `equilibrium_player1` against `myopic_player1` |
| Interpret | **Policy / Mixed Strategy** | Each agent's action after each history | Value and both strategies per state |
| Interpret | **Outcome Decomposition** | Listens, tiger meetings and safe doors per episode | `immediate_payoff` and `continuation` per state |

Every action reads the objects of the main run, so run the tab first after changing an input.

## Packages and sources

`POMDPs.jl` and `GameTheory.jl` are the panel's named packages, yet the tabs' code loads neither. Both are natural next steps for larger models. A framework for defining sequential decision problems and their solvers comes from [Maxim Egorov, Zachary N. Sunberg, Edward Balaban, Tim A. Wheeler, Jayesh K. Gupta and Mykel J. Kochenderfer (2017)](#ref-ESBWG...2017a). Solvers for normal-form games come from [QuantEcon Development Team (2023)](#ref-QEDT2023a).

A textbook on decision making under uncertainty in general is [Mykel J. Kochenderfer (2015)](#ref-Koc2015a).

## References

<a id="ref-ESBWG...2017a"></a>Egorov, M., Sunberg, Z. N., Balaban, E., Wheeler, T. A., Gupta, J. K., & Kochenderfer, M. J. (2017). POMDPs.jl: A Framework for Sequential Decision Making under Uncertainty. *Journal of Machine Learning Research*. [Online](https://jmlr.org/papers/v18/16-300.html)

<a id="ref-Koc2015a"></a>Kochenderfer, M. J. (2015). *Decision Making Under Uncertainty: Theory and Application*. MIT Press. [Online](https://mitpress.mit.edu/9780262029254/)

<a id="ref-QEDT2023a"></a>QuantEcon Development Team (2023). GameTheory.jl: Normal-Form Game Solvers in Julia. [GitHub](https://github.com/QuantEcon/GameTheory.jl)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
