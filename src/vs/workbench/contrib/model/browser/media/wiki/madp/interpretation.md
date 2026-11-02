# Multi-Agent Decision Processes: Interpretation

The two tabs produce different kinds of numbers: a team's expected total on **Dec-POMDP**, and one player's guaranteed long-run payoff on **Stochastic Games**. Neither is a probability, and the two scales are not comparable.

## What the joint value of a Dec-POMDP means

`joint_value` is the expected sum of team rewards over all stages, starting from a uniform belief about the tiger, if both agents follow their trees. No discount applies, so a stage late in the episode counts as much as the first. Being an average, the value mixes good episodes with episodes where the tiger is met, and a positive value can hide costly failures.

`local_optima_values` gives the other values JESP reached from other starting points. Those are other equilibria of the team, each one a stable way of coordinating, but with a worse total than the best one.

## Reading a joint value across horizons

**Joint Value** on **Dec-POMDP** need not rise with each extra stage. For Dec-Tiger at 0.85 accuracy, the published optima are −4.00 at horizon 2, 5.19 at horizon 3 and 4.80 at horizon 4, according to [Szer, Charpillet and Zilberstein (2005)](#ref-SCZ2005a).

Two listens are needed before an opening is worth the risk, and that explains the jump at horizon 3. A fourth stage can add a listening cost without leaving room for a second well-informed opening, which fits the small drop at horizon 4. Horizons cannot be compared as simple rates of reward.

## Reading a policy tree and observation histories

**Policy Profile** draws each agent's tree, with the left branch meaning heard left. **Policy / Mixed Strategy** prints the same plan as a list: `start` is the first stage, and a history such as `LR` means heard left, then heard right.

A typical plan listens early and opens only after consistent hints: the door opposite the side heard. A mixed history usually means listening again, as the evidence is cancelled. The two agents' trees may differ and still be jointly optimal, as coordination depends on how the trees fit together. When a history cannot occur, as with accuracy 1, the code fills its node with listen by default, which has no effect on the value.

## What the value of communication measures

**Value of Communication / Discount Sensitivity** on **Dec-POMDP** puts three values side by side. `decentralised` is the JESP result. `centralised_pomdp` shares both agents' observations at no cost, and `fully_observed` lets them see the tiger, which gives 20 per stage.

| Value | Agents know | Bound |
|---|---|---|
| `decentralised` | Own history | Lowest |
| `centralised_pomdp` | Both histories | Middle |
| `fully_observed` | The state | Highest |

`cost_of_decentralisation` is the difference between the first two, an upper limit on what a free communication channel could add. A local JESP solution inflates that figure, since part of the gap may then be search failure. Such relaxations also serve as heuristics for larger models, as studied by [Oliehoek, Spaan and Vlassis (2008)](#ref-OSV2008a).

## Reading the Dec-POMDP outcome counts

**Outcome Decomposition** on **Dec-POMDP** simulates 5000 episodes and counts events per episode, which explains where the value comes from.

| Output | What it counts | Maximum |
|---|---|---|
| `listens_per_episode` | Listens by either agent | 2T, as both agents count |
| `tiger_met_per_episode` | Stages with reward at or under −50 | T |
| `safe_door_per_episode` | Stages with reward +9 or +20 | T |
| `mean_total_reward` | Average episode total | Close to `joint_value` |

The tiger count groups three events: both at the tiger's door, one at the tiger's door while the other listens, and two different doors. Rewards of −2 appear in no count but `mean_total_reward`, as neither door is opened by those stages.

## What a state's value in a stochastic game means

`values_player1` gives, for each state, the discounted total that player 1 can guarantee and that player 2 can hold player 1 down to. Player 2's value is the negative. A positive number favours player 1, starting from that state.

The size scales roughly with 1 / (1 − gamma), since it sums a geometric stream of payoffs. A constant stage payoff of 1 is worth 10 at gamma 0.9 and 100 at gamma 0.99, so differences across discounts are not differences in advantage. Multiply by (1 − gamma) to compare them as average payoffs per stage. The bars in **Joint Value** compare starting states within one game, so they tell how much the starting state matters.

## Why equilibrium strategies are mixed

A mixed strategy is a set of action probabilities, drawn afresh each time the state is visited. In a zero-sum game, any predictable choice can be exploited, so randomising is how a player guarantees its value. **Policy / Mixed Strategy** lists both players' strategies by state, and **Policy Profile** shows player 1's as a heatmap.

An action with probability 0 is outside the equilibrium's support and is not necessarily a bad action in general. A player is indifferent among the actions in the support, against the opponent's equilibrium. The value is unique, while the strategies need not be. Another solver can return different probabilities with the same value.

## Reading pure and mixed security levels

**Local vs Global / Pure vs Mixed** on **Stochastic Games** gives three numbers per state, which always satisfy `pure_maximin` ≤ `mixed_value` ≤ `pure_minimax`.

| Output | Meaning |
|---|---|
| `pure_maximin` | Player 1's guarantee when restricted to one action |
| `mixed_value` | Value when both players may randomise |
| `pure_minimax` | The lowest payoff player 2 can hold player 1 to with one action |

The gap between the outer numbers shows how much randomising matters. If they are equal, the state has a saddle point and a pure strategy is enough. All three use the same continuation values, so they describe that one stage game and assume the equilibrium afterwards.

## Immediate payoff against the future

**Outcome Decomposition** on **Stochastic Games** splits each state's value into `immediate_payoff`, the expected payoff at this stage under the equilibrium, and `continuation`, the discounted value of what follows. A large continuation means the state is valuable mainly for where it leads.

**Against Baselines** tests that distinction by letting player 1 ignore the future. `myopic_player1` plays the best strategy for each state's immediate payoff, while `equilibrium_player1` uses the full calculation, both against player 2's equilibrium strategy. The myopic value cannot exceed the equilibrium value, apart from rounding. A wide gap shows that planning matters, and at gamma = 0 the two coincide.

## References

<a id="ref-OSV2008a"></a>Oliehoek, F. A., Spaan, M. T. J., & Vlassis, N. (2008). Optimal and Approximate Q-value Functions for Decentralized POMDPs. *Journal of Artificial Intelligence Research* 32, 289-353. [doi:10.1613/jair.2447](https://doi.org/10.1613/jair.2447)

<a id="ref-SCZ2005a"></a>Szer, D., Charpillet, F., & Zilberstein, S. (2005). MAA*: A Heuristic Search Algorithm for Solving Decentralized POMDPs. *UAI*. [arXiv:1207.1359](https://arxiv.org/abs/1207.1359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
