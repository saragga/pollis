# Multi-Agent Decision Processes: Decision Guide

Start from who wants what and who knows what, since those answers select the model. Then choose the inputs that fit the time and the accuracy you need.

## Choosing between a Dec-POMDP and a stochastic game

| Your situation | Tab or route | Why |
|---|---|---|
| A team with one goal, private sensors and no messages | **Dec-POMDP** | Shared reward with decentralised information |
| Two opponents who see the state, one's gain the other's loss | **Stochastic Games** | Zero-sum with a state, and a single value exists |
| Two opponents in one repeated situation | **Stochastic Games** with **States (S)** = 1 | The game reduces to a matrix game |
| Partly shared, partly opposed interests | Neither tab | General-sum game, with no single value |
| A team that can share every observation for free | Neither tab | Becomes one POMDP over joint actions |

## When a different panel fits better

Two neighbouring panels cover cases these models do not. With one decision maker, or a team that shares everything, use **Single-Agent Decision Processes**, where exact methods go much further.

If nobody knows the rewards and transitions and the agents must learn from experience, use **Multi-Agent Reinforcement Learning**, as both tabs here plan from a known model. The minimax-Q algorithm of [Michael L. Littman (1994)](#ref-Lit1994a) is the classic bridge, replacing the known model in a zero-sum game with learned action values. Choose this panel when the model is known, or small enough to specify by hand.

## Choosing the Dec-POMDP horizon

**Horizon (T)** drives cost more than any other input, since each agent's tree has 2^T − 1 nodes with three possible actions each.

| **Horizon (T)** | Nodes per tree | Trees per agent |
|---|---|---|
| 1 | 1 | 3 |
| 2 | 3 | 27 |
| 3 | 7 | 2187 |
| 4 | 15 | about 1.4 × 10^7 |
| 5 | 31 | about 6.2 × 10^14 |

Best responses avoid listing the trees, so JESP gets much further than exhaustive search, though each extra stage still multiplies its work. Set the horizon by the real number of decisions, and remember that a value depends on where the horizon falls, as an opening needs prior listening.

## Choosing the number of JESP restarts

**JESP Restarts** buys protection against poor local optima at a cost proportional to its value. Ten is a reasonable start for small horizons. Use more if `local_optima_values` shows many values, or if the best one appears rarely.

A simple rule is to double the restarts until the best value stops changing, and then to accept that value as a good answer, without a proof of optimality. Each restart uses a fixed seed, 1 to the number of restarts, so reruns repeat the same answer and the same luck.

## Alternatives to JESP for a Dec-POMDP

The panel's code offers JESP alone. [Sven Seuken and Shlomo Zilberstein (2008)](#ref-SZ2008a) survey the other families.

| Method | Idea | Guarantee | Scale |
|---|---|---|---|
| Exhaustive search | Evaluates every joint policy | Global | Horizon 2 in Dec-Tiger, in practice |
| MAA* | Heuristic search over partial joint policies | Global | Short horizons |
| Dynamic programming | Builds trees backwards, pruning dominated ones | Global | Short horizons |
| JESP | Alternates exact best responses | Local | Few agents, moderate horizons |
| Point-based methods | Keep a limited set of trees for sampled beliefs | Approximate | Longer horizons |

Choose by whether you need a certificate of optimality or only a good policy.

## Choosing the discount and tolerance

**Discount (gamma)** should come from the problem: how much a future stage counts, or the chance the game continues. It also sets the cost, because iterations grow about like ln(tolerance) / ln(gamma). Each iteration solves one linear programme per state.

| **Discount (gamma)** | Iterations at **Tolerance** 1e-6, first change about 1 |
|---|---|
| 0.5 | About 20 |
| 0.9 | About 130 |
| 0.99 | About 1400 |
| 0.999 | About 14,000, past the 5000 limit |

Each extra decimal of **Tolerance** costs ln(10) / ln(1 / gamma) iterations, about 22 at gamma 0.9. Reduce **States (S)** first if runs are slow, since it multiplies the number of programmes and the size of each sum.

## When a zero-sum model is not enough

The zero-sum structure gives a single value, reliable computation and safe strategies, and those are lost once interests partly overlap. In a general-sum game, a Nash equilibrium always exists for finite games, according to [John Nash (1951)](#ref-Nas1951a), but several may exist with different payoffs, and players may not agree on which to play.

Treat the zero-sum tab as an approximation only when opposition truly dominates. Otherwise, use the notebook **Stochastic Game: General-Sum**, or `GameTheory.jl` for single-stage games. A cooperative reading of a mostly shared payoff may be better served by a team model.

## Using your own problem in the Dec-POMDP code

Editing the code is the route to a problem other than Dec-Tiger. Change `reward`, `trans`, `hear` and `obs`, and the constants `NS` and `NA`, and the belief `b0`. `ACTIONS` should match the new action names, and every action that mentions listening or doors, such as **Against Baselines** and **Outcome Decomposition**, needs its own rewrite.

Three limits are structural. `child` and `nodes` build binary trees, so `NO` must stay at 2 unless they are rewritten. `episode` assumes two states when it draws the next one. All functions are written for two agents, so a third needs new code throughout, and a framework such as `POMDPs.jl` may then be a better starting point. `fully_observed` is also a Dec-Tiger formula and needs replacing.

## References

<a id="ref-Lit1994a"></a>Littman, M. L. (1994). Markov Games as a Framework for Multi-Agent Reinforcement Learning. *Machine Learning Proceedings 1994*, 157-163. [doi:10.1016/B978-1-55860-335-6.50027-1](https://doi.org/10.1016/B978-1-55860-335-6.50027-1)

<a id="ref-Nas1951a"></a>Nash, J. (1951). Non-Cooperative Games. *Annals of Mathematics* 54(2), 286-295. [doi:10.2307/1969529](https://doi.org/10.2307/1969529)

<a id="ref-SZ2008a"></a>Seuken, S., & Zilberstein, S. (2008). Formal Models and Algorithms for Decentralized Decision Making under Uncertainty. *Autonomous Agents and Multi-Agent Systems* 17(2), 190-250. [doi:10.1007/s10458-007-9026-5](https://doi.org/10.1007/s10458-007-9026-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
