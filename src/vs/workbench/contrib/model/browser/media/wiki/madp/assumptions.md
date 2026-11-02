# Multi-Agent Decision Processes: Assumptions

Each tab's answer rests on assumptions about what the decision makers want, what they know and how the world moves. A violated assumption usually changes the meaning of the result without producing any error.

## Dec-POMDP: one shared reward

A **Dec-POMDP** team receives one number at each stage and every agent wants the total to be as large as possible. No agent has a private goal, so nobody has any reason to mislead a partner, and the joint value is the only score.

Real teams can fall short of this. Agents may weigh costs differently, or a partner may act for its own benefit. Under those conditions, a policy that is best for the team may not be one that a self-interested agent would follow. Such a problem needs a model with separate rewards, such as a partially observable stochastic game, which is treated by [Frans A. Oliehoek and Christopher Amato (2016)](#ref-OA2016a).

## Dec-POMDP: planning together, acting apart

JESP plans offline with full knowledge of the model: rewards, transitions, observation chances and the initial belief. During planning, each agent's best response uses its partner's exact tree. During execution, each agent sees only its own history and follows its own tree, and no message passes between agents.

That split has two consequences. All agents must hold the same solution, including its tie-breaking, since a partner running another equally good tree can spoil the coordination. Nothing is replanned during an episode, so a wrong model, or a partner who strays from its tree, goes uncorrected until the horizon ends.

## Dec-POMDP: how the observations are modelled

In `obs`, the chance of a pair of observations given the next state is the product of two separate terms, so the agents' hints are independent once the tiger's side is known. Any correlation between what they hear comes through the tiger alone.

Independence matters because two hints count as two pieces of evidence. Sensors sharing a noise source, such as one loud room, would give less information than the model supposes. Both agents must also listen for the hint to carry information. Any door opening gives each pair of observations probability 0.25, whatever the state, so the observations after an opening say nothing.

## Dec-POMDP: finite horizon, no discounting

**Horizon (T)** fixes the number of stages in advance and all agents know it, and `evaluate` adds rewards with no discount. The agents can therefore plan a last stage knowing that nothing follows, which is why opening a door often happens late in a policy.

The first stage starts from the belief `b0 = [0.5, 0.5]`, a uniform belief over the tiger's side. After any opening the tiger returns to either side with equal chance, which also makes the problem symmetric between left and right. A problem with no natural end, or with an unknown one, needs an infinite-horizon formulation with finite-state controllers, which the panel does not include.

## Stochastic game: strict opposition of interests

In **Stochastic Games**, `Rw[s]` holds player 1's payoff, and player 2 receives exactly its negative in every state and action pair. Value iteration, the linear programme and the idea of a single game value all rely on that opposition. One number can then describe both players, and the choice between equilibria does not affect the value.

A breach of that assumption is easy to miss. If some outcomes are good or bad for both players, the model is general-sum, and the computed strategies only describe a worst-case guarantee for a game that nobody is playing. [Stochastic Games](stochastic-games.md) describes the general-sum case and its solution concept.

## Stochastic game: what the players observe

Both players see the current state exactly and choose at the same time, each without seeing the other's action. Payoffs and transitions depend on the current state and both actions, and they do not change over time. The state and action sets are finite and known to both.

Under those conditions, stationary strategies are enough: a player's choice depends on the current state, not on the history. [Lloyd S. Shapley (1953)](#ref-Sha1953a) established this result. Hidden information about the state, or rules that change over time, would break the single stage-by-stage calculation that the code relies on.

## Stochastic game: the discount must be under one

**Discount (gamma)** has to lie in [0, 1). The factor makes value iteration a contraction, so each sweep multiplies the error by gamma or less, and a unique value function exists.

At gamma = 1, this argument fails. Undiscounted total payoffs can diverge, and the code's generated game has no absorbing state to stop them. Values near 1 remain valid, but they need many more iterations and they mix a large continuation term into every payoff matrix. The discount can also be read as a chance that the game continues, with 1 − gamma as the chance of stopping after each stage, which is close to how Shapley first posed the problem.

## Stochastic game: a rational opponent

A minimax strategy guards against the worst the opponent can do. Against an opponent who plays the equilibrium, neither player gains by changing. Against a weak or predictable opponent, the equilibrium strategy still guarantees its value but does not try to exploit the weakness.

So the panel's answer describes a safe way to play, which is not necessarily the most profitable. If you have good evidence on how an opponent behaves, a best response to that behaviour can earn more, at the risk of being exploited if the evidence is wrong. The panel's strategies need no such evidence.

## Assumptions behind the generated game

The default game has independent normal payoffs and random transition rows, and these choices have consequences. Each transition probability is almost surely positive, so every state can be reached from every other and no state is absorbing. Payoffs have no pattern linking one state to the next, so no structure is available for players to plan around.

Results from a generated game show how the method behaves, not how a particular application behaves. To model a real problem, replace `Rw` and `P` with your own, keeping `Rw[s]` as an A × A matrix and `P[s]` as an A × A × S array whose third dimension sums to 1.

## References

<a id="ref-OA2016a"></a>Oliehoek, F. A., & Amato, C. (2016). *A Concise Introduction to Decentralized POMDPs*. Springer. [doi:10.1007/978-3-319-28929-8](https://doi.org/10.1007/978-3-319-28929-8)

<a id="ref-Sha1953a"></a>Shapley, L. S. (1953). Stochastic Games. *Proceedings of the National Academy of Sciences* 39(10), 1095-1100. [doi:10.1073/pnas.39.10.1095](https://doi.org/10.1073/pnas.39.10.1095)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
