# Dec-POMDPs

A decentralised partially observable Markov decision process describes a team that shares one reward while each member acts on its own noisy observations. The **Dec-POMDP** tab solves the Dec-Tiger benchmark with JESP.

## Definition of a Dec-POMDP

A Dec-POMDP has a set of agents, a set of states, and for each agent a set of actions and a set of observations. A transition function gives the next state's probabilities from the state and the joint action. An observation function gives the chances of a joint observation given that action and the next state. A single reward function scores each state and joint action, and a horizon T and an initial belief complete the model.

The aim is one policy per agent, mapping that agent's own history to an action, to maximise the expected total reward. [Frans A. Oliehoek and Christopher Amato (2016)](#ref-OA2016a) give the standard modern treatment.

## How Dec-Tiger defines the model

The panel's Dec-Tiger has two states (tiger left, tiger right), three actions per agent (listen, open left, open right) and two observations per agent (heard left, heard right).

| Part of the model | Code | Rule |
|---|---|---|
| Rewards | `reward(s, a1, a2)` | Table in the [Factsheet](factsheet.md) |
| Transitions | `trans(s2, s, a1, a2)` | Both listen: state stays. Otherwise: either side, 0.5 |
| Observations | `obs(o1, o2, s2, a1, a2)` | Both listen: independent hints. Otherwise: 0.25 each |
| Initial belief | `b0` | 0.5 on each side |

**Listening Accuracy** generalises the fixed value of 0.85 in the original problem. These rewards and rules come from [Ranjit Nair, Milind Tambe, Makoto Yokoo, David Pynadath and Stacy Marsella (2003)](#ref-NTYPM2003a).

## What a policy tree is

A policy tree holds one action per possible observation history. The root is the first stage's action, and each node has one branch per observation. With two observations and T stages, a tree has 2^T − 1 nodes, and the code stores it as a vector with `child(nd, o) = 2nd + o - 1` giving the next node.

Because the tree has no belief inside it, an agent needs only to follow branches during execution, which is very cheap. The number of possible trees is the difficulty: three actions at every node gives 3^(2^T − 1) per agent. That count grows doubly exponentially in the horizon, and it is why exact search stops at short horizons.

## Why a Dec-POMDP cannot be reduced to one POMDP

A single POMDP agent can summarise its past in a belief over states and plan from that. A team has no such shared summary, as each agent holds different information, and there is no central point at which it could be combined.

What an agent needs for its own decision is a belief over the state and its partner's position in the partner's tree. `best_response` keeps exactly that, as `B[(s, nj)]`. Such a belief exists only when the partner's policy is fixed, which is the idea that JESP exploits. The general problem provably has no polynomial-time solution, a consequence of the NEXP-completeness result of [Daniel S. Bernstein, Robert Givan, Neil Immerman and Shlomo Zilberstein (2002)](#ref-BGIZ2002a).

## How JESP works, step by step

JESP stands for Joint Equilibrium-based Search for Policies. The panel's `jesp` follows these steps:

1. Draw a random tree for each agent, using the restart's seed.
2. Fix agent 2's tree and compute agent 1's exact best response.
3. Fix agent 1's new tree and compute agent 2's exact best response.
4. Stop if the joint value did not rise over that sweep, or after 50 sweeps.

With one tree fixed, the other agent faces a single-agent problem, solved by recursion over its histories. No step can lower the joint value, so the value rises and stops. **JESP Restarts** then repeats all of this from new random trees and keeps the best run.

## Why JESP stops at local optima: a one-stage example

A one-stage game shows the problem by hand, starting from a uniform belief. The two agents act once, and the table lists the three stable pairs.

| Joint action | Value | Deviating to listen or another door |
|---|---|---|
| Both listen | −2 | Opening alone gives 0.5 (−101) + 0.5 (9) = −46 |
| Both open left | 0.5 (−50) + 0.5 (20) = −15 | Listening gives −46, opening right gives −100 |
| Both open right | −15 | Same, by symmetry |

Each pair is a best reply to itself, so a JESP run starting at both opening a door remains at −15, whereas the optimum is −2. Longer horizons add many more such traps, which is why restarts matter and why `local_optima_values` often lists several numbers.

## Listening once, then opening: a hand calculation

The value of evidence can be worked by hand at accuracy 0.85, with the tiger on either side, by symmetry. Listening once and then opening the door opposite the side heard goes badly, since private hints can disagree.

| Second stage outcome | Probability | Reward |
|---|---|---|
| Both hear correctly, safe door together | 0.7225 | +20 |
| Both hear wrongly, tiger's door together | 0.0225 | −50 |
| Hints disagree, different doors | 0.255 | −100 |

The expected second-stage reward is −12.175, for a total of −14.175 with the first listen. Listening twice totals only −4, the published optimum at horizon 2, because a single hint cannot justify the risk of a mismatch.

## Listening twice, then opening: a hand calculation

With one more stage, listen twice and open only if the two hints agree, otherwise listen. That is the `listen_then_open` policy in **Against Baselines** at T = 3. Per agent, the chances are 0.7225 for two correct hints, 0.0225 for two wrong ones and 0.255 for mixed.

| Third stage outcome | Probability | Reward |
|---|---|---|
| Both safe door | 0.5220 | +20 |
| Both tiger's door | 0.0005 | −50 |
| Different doors | 0.0325 | −100 |
| One listens, other safe door | 0.3685 | +9 |
| One listens, other tiger's door | 0.0115 | −101 |
| Both listen | 0.0650 | −2 |

The third stage's expected reward is 9.19, and with −4 for the first two stages the total is 5.19, the published optimum at T = 3.

## What the centralised bounds tell you

**Value of Communication / Discount Sensitivity** computes two upper bounds on any decentralised value. `central_value` is the exact POMDP over joint actions when the agents share all observations, solved by recursion on the belief. `fully_observed` is 20T for Dec-Tiger, as both agents would open the safe door at every stage.

Each bound holds for any joint policy, so a JESP value exceeding either signals an error. Those relaxations have a further use, since solving a relaxed problem gives optimistic value estimates that guide search in larger Dec-POMDPs. Such approximate Q-value functions are studied by [Frans A. Oliehoek, Matthijs T.J. Spaan and Nikos Vlassis (2008)](#ref-OSV2008a).

## References

<a id="ref-BGIZ2002a"></a>Bernstein, D. S., Givan, R., Immerman, N., & Zilberstein, S. (2002). The Complexity of Decentralized Control of Markov Decision Processes. *Mathematics of Operations Research* 27(4), 819-840. [doi:10.1287/moor.27.4.819.297](https://doi.org/10.1287/moor.27.4.819.297)

<a id="ref-NTYPM2003a"></a>Nair, R., Tambe, M., Yokoo, M., Pynadath, D., & Marsella, S. (2003). Taming Decentralized POMDPs: Towards Efficient Policy Computation for Multiagent Settings. *IJCAI*. [Online](https://www.ijcai.org/Proceedings/03/Papers/103.pdf)

<a id="ref-OA2016a"></a>Oliehoek, F. A., & Amato, C. (2016). *A Concise Introduction to Decentralized POMDPs*. Springer. [doi:10.1007/978-3-319-28929-8](https://doi.org/10.1007/978-3-319-28929-8)

<a id="ref-OSV2008a"></a>Oliehoek, F. A., Spaan, M. T. J., & Vlassis, N. (2008). Optimal and Approximate Q-value Functions for Decentralized POMDPs. *Journal of Artificial Intelligence Research* 32, 289-353. [doi:10.1613/jair.2447](https://doi.org/10.1613/jair.2447)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Stochastic Games](stochastic-games.md)
