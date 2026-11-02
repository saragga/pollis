# Multi-Agent Decision Processes: Diagnostics

The two tabs need different checks. JESP can stop at a poor local optimum, so its checks ask whether the search went far enough. Shapley iteration has a guaranteed limit, so its checks ask whether the iteration got there and whether the numbers agree.

## Has JESP found the best joint policy?

JESP gives no certificate of global optimality, so compare restarts. The run's `local_optima_values` lists the distinct values reached, and **JESP / Shapley Convergence** draws one line per restart. A value reached by many restarts at the top of the list is reassuring, though not a proof. A best value reached only once suggests more restarts are needed.

Lines that rise and flatten are the expected shape, as each sweep can only keep or raise the value. A flat line at a low value is a restart stuck where it began. Raise **JESP Restarts** and see whether the best value moves.

## Is the joint policy a true equilibrium of the team?

**Equilibrium Check** recomputes each agent's exact best response against the partner's final tree. If `best_response_agent1` and `best_response_agent2` do not exceed `joint_value`, then `is_equilibrium` is true and no agent can gain by changing alone.

A false result can occur even after JESP has stopped. The stopping test looks for no gain over one full sweep, while a tie can let the second agent change its tree in that sweep, leaving the first agent's tree no longer a best reply. Run more restarts if that happens. A true result does not mean a global optimum, because several equilibria of very different quality can exist.

## Checking Dec-Tiger against published values

At **Listening Accuracy** 0.85, Dec-Tiger has known exact optima for short horizons, reported as Tiger (A) by [Daniel Szer, François Charpillet and Shlomo Zilberstein (2005)](#ref-SCZ2005a).

| **Horizon (T)** | Exact optimum | Source |
|---|---|---|
| 1 | −2 | Hand calculation: both listen |
| 2 | −4.00 | Szer et al. |
| 3 | 5.19 | Szer et al. |
| 4 | 4.80 | Szer et al. |

A JESP value that matches the table means that the restarts have found the optimum for that horizon. A lower value means they have not, and a higher value signals an edited model or a bug.

## Sanity checks by changing listening accuracy

Two settings of **Listening Accuracy** have answers you can work out by hand. At 0.5, hearing tells nothing, so listening every stage is best and the joint value should be −2T, equal to `always_listen` in **Against Baselines**. At 1, each hint is certain and both agents hear the same thing, so listen then open is safe.

| **Horizon (T)** | Value at accuracy 0.5 | Value at accuracy 1 |
|---|---|---|
| 1 | −2 | −2 |
| 2 | −4 | 18 |
| 3 | −6 | 16 |
| 4 | −8 | 36 |

At accuracy 1, `cost_of_decentralisation` should reach 0, since private hearing then loses nothing.

## How far the exhaustive comparison reaches

**Local vs Global / Pure vs Mixed** on **Dec-POMDP** finds the true optimum by trying every tree of agent 1 and computing agent 2's exact best response to each. The answer equals the one from listing all joint policies, at far less cost: 2187 best responses at horizon 3, where listing pairs would need about 4.8 million evaluations.

The action uses min(T, 3), since horizon 4 would need about 14 million best responses. The default **Horizon (T)** of 3 is therefore tested at its own horizon. From horizon 4 up, read `horizon` in the output, as the comparison no longer covers the main run. The published Dec-Tiger value then remains the test at horizon 4.

## Has Shapley iteration converged?

**JESP / Shapley Convergence** on **Stochastic Games** plots the largest change in V per iteration on a log scale. Each iteration multiplies the change by gamma or less, so the curve should settle into a straight descent and cross the dashed **Tolerance** line.

A final change of d gives a bound on the distance to the true value of gamma d / (1 − gamma). At gamma = 0.9 and tolerance 1e-6, that bound is 9e-6, so the printed values are good to about five decimals, not six. The loop ends after 5000 iterations, so if `iterations` reads 5000, check the plot: the run may have stopped short of the tolerance.

## Reading the equilibrium gains in a stochastic game

**Equilibrium Check** on **Stochastic Games** asks, in each state, how much a player could gain by changing action for one stage while everything afterwards stays the same. In a discounted game, no profitable one-stage change implies no profitable change of any length, so `gain_player1` and `gain_player2` together test the whole strategy.

Values close to zero are the expected result, at the size of the solver's tolerance and of the remaining iteration error. Larger values point to an unconverged V or a solver failure. A small negative value is rounding. Tighten **Tolerance** and rerun: real gains shrink, while a modelling error remains.

## Comparing simulation with the exact value

**Joint Simulation** checks the calculation by an independent route. On **Dec-POMDP**, `mean_total_reward` averages 20,000 simulated episodes, and it should lie within about two values of `standard_error` of `exact_value`. A larger gap suggests that an edit to the reward or the transitions reached one function but not the other.

On **Stochastic Games**, each play has 200 stages from state 1, and the mean should approach `equilibrium_value_state1`. Truncation matters only with a long memory: gamma^200 is about 7e-10 at 0.9 but about 0.13 at 0.99. High discounts therefore bias the simulated mean, and no change in the number of plays fixes that.

## Common symptoms and their usual causes

| Symptom | Usual cause | What to try |
|---|---|---|
| `local_optima_values` shows many different values | Many team equilibria | Raise **JESP Restarts** and keep the best |
| Best value changes with restarts | Search has not settled | Raise restarts further, then compare with the table of published values |
| The run takes far longer after a small rise in T | Tree size doubles at each stage | Drop **Horizon (T)** by one |
| `iterations` equals 5000 | Discount very close to 1 | Lower the discount or edit `maxiter` |
| `pure_maximin` equals `pure_minimax` everywhere | A saddle point exists in each state | Expect pure equilibrium strategies |
| Bounds error at a policy tree | Edited `NO` but not `child` and `nodes` | Rewrite the tree indexing for more than two observations |

## References

<a id="ref-SCZ2005a"></a>Szer, D., Charpillet, F., & Zilberstein, S. (2005). MAA*: A Heuristic Search Algorithm for Solving Decentralized POMDPs. *UAI*. [arXiv:1207.1359](https://arxiv.org/abs/1207.1359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
