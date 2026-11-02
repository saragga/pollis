# Multi-Agent Reinforcement Learning: Interpretation

The numbers on the two tabs measure different things. **Cooperative** values are discounted costs in steps, always negative, while **Competitive** values estimate game results between −1 and 1. Greedy behaviour is the thing to judge on both.

## What a cooperative Q-value means

A value in the **Cooperative** tables estimates the discounted sum of future rewards, and each step costs −1. Values are therefore negative, and a value nearer 0 means a quicker meeting. A Q-value of −3.71 at gamma = 0.95 corresponds to meeting in four steps, because −(1 + 0.95 + 0.9025 + 0.857) ≈ −3.71.

A converted figure is often easier to read: n steps give −(1 − gamma^n) / (1 − gamma). An entry still at exactly 0 has simply never been updated. It says nothing about the action, and since zero beats every negative value, the greedy choice favours it until it gets tried.

## Individual Q-values under each learner

**Individual Q-Values** prints different things by **Learner**, and the scales differ too.

| **Learner** option | Printed | Reading the scale |
|---|---|---|
| **Independent Q-Learning (IQL)** | One row per agent, one value per action | Each agent's own estimate of the whole team's return |
| **Value Decomposition (VDN)** | One row per agent, one value per action | Only the sum across agents is the team's return |
| **Central Joint-Action Learner** | The five best joint actions | The team's return for that joint action |

So a VDN value is not comparable with an IQL value of the same size. Under VDN, a constant added to one agent's table and taken from another's changes nothing the team does, so individual values do not carry a separate meaning. Compare the actions within a row, not the sizes between agents.

## Reading a cooperative strategy profile

**Strategy Profile** prints one grid per agent, showing the greedy action in each cell while the others stay at their start corners. The symbols are `^`, `>`, `v` and `<` for moves and `o` for stay.

An `o` usually means an unvisited state, not a decision to stay, because an all-zero row sends `argmax` to the first action. Training rarely has one agent far along while the other remains at its start, so much of each grid is unvisited and tells you little. Read the cells on or near the route in **Greedy Match**. A grid full of `o` is normal, and arrows close to the start are the informative part.

## What the start state's value shows

**Non-Stationarity** tracks the learned value of the start state, `res.qtrace`, computed to be comparable across learners: the mean of the agents' best values under **Independent Q-Learning (IQL)**, the sum under **Value Decomposition (VDN)**, and the single best value for the **Central Joint-Action Learner**.

Convergence to the optimal line is good evidence but not a guarantee, as the estimate at one state does not establish the route. A curve can also reach the line while the greedy policy still has a flaw elsewhere. Read it together with `greedy_steps_to_meet`, which measures the route directly.

## Why the three learners differ in exploration

The learners do not explore equally at the same **Exploration (epsilon)**. Under **Independent Q-Learning (IQL)** and **Value Decomposition (VDN)**, each agent draws its own chance, so the team takes a fully greedy step only with probability (1 − e)^N. Under the **Central Joint-Action Learner**, one draw decides for all, so that probability is 1 − e.

At e = 0.1 and four agents, that is about 0.66 against 0.9. The first two see more disturbance from partners' random moves, an effect called alter-exploration in the survey by [Laetitia Matignon, Guillaume J. Laurent and Nadine Le Fort-Piat (2012)](#ref-MLL2012a). **Learner Comparison** curves therefore differ partly through exploration, so compare the greedy figures as well.

## What the self-play values mean

**Competitive** table values estimate the final result for the player who has just moved: near 1 is a likely win, near 0 a draw, near −1 a loss. **Individual Q-Values** prints them as a grid of moves for X, on the empty board and after X takes the centre and O a corner. `NaN` marks an occupied cell.

Under perfect play, all nine openings are worth 0, but printed values need not be, because they reflect play with exploration, in which errors happen. A corner valued at 0.3, for instance, says that X tends to do well against an opponent who sometimes blunders, not that the corner wins. Differences between moves matter more than levels.

## Reading the openings over training

**Non-Stationarity** on **Competitive** plots the value of opening in a corner, on an edge and in the centre as self-play grows. Each point retrains from the start, with the same seed, so the points are snapshots of one run, and that makes the action costly.

Early on, the lines move a lot, as values depend on few games and on an opponent who is also changing. Later they should flatten, although a constant **Learning Rate (alpha)** keeps them moving slightly. The order between the three lines shows the table's preference, which need not settle on a single correct answer, since all three are draws.

## Win, draw and loss shares in context

Results depend on the opponent. Against the random player, a high win share is expected, and the informative figure is the loss share, which should be near 0. Against the perfect player, wins are impossible, so the only useful figures are the draw and loss shares.

| Opponent | Ideal win share | Ideal draw share | Ideal loss share |
|---|---|---|---|
| Random player | High, not 1 | Small | 0 |
| Perfect player | 0 | 1 | 0 |

`vs_random` and `vs_perfect` each mix games as X and as O, half each, and the win share against a random player differs between the two seats, because X moves first. **Learner Comparison** on this tab shows those shares at 10%, 30% and 100% of the games, so its label describes stages of a single learner.

## Reading the opening replies

**Strategy Profile** on **Competitive** gives O's reply to each opening, next to `perfect_replies`, the replies that keep the draw. Those lists are facts about tic-tac-toe, and they follow a clear pattern.

| X opens | Replies that keep the draw for O |
|---|---|
| A corner | The centre only |
| The centre | Any corner |
| An edge | The centre, the two corners next to that edge, or the opposite edge |

A reply outside the list loses against perfect play, whatever the table's values say. Ties in the table are broken at random, so a rerun can show another reply from the same list.

## How far the two settings generalise

Numbers from a five-by-five grid or from tic-tac-toe do not transfer to other problems. What does transfer is the pattern: joint training reduces miscoordination at a cost in table size, value decomposition sits between the extremes, and self-play improves until its blind spots matter.

Treat `states_visited` and `states_learned` as measures of how much of the problem training touched. Tic-tac-toe has 4519 distinct non-terminal afterstates in the table's representation. A count far short of that means that many positions have default values, although most are irrelevant to good play.

## References

<a id="ref-MLL2012a"></a>Matignon, L., Laurent, G. J., & Le Fort-Piat, N. (2012). Independent Reinforcement Learners in Cooperative Markov Games: A Survey Regarding Coordination Problems. *The Knowledge Engineering Review* 27(1), 1-31. [doi:10.1017/S0269888912000057](https://doi.org/10.1017/S0269888912000057)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
