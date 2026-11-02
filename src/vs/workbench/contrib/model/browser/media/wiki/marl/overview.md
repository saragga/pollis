# Multi-Agent Reinforcement Learning

Several agents learn from experience in a shared environment, without being given its rules or rewards in advance. The panel shows the two classic settings in tables small enough to inspect: a team learning to meet on a grid, and a tic-tac-toe player learning against itself.

## Why learning together is harder than learning alone

A single Q-learner faces a fixed environment, so its targets settle as its estimates improve, and [Christopher J. C. H. Watkins and Peter Dayan (1992)](#ref-WD1992a) proved convergence under standard conditions. With several learners, the others are part of each agent's environment, and they keep changing as they learn.

The same action can therefore earn different results at different times, for reasons the agent cannot see. Convergence results for the single-agent case no longer apply directly, and the agents may also need to agree on one of many equally good joint behaviours. A broad survey of those problems and the methods that address them is by [Lucian Busoniu, Robert Babuska and Bart De Schutter (2008)](#ref-BBD2008a).

## Cooperative and competitive learning compared

| Feature | **Cooperative** | **Competitive** |
|---|---|---|
| Interests | One reward shared by all agents | One player's win is the other's loss |
| Environment | Rendezvous on a grid | Tic-tac-toe |
| Number of agents | **Agents**, 2 to 4 | 2 |
| Moves | Simultaneous | In turn |
| Learning | Tabular Q-learning, three variants | TD(0) on afterstates, by self-play |
| Benchmark | Fewest steps to meet | A perfect player, from exact search |
| Main risk | Failure to coordinate | Blind spots from playing only itself |

Separate wikis give the details: [Cooperative](cooperative.md) and [Competitive](competitive.md).

## The rendezvous task in brief

On the **Cooperative** tab, agents start in different corners of a square grid. Each step costs the team −1 until all agents stand on the same cell, so the best joint behaviour is to meet as fast as possible. Every agent moves at the same time and chooses to stay or to go up, right, down or left.

No single cell is the right meeting place, and for two agents any cell on the diagonal between them works equally well. The agents must settle on the same one, which is why coordination is the hard part of a task that looks trivial. With two agents on a grid of side n, the fastest possible meeting takes n − 1 steps.

## Self-play on tic-tac-toe in brief

On the **Competitive** tab, one table of values plays both sides of tic-tac-toe, and learns from the results. Its values refer to afterstates, the boards just after a move, and each is stored from the viewpoint of the player who has just moved, so experience from either side improves the play of both.

Tic-tac-toe is small enough to solve exactly, which gives the panel an objective test. Under perfect play it is a draw, so a well-trained table should never lose to a perfect opponent. Learning from self-play alone is the idea behind much stronger systems, from backgammon to the games of [David Silver, Thomas Hubert, Julian Schrittwieser, Ioannis Antonoglou, Matthew Lai, Arthur Guez, Marc Lanctot, Laurent Sifre, Dharshan Kumaran, Thore Graepel, Timothy Lillicrap, Karen Simonyan and Demis Hassabis (2018)](#ref-SHSAL...2018a).

## The three cooperative learners

**Learner** selects how the team's experience reaches its value tables.

| **Learner** option | What is learned | Training information | Acting |
|---|---|---|---|
| **Independent Q-Learning (IQL)** | One table per agent, over that agent's actions | Own action and the team reward | Each agent picks from its own table |
| **Value Decomposition (VDN)** | One table per agent, whose sum is the team's value | A shared error for the sum | Each agent picks from its own table |
| **Central Joint-Action Learner** | One table over all joint actions | Everything | One choice for the whole team |

The three span a range from no joint training to fully joint training. **Learner Comparison** runs all three with the same seed.

## What the actions show on each tab

Each action has one meaning per tab, and some labels carry a slash for that reason.

| Action | On **Cooperative** | On **Competitive** |
|---|---|---|
| **Learning Curve** | Steps to meet per episode | Self-play outcome shares |
| **Win Rate / Success Rate** | Share of episodes that met | Greedy policy against random and perfect players |
| **Non-Stationarity** | Value of the start state over training | Value of X's opening moves over training |
| **Coordination Test** | Greedy result across five seeds | Learned policy against itself, per opening |
| **Evaluation** | Greedy policy with one agent acting randomly | 400 games against each opponent |

The [Factsheet](factsheet.md) lists all ten, and the [Diagnostics](diagnostics.md) wiki says how to read them.

## What the panel leaves out

The tabs use lookup tables, so they do not scale to large problems, and the methods written for such problems are not implemented here. QMIX, MADDPG and COMA replace tables with neural networks, and training against a pool of past policies is a common guard against blind spots. The tabs' code loads neither those methods nor `ReinforcementLearning.jl`, and is written out in Base Julia.

A known model calls for planning instead of learning: see **Multi-Agent Decision Processes**. The [Decision Guide](decision-guide.md) wiki says when each route fits, and textbook background is in [Yoav Shoham and Kevin Leyton-Brown (2009)](#ref-SL2009b).

## References

<a id="ref-BBD2008a"></a>Busoniu, L., Babuska, R., & De Schutter, B. (2008). A Comprehensive Survey of Multiagent Reinforcement Learning. *IEEE Transactions on Systems, Man, and Cybernetics, Part C (Applications and Reviews)* 38(2), 156-172. [doi:10.1109/TSMCC.2007.913919](https://doi.org/10.1109/TSMCC.2007.913919)

<a id="ref-SL2009b"></a>Shoham, Y., & Leyton-Brown, K. (2009). *Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations*. Cambridge University Press. [Online](https://www.masfoundations.org)

<a id="ref-SHSAL...2018a"></a>Silver, D., Hubert, T., Schrittwieser, J., Antonoglou, I., Lai, M., Guez, A., Lanctot, M., Sifre, L., Kumaran, D., Graepel, T., Lillicrap, T., Simonyan, K., & Hassabis, D. (2018). A General Reinforcement Learning Algorithm that Masters Chess, Shogi, and Go through Self-Play. *Science* 362(6419), 1140-1144. [doi:10.1126/science.aar6404](https://doi.org/10.1126/science.aar6404)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
