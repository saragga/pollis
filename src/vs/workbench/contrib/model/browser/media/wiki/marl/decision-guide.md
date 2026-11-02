# Multi-Agent Reinforcement Learning: Decision Guide

Start with what the agents want and whether their model is known. Then choose a learner and the settings that give the tables enough experience for the problem's size.

## Choosing between learning and planning

| Your situation | Where to go | Why |
|---|---|---|
| A team with one reward, model unknown | **Cooperative** tab | Learns coordination from experience |
| Two opponents in a turn-based game, rules simulated | **Competitive** tab | Self-play on a value table |
| Several agents, model known | **Multi-Agent Decision Processes** | Planning uses the model directly and gives firmer guarantees |
| One agent only | **Q-Learning** | No moving targets from other learners |
| A large board game | **AlphaZero** | Search and a network replace the table |
| Continuous actions or large policies | **Policy Gradient Methods** | Tables cannot represent them |

## Choosing a cooperative learner

**Learner** is the main decision on the **Cooperative** tab, and its options trade quality against the size of the table.

| **Learner** option | Table entries per state | Advantage | Drawback |
|---|---|---|---|
| **Independent Q-Learning (IQL)** | 5N | Smallest; scales best | Moving targets; can miscoordinate |
| **Value Decomposition (VDN)** | 5N | Joint training at the same size | Assumes an additive team value |
| **Central Joint-Action Learner** | 5^N | Stable, one decision problem | Grows fast; one mind deciding for all |

The joint learner should do best on small problems, so use it as the benchmark. Try IQL and VDN next, and see how far they fall short. **Learner Comparison** runs the three together.

## When central training is realistic

A joint-action learner needs one controller to choose for all agents, at execution as well as in training, which many real teams cannot have. Centralised training with decentralised execution keeps the joint view only during learning. **Value Decomposition (VDN)** is the panel's example, from [Sunehag, Lever, Gruslys, Czarnecki, Zambaldi, Jaderberg, Lanctot, Sonnerat, Leibo, Tuyls and Graepel (2017)](#ref-SLGCZ...2017a).

In the panel, each agent still sees all positions, so the demonstration is simpler than a real decentralised task. Choose VDN where training can be shared but acting cannot, and where each agent's contribution is roughly separable.

## Setting the grid size and number of agents

Possible states grow as n^(2N), and each table grows with them, so experience needed rises steeply.

| **Agents** | **Grid Size** | Possible states | Joint actions |
|---|---|---|---|
| 2 | 5 | 625 | 25 |
| 2 | 10 | 10,000 | 25 |
| 3 | 5 | 15,625 | 125 |
| 4 | 5 | 390,625 | 625 |

Only visited states take memory, but learning needs repeated visits. Start at the smallest setting, confirm that the team coordinates, and then raise one input at a time with more **Episodes**. Four agents also slow the **Central Joint-Action Learner**, as it scans the list of joint actions at each update.

## Setting episodes, learning rate and discount

Raise **Episodes** until the greedy figures stop improving across seeds, and treat the moving-average curves as a guide only. **Learning Rate (alpha)** at 0.2 suits these deterministic tasks; lower it if values oscillate, or if results vary widely across seeds.

**Discount (gamma)** on **Cooperative** sets how much the speed of meeting matters. Since each step costs the same, any value under 1 prefers shorter routes, but values far under 1 make distant differences very small. Staying near 0.95 to 0.99 keeps the difference between routes visible in the table. **Competitive** uses no discount, as only the final result counts.

## Setting the amount of exploration

**Exploration (epsilon)** is constant through a run, so it sets a balance for the whole of training. **Exploration Sweep** tests five values on any setting. Too low a value leaves positions unexplored, though on **Cooperative** the zero start values add some exploration by themselves, as untried actions look better than tried ones. Too high a value keeps disturbing the partners.

Read `greedy_met` and `greedy_steps` on **Cooperative**, and `perfect_loss` on **Competitive**, instead of training figures. A decaying epsilon is the usual refinement, but it requires editing the code. Remember that the same epsilon disturbs a larger team more, so reduce it as **Agents** rises.

## Beyond tables: deep multi-agent methods

Tables stop working once the state space is too large to visit. Neural methods then generalise between states, and the panel's three learners have direct descendants, listed here with the problem each addresses.

| Method | Idea | Addresses |
|---|---|---|
| VDN | Additive sum of agent values | Credit, in a simple form |
| QMIX | A monotonic mix of agent values | Value structures a sum cannot express |
| MADDPG | Centralised critics, decentralised actors | Mixed cooperative and competitive settings |

QMIX is due to [Rashid, Samvelyan, Schroeder de Witt, Farquhar, Foerster and Whiteson (2018)](#ref-RSWFF...2018a), and MADDPG to [Lowe, Wu, Tamar, Harb, Abbeel and Mordatch (2017)](#ref-LWTHA...2017a).

## Using your own environment

On **Cooperative**, edit `step_env`, `moves`, `starts` and `move`. The tables are dictionaries keyed by state, so any state that can be hashed will do, and the reward can be any function of the transition. `lower_bound` and the optimal line in **Non-Stationarity** belong to rendezvous, so replace them along with the task.

On **Competitive**, replacing tic-tac-toe means editing `wins`, `winner`, `place` and the board's size, along with the display code. `negamax` needs a game small enough to search fully, as it remembers each position. For a larger game there is no perfect opponent, and strength must be measured against other players. Keep the sign convention in `value`, or the shared table stops working.

## References

<a id="ref-LWTHA...2017a"></a>Lowe, R., Wu, Y., Tamar, A., Harb, J., Abbeel, P., & Mordatch, I. (2017). Multi-Agent Actor-Critic for Mixed Cooperative-Competitive Environments. *NeurIPS*. [Online](https://proceedings.neurips.cc/paper/2017/hash/68a9750337a418a86fe06c1991a1d64c-Abstract.html)

<a id="ref-RSWFF...2018a"></a>Rashid, T., Samvelyan, M., Schroeder de Witt, C., Farquhar, G., Foerster, J., & Whiteson, S. (2018). QMIX: Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning. [arXiv:1803.11485](https://arxiv.org/abs/1803.11485)

<a id="ref-SLGCZ...2017a"></a>Sunehag, P., Lever, G., Gruslys, A., Czarnecki, W. M., Zambaldi, V., Jaderberg, M., Lanctot, M., Sonnerat, N., Leibo, J. Z., Tuyls, K., & Graepel, T. (2017). Value-Decomposition Networks For Cooperative Multi-Agent Learning. [arXiv:1706.05296](https://arxiv.org/abs/1706.05296)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
