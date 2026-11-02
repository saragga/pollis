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
| **Discount (gamma)** | 0.9 | Weight on the next stage, in [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a). The solver is `HiGHS`, whose dual simplex method comes from [Huangfu and Hall (2018)](#ref-HH2018a).

Single-stage normal-form games, including general-sum ones, are the subject of the **Game Theory** panel in the Economics Toolbox. A textbook on decision making under uncertainty in general is [Kochenderfer (2015)](#ref-Koc2015a).

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-Koc2015a"></a>Kochenderfer, M. J. (2015). *Decision Making Under Uncertainty: Theory and Application*. MIT Press. [Online](https://mitpress.mit.edu/9780262029254/)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
