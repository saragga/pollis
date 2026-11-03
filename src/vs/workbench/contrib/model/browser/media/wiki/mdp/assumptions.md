# Single-Agent Decision Processes: Assumptions

A solver returns the best policy for the model it was given, so the conclusions are only as good as the model. The checks concern whether the state carries enough information, whether the probabilities and rewards are right, and whether the discount says what is intended.

## Is the state really Markov?

The next state has to depend only on the current state and action. If the past still matters, the policy is optimal for a problem you do not have.

The remedy is usually to enlarge the state. Demand with a seasonal pattern needs the season in the state, and a machine whose wear rate depends on its age needs the age. On the other side, each added variable multiplies the number of states, as value iteration, treated in [Puterman (2005)](#ref-Put2005a), visits every one of them in each sweep. Look at how the state in the **MDP** code is the stock alone, which is enough only because demand is independent from one period to the next.

## Are the transition probabilities known?

All three models take P(s' | s, a) as given. A policy computed from a wrong demand rate or degradation rate is optimal for the wrong problem, and nothing in the output will reveal that.

Vary the uncertain inputs and see whether the policy changes. **Mean Demand**, **Listening Accuracy** and **Degradation Probability** are the obvious candidates, and **Policy Map** or **State Value Lookup** shows the effect at once. A policy that stays the same over a plausible range is safer than one that changes. When the probabilities can only be learned from experience, the problem belongs under **Reinforcement Learning**.

## What does the reward really stand for?

The solver maximises the stated reward and nothing else, so anything left out has no weight at all.

| Model | Reward in the code | What it leaves out |
|---|---|---|
| **MDP** | Expected revenue less ordering and holding costs | Any cost of lost sales beyond the lost revenue |
| **POMDP** | −1, −100, +10 | Nothing outside the example |
| **Semi-MDP** | Production by condition, less repair costs | Any cost of downtime beyond lost production |

Only differences in rewards between actions matter for the policy, but the values scale with them. On **MDP**, an order larger than the free space is paid for in full and the excess is lost, so sensible policies avoid those orders. Unmet demand is simply lost, with no backlog.

## What does the discount assume?

**Discount (gamma)** is a preference for sooner rewards, or a chance that the process continues. Roughly, 1 / (1 − gamma) periods have a substantial weight, so a value near 1 means a long view.

| Effect of a higher gamma | Reason |
|---|---|
| Policies look further ahead | Later rewards count for more |
| Larger values of V | The geometric sum grows |
| More iterations in value iteration | Convergence is governed by gamma |
| Longer simulation needed | Truncated returns lose more of the sum |

The simulations stop at a fixed number of steps, 200 for the **MDP** in **Monte Carlo Return**. Close to gamma = 1, that truncation becomes visible in the comparison with `value_function_prediction`. The value 1 itself is not allowed.

## What must hold on a POMDP?

An observation model P(o | s', a) must be known, and the agent has to carry out Bayes' rule exactly, as `DiscreteUpdater` does. [Kaelbling, Littman and Cassandra (1998)](#ref-KLC1998a) show that a belief then summarises all the past for planning.

The belief is only as good as that model. If listening is truly less accurate than **Listening Accuracy** says, the belief grows too confident and the door opens too soon. The discrete updater also needs a finite set of states, and exact solutions become hard quickly as that set grows, which is why the panel uses approximations. Approximations in turn have assumptions of their own, as [Hauskrecht (2000)](#ref-Hau2000a) sets out for those that treat the state as known after one step.

## What must hold on a Semi-MDP?

The number of periods an action takes must be known in advance here, as `tau` fixes it for each action, though the general theory allows a random duration.

Rewards in the code are counted when an action starts, and the discount gamma^tau applies to what follows. A long action with income spread over its duration would need that income summed with its own discounting. Nothing happens during an action in this model: no new decision is made, and the condition does not change until the action ends. If interruptions matter, the action should be split into shorter ones.

## How large a problem is feasible?

| Method | Grows with | Practical range |
|---|---|---|
| Value iteration | States times actions times successors | Up to very many states if transitions are sparse |
| QMDP | The same, on the underlying MDP | As for value iteration |
| SARSOP | Beliefs reached under good policies | Far larger than exact POMDP solvers |
| MCTS, POMCP | Number of simulations per decision | Very large, even without explicit tables |

The examples in the code are deliberately small, so that every value can be read. [Kurniawati, Hsu and Lee (2008)](#ref-KHL2008a) report SARSOP on problems with up to 15,517 states.

## References

<a id="ref-Hau2000a"></a>Hauskrecht, M. (2000). Value-Function Approximations for Partially Observable Markov Decision Processes. *Journal of Artificial Intelligence Research* 13, 33-94. [doi:10.1613/jair.678](https://doi.org/10.1613/jair.678)

<a id="ref-KLC1998a"></a>Kaelbling, L. P., Littman, M. L., & Cassandra, A. R. (1998). Planning and Acting in Partially Observable Stochastic Domains. *Artificial Intelligence* 101(1-2), 99-134. [doi:10.1016/S0004-3702(98)00023-X](https://doi.org/10.1016/S0004-3702(98)00023-X)

<a id="ref-KHL2008a"></a>Kurniawati, H., Hsu, D., & Lee, W. S. (2008). SARSOP: Efficient Point-Based POMDP Planning by Approximating Optimally Reachable Belief Spaces. In *Robotics: Science and Systems IV*. [doi:10.15607/RSS.2008.IV.009](https://doi.org/10.15607/RSS.2008.IV.009)

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
