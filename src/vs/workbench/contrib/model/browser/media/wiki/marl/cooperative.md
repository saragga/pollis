# Cooperative Multi-Agent Learning

A team of agents shares one reward and must learn to work together. The **Cooperative** tab uses a rendezvous task on a grid and compares three ways of learning it.

## The rendezvous task

N agents start in different corners of an n × n grid, in the fixed order (1, 1), (n, n), (1, n), (n, 1). At each step, each agent chooses to stay or to move up, right, down or left, and a move into a wall leaves the agent in place. All moves take effect at once.

The team gets −1 at every step, including the step on which all agents reach the same cell. The episode ends at that moment, or after 4n steps. Only the time to meet matters, so any meeting cell is as good as another if it can be reached in the same number of steps. Agents can pass through each other, so there are no collisions to avoid.

## The fewest steps the team can take

Two agents in opposite corners are 2(n − 1) moves apart and close at most two per step, so they need at least n − 1 steps. The same bound applies to more agents, since the first two are always in opposite corners.

| **Agents** | Fewest steps | Reachable meeting cells |
|---|---|---|
| 2 | n − 1 | Any cell on the diagonal between them |
| 3 | n − 1 | The third agent's corner, among others |
| 4, odd n | n − 1 | Only the centre |
| 4, even n | n | No cell is within n − 1 of all corners |

With discounting, meeting in k steps from the start is worth −(1 − gamma^k) / (1 − gamma).

## Why many equally good answers cause trouble

For two agents, every cell on the diagonal between them gives the same shortest time, and many routes lead to each. Each agent can choose a shortest route, yet the team fails if the two head for different cells. Every optimal plan is fine alone, while a mixture of two can be poor.

In these terms, the task has several optimal equilibria, and learners must select the same one. That problem is called equilibrium selection, or miscoordination, and it is well known for independent learners, as surveyed by [Laetitia Matignon, Guillaume J. Laurent and Nadine Le Fort-Piat (2012)](#ref-MLL2012a). Because the agents see all positions, a table can resolve this with a little experience, which is why small grids are usually solved.

## Independent Q-learning

**Independent Q-Learning (IQL)** gives each agent its own table Q_i(s, a_i), indexed by the joint state and by that agent's own action. Each one applies the ordinary Q-learning update to the shared reward, as if the others were part of the environment.

The method is simple and small, and it was studied early by [Ming Tan (1993)](#ref-Tan1993a). Its weakness is that the value of an action depends on what the others currently do, and they keep changing. An action that was bad when a partner was exploring may be good now, and the table reflects a blend of the two. Convergence is not guaranteed, though small deterministic tasks such as this one often work.

## Value decomposition

**Value Decomposition (VDN)** also keeps one table per agent, but it trains them jointly. The team's value is the sum Q_tot(s, a) = Q_1(s, a_1) + ... + Q_N(s, a_N), and one shared error is computed for that sum. Each agent's entry then moves by alpha times the error divided by N.

Because Q_tot is a sum, each agent maximising its own table also maximises the team's value, so acting can stay decentralised. The price is expressiveness, because a sum cannot represent every joint value. The idea comes from [Peter Sunehag, Guy Lever, Audrunas Gruslys, Wojciech Marian Czarnecki, Vinicius Zambaldi, Max Jaderberg, Marc Lanctot, Nicolas Sonnerat, Joel Z. Leibo, Karl Tuyls and Thore Graepel (2017)](#ref-SLGCZ...2017a).

## The central joint-action learner

**Central Joint-Action Learner** keeps one table Q(s, a), with one entry for each joint action, and picks the team's move from it. From this viewpoint there is only one decision maker, so the task is a single-agent Markov decision process. Ordinary Q-learning theory then applies, without any moving targets.

The cost is size: 5^N entries per state, so 25, 125 or 625 for two to four agents. There are more entries to fill, and each needs its own experience. Execution also needs one controller for all agents, which may not exist in a real team. The panel uses it as the reference for what a simple tabular method can do.

## One update under each learner, by hand

Take two agents on the meeting step, all table entries at zero and **Learning Rate (alpha)** at 0.2. The reward is −1 and the future term is dropped.

| **Learner** option | Error | Change per entry | Team value after |
|---|---|---|---|
| **Independent Q-Learning (IQL)** | −1 per agent | −0.2 on each table | Each table reads −0.2 |
| **Value Decomposition (VDN)** | −1, shared | −0.1 on each table | Sum reads −0.2 |
| **Central Joint-Action Learner** | −1 | −0.2 on one entry | Joint entry reads −0.2 |

Under VDN, each agent's table holds a share of the team's value, while under IQL each holds a whole estimate of it.

## Why zero starting values help here

All tables start at zero while all rewards are negative, so every untried action looks better than every tried one. A greedy agent therefore tries the others in turn, a method known as optimistic initial values, which is described by [Richard S. Sutton and Andrew G. Barto (2018)](#ref-SB2018a).

That makes early exploration systematic, even with low **Exploration (epsilon)**. It also explains two behaviours of the tab. The start value in **Non-Stationarity** begins at 0 and falls. Unvisited states act like attractive unknowns during training, but after training they send `argmax` to the first action, which is "stay", so they do nothing useful.

## Credit assignment in a shared reward

Every agent gets −1 at each step, whoever caused the delay, so no signal says which agent helped. Under **Value Decomposition (VDN)**, the shared error is divided equally, whatever each agent's actual contribution was.

In the rendezvous task the problem is mild, because all agents have similar roles and meeting depends on each of them. Tasks with specialised roles suffer more, and one agent may become lazy while another does the work. Counterfactual baselines ask how the team's reward would have changed if one agent alone had acted differently, an approach of [Jakob Foerster, Gregory Farquhar, Triantafyllos Afouras, Nantas Nardelli and Shimon Whiteson (2018)](#ref-FFANW2018a).

## References

<a id="ref-FFANW2018a"></a>Foerster, J., Farquhar, G., Afouras, T., Nardelli, N., & Whiteson, S. (2018). Counterfactual Multi-Agent Policy Gradients. *AAAI*. [Online](https://ojs.aaai.org/index.php/AAAI/article/view/11794)

<a id="ref-MLL2012a"></a>Matignon, L., Laurent, G. J., & Le Fort-Piat, N. (2012). Independent Reinforcement Learners in Cooperative Markov Games: A Survey Regarding Coordination Problems. *The Knowledge Engineering Review* 27(1), 1-31. [doi:10.1017/S0269888912000057](https://doi.org/10.1017/S0269888912000057)

<a id="ref-SLGCZ...2017a"></a>Sunehag, P., Lever, G., Gruslys, A., Czarnecki, W. M., Zambaldi, V., Jaderberg, M., Lanctot, M., Sonnerat, N., Leibo, J. Z., Tuyls, K., & Graepel, T. (2017). Value-Decomposition Networks For Cooperative Multi-Agent Learning. [arXiv:1706.05296](https://arxiv.org/abs/1706.05296)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tan1993a"></a>Tan, M. (1993). Multi-Agent Reinforcement Learning: Independent vs. Cooperative Agents. *Machine Learning Proceedings 1993*, 330-337. [doi:10.1016/B978-1-55860-307-3.50049-6](https://doi.org/10.1016/B978-1-55860-307-3.50049-6)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Competitive](competitive.md)
