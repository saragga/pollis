# Multi-Agent Reinforcement Learning: Assumptions

Both tabs learn from experience, so they need far fewer assumptions about the model than planning does. They still rely on what agents can see, on tables that fit in memory and on enough repetition. A violation usually appears as a poor policy, with no error.

## Cooperative: a fully shared reward

Every agent receives the same −1 per step, and that shared signal is the only feedback. No agent is told which of them caused a delay, so credit cannot be divided. If one agent wanders off, all agents are charged equally and the wanderer learns nothing specific.

A team with partly private goals would need separate rewards and a different analysis. Credit assignment in a shared reward is a central problem of the field, and counterfactual baselines are one answer, proposed by [Foerster, Farquhar, Afouras, Nardelli and Whiteson (2018)](#ref-FFANW2018a). Those baselines are not used in the panel's code.

## Cooperative: every agent sees all positions

The state `s` holds all agents' positions, and each table, even under **Independent Q-Learning (IQL)**, is indexed by that full state. "Independent" here refers to actions: an agent's table ignores what the others do at the same step, not where they stand.

Agents with only local sensors would see far less, and the problem would become partially observable. The tab's results are therefore optimistic about decentralised acting. To model local views, the code would have to index each table by that agent's own observation, as in a decentralised partially observable model.

## Cooperative: a fixed start and deterministic moves

Moves always succeed, walls simply block, and two agents can share or swap cells with no collision. Every episode starts from the same corners. Rewards and rules do not change during training.

Fixed starts mean the policy learns only what it reaches. Greedy behaviour from a position that training rarely visited may be arbitrary, so a trained team may not recover if pushed away from its usual route, which **Evaluation** tests by making one agent act at random. Random moves or varied starts would improve coverage and need more episodes.

## Cooperative: enough visits to every entry

Q-learning for one agent converges under conditions that include visiting every state and action infinitely often and shrinking the step size. The tab does neither: **Learning Rate (alpha)** and **Exploration (epsilon)** stay constant, and training ends after **Episodes**.

For a deterministic task, a constant step size is less of a concern, but coverage still is. Tables are created only when entries are touched, and a state that training never reached has all zeros, which makes `argmax` return "stay". With several learners, the single-agent guarantee does not apply at all.

## Independent learners treat the others as fixed

**Independent Q-Learning (IQL)** applies a single-agent update as if the others were part of a stationary environment. That is false while they learn, so the update has no convergence guarantee, though it often works in small problems, as first examined by [Tan (1993)](#ref-Tan1993a).

**Value Decomposition (VDN)** relaxes this during training but assumes that the team's value can be written as a sum over agents, one term per agent's own action. Tasks whose value depends on particular combinations of actions break that form. The **Central Joint-Action Learner** removes both problems, as it faces one stationary decision problem, at the cost of a much larger table.

## Competitive: a solvable, turn-based, zero-sum game

Tic-tac-toe has two players taking turns, with a fully visible board, no chance moves and outcomes that are exactly opposite. The panel relies on all of these. Full visibility and no chance means a table of boards is a complete description, and the perfect benchmark from `negamax` exists because the game is small enough to search completely.

Games with hidden cards or simultaneous moves may need mixed strategies, which a greedy table cannot express. Games too large to search have no such benchmark, so strength would have to be measured against other programs.

## Competitive: both sides can share one table

One table serves both players because each board is stored multiplied by the player who has just moved, so that player's marks always read +1. The same pattern of marks means the same thing for either player, which holds in tic-tac-toe, where the roles differ only by who moved first.

Move counts keep the two viewpoints apart, as X's afterstates have one more X than O, and O's afterstates have equal counts. An asymmetric game, with different rules or goals per side, would need separate tables. Rotations and reflections of a board are not merged, so each is learned separately.

## Competitive: self-play finds what it visits

Self-play assumes that playing against yourself eventually exposes your own weaknesses. In a small game with exploration, it largely does. The table's opponent is always its current self, with no pool of past versions, so a weakness that the current policy never tests can survive.

The values also reflect the exploring policy, not perfect play, because updates continue after random moves. Under an **Exploration (epsilon)** of 0.1, opponents blunder sometimes, and those blunders feed into the values. In the wider literature, training against a single opponent is known to overfit to it, as shown by [Lanctot, Zambaldi, Gruslys, Lazaridou, Tuyls, Perolat, Silver and Graepel (2017)](#ref-LZGLT...2017a).

## References

<a id="ref-FFANW2018a"></a>Foerster, J., Farquhar, G., Afouras, T., Nardelli, N., & Whiteson, S. (2018). Counterfactual Multi-Agent Policy Gradients. *AAAI*. [Online](https://ojs.aaai.org/index.php/AAAI/article/view/11794)

<a id="ref-LZGLT...2017a"></a>Lanctot, M., Zambaldi, V., Gruslys, A., Lazaridou, A., Tuyls, K., Pérolat, J., Silver, D., & Graepel, T. (2017). A Unified Game-Theoretic Approach to Multiagent Reinforcement Learning. [arXiv:1711.00832](https://arxiv.org/abs/1711.00832)

<a id="ref-Tan1993a"></a>Tan, M. (1993). Multi-Agent Reinforcement Learning: Independent vs. Cooperative Agents. *Machine Learning Proceedings 1993*, 330-337. [doi:10.1016/B978-1-55860-307-3.50049-6](https://doi.org/10.1016/B978-1-55860-307-3.50049-6)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
