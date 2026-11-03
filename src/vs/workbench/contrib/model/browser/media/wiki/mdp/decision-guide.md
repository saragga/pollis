# Single-Agent Decision Processes: Decision Guide

Two questions select a model: can the agent see the state, and do actions take the same amount of time? Within **POMDP**, a further question selects the solver: how much of the value of information does the problem depend on?

## Which model fits the problem?

| Can the state be seen? | Do actions take equal time? | Model |
|---|---|---|
| Yes | Yes | **MDP** |
| Yes | No | **Semi-MDP** |
| No | Yes | **POMDP** |
| No | No | **POMDP**, with durations added by hand |

A state that is nearly known can be treated as known. Try **MDP** first in such a case, as it is far easier, and move to **POMDP** only if the remaining uncertainty changes decisions. Actions of nearly equal length can likewise be treated as one period, and **Global vs Online Planning** on **Semi-MDP** measures what that loses.

## Which solver for a hidden state?

| Solver | How it works | Good for | Limited by |
|---|---|---|---|
| QMDP | Solves the MDP, then averages under the belief | Quick baselines; information has little value | Gives no credit to gathering information |
| SARSOP | Point-based search on reachable beliefs | Accurate policies on moderate problems | Time to compute before acting |
| POMCP | Simulation from the current belief | Large problems with a simulator | Time and noise at each decision |

Start with QMDP since it costs little, and treat its value as an upper bound. If **Solver vs Baseline** shows `simulated_return` much higher under SARSOP, information matters, and QMDP is not enough. The original description of QMDP is by [Littman, Cassandra and Kaelbling (1995)](#ref-LCK1995a), and SARSOP's is by [Kurniawati, Hsu and Lee (2008)](#ref-KHL2008a).

## Global or online planning?

| Situation | Better choice | Reason |
|---|---|---|
| Few states, all may arise | Global | One solve, then instant decisions |
| Too many states to enumerate | Online | Only the visited states cost anything |
| A decision must be instant | Global | Online planners take time per decision |
| A simulator but no explicit probabilities | Online | MCTS and POMCP need samples only |
| The policy has to be inspected or audited | Global | A table can be read |

MCTS builds on the bandit idea of [Kocsis and Szepesvári (2006)](#ref-KS2006a), and POMCP extends tree search to beliefs, as described by [Silver and Veness (2010)](#ref-SV2010a).

## How should the discount be set?

Choose **Discount (gamma)** from the problem's horizon. If 1 / (1 − gamma) periods should matter, gamma follows at once: 0.95 gives about 20 periods, and 0.99 about 100.

In a financial setting, gamma can be the discount rate per period. In a task with a natural random end, it can be the chance of continuing. A very high value increases solve time and shifts decisions towards the long term, which may amplify the errors in a rough model. On **Semi-MDP**, gamma is per period, so a change in the length of a period has to be matched by a new gamma and new durations. Vary it and see whether **Policy Map** changes.

## How to use your own problem

Each model keeps the problem in a few definitions that you can rewrite.

| Model | What to change | What stays |
|---|---|---|
| **MDP** | `states`, `actions`, `transition`, `reward`, and the index functions | `solve` and every action |
| **POMDP** | The same, plus `observations`, `observation` and `obsindex` | `solve`, the updater and the planners |
| **Semi-MDP** | `outcomes`, `tau`, `R`, `ACTIONS` | `Q`, `value_iteration`, `rollout` |

The actions refer to the example in places: `:tiger_left` in **POMDP** outputs, and `stock` as a label on **MDP**. Adjust those too. `POMDPs.jl`, from [Egorov, Sunberg, Balaban, Wheeler, Gupta and Kochenderfer (2017)](#ref-ESBWG...2017a), has its own documentation of the interface.

## Should the panel be used at all?

| Situation | Better place |
|---|---|
| Probabilities unknown, experience available | **Reinforcement Learning** |
| Several agents acting together | **Multi-Agent Decision Processes** |
| Continuous state on a grid, stated as a Bellman equation | **Dynamic Programming** |
| Linear dynamics with quadratic cost | **Linear Optimal Control** |
| Staged decisions over scenarios | **Stochastic Programming** |

Continuous states can be handled here only after discretising them, and the number of states grows quickly with the dimension. When a problem has useful structure, a dedicated method will usually do much better than a table of every state.

## A sensible order of work

1. Write down the state, and ask whether it is really Markov.
2. Run the model, and read `order_by_stock` or its equivalent against intuition.
3. Check convergence with **Belief Update / Bellman Residual**.
4. Confirm the values with **Monte Carlo Return**.
5. Measure what planning is worth with **Solver vs Baseline**.
6. Vary the uncertain inputs and see whether **Policy Map** changes.

The last step matters most, since the probabilities are usually estimates and a policy that changes with small errors in them is hard to trust. A thorough treatment of modelling choices is in [Kochenderfer (2015)](#ref-Koc2015a).

## References

<a id="ref-ESBWG...2017a"></a>Egorov, M., Sunberg, Z. N., Balaban, E., Wheeler, T. A., Gupta, J. K., & Kochenderfer, M. J. (2017). POMDPs.jl: A Framework for Sequential Decision Making under Uncertainty. *Journal of Machine Learning Research*. [Online](https://jmlr.org/papers/v18/16-300.html)

<a id="ref-Koc2015a"></a>Kochenderfer, M. J. (2015). *Decision Making Under Uncertainty: Theory and Application*. MIT Press. [Online](https://mitpress.mit.edu/9780262029254/)

<a id="ref-KS2006a"></a>Kocsis, L., & Szepesvári, C. (2006). Bandit Based Monte-Carlo Planning. In *Machine Learning: ECML 2006*, 282-293. Springer. [doi:10.1007/11871842_29](https://doi.org/10.1007/11871842_29)

<a id="ref-KHL2008a"></a>Kurniawati, H., Hsu, D., & Lee, W. S. (2008). SARSOP: Efficient Point-Based POMDP Planning by Approximating Optimally Reachable Belief Spaces. In *Robotics: Science and Systems IV*. [doi:10.15607/RSS.2008.IV.009](https://doi.org/10.15607/RSS.2008.IV.009)

<a id="ref-LCK1995a"></a>Littman, M. L., Cassandra, A. R., & Kaelbling, L. P. (1995). Learning Policies for Partially Observable Environments: Scaling Up. In *Machine Learning Proceedings 1995*, 362-370. [doi:10.1016/B978-1-55860-377-6.50052-9](https://doi.org/10.1016/B978-1-55860-377-6.50052-9)

<a id="ref-SV2010a"></a>Silver, D., & Veness, J. (2010). Monte-Carlo Planning in Large POMDPs. In *Advances in Neural Information Processing Systems 23*. [Online](https://papers.nips.cc/paper_files/paper/2010/hash/edfbe1afcf9246bb0d40eb4d8027d90f-Abstract.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
