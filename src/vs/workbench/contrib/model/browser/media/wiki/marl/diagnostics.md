# Multi-Agent Reinforcement Learning: Diagnostics

A learning run can look successful and still be fragile. The checks ask three things: whether training has settled, whether the greedy policy really performs, and whether the result holds across seeds and against other players.

## Has cooperative training settled?

**Learning Curve** on **Cooperative** plots steps to meet, as a moving average of 50 episodes, against the dashed lower bound. A healthy curve starts at or near the step cap of 4n and falls towards the bound, then flattens.

The curve stays over the bound even for a perfect policy, as it includes exploration. With **Exploration (epsilon)** e, each of N agents moves randomly with chance e, and a random step delays the team. A curve that is still falling at the end needs more **Episodes**. Trust the greedy figures in the printed result over the curve when judging the final policy.

## Greedy results against training results

The printed result separates two numbers that are easy to confuse. `mean_steps_last_100` measures training behaviour, with exploration, over the last 100 episodes. `greedy_steps_to_meet` measures one run of the pure greedy policy from the start, with no random moves.

| Output | Includes exploration | What it tells you |
|---|---|---|
| `mean_steps_last_100` | Yes | Behaviour during learning |
| `greedy_steps_to_meet` | No | Quality of the final policy |
| `lower_bound` | No | Fewest steps possible, n − 1 |

A `greedy_steps_to_meet` of `missing` means the greedy team never met within the cap, even if training often did.

## How tight is the lower bound?

`lower_bound` is n − 1, and the dashed lines in **Learning Curve** and **Learner Comparison** use the same figure. It can always be reached with two or three agents. With four agents, all corners are occupied, and the meeting cell must lie within n − 1 steps of each corner, which only the centre cell of an odd grid can do.

So four agents on an even grid need at least n steps, and a gap of one step there is no failure. The "optimal" line in **Non-Stationarity** rests on the same n − 1, so it sits slightly too high in that case.

## Reading the success rate

**Win Rate / Success Rate** on **Cooperative** shows the share of episodes in which the agents met, as a moving average. A value near 1 with a learning curve near the bound indicates reliable training behaviour.

The test is `res.lens .< maxsteps`, so an episode that meets on exactly the last permitted step counts as a failure, and the `met_share` of **Evaluation** works the same way. The error is small unless the team regularly takes the full 4n steps. For a borderline run, compare `greedy_steps_to_meet` with the cap of 4n.

## Is the team's start value correct?

**Non-Stationarity** on **Cooperative** plots the learned value of the start state, `res.qtrace`, against the optimal value −(1 − gamma^(n−1)) / (1 − gamma). At gamma = 0.95 and n = 5 that optimum is about −3.71.

All tables start at zero, so the curve starts at 0 and falls as actions get tried. Settling on the line suggests the team has found a shortest route. A persistent gap means the values do not match the best route, and a curve that keeps wandering under **Independent Q-Learning (IQL)** shows the moving targets of non-stationary learning, a problem surveyed by [Pablo Hernandez-Leal, Michael Kaisers, Tim Baarslag and Enrique Munoz de Cote (2017)](#ref-HKBM2017a).

## Do different seeds coordinate?

**Coordination Test** on **Cooperative** trains five times, with seeds 1 to 5 whatever **Random Seed** says, and reports `met` and `steps` for each greedy policy. Consistent short results are the evidence that matters. A single good seed proves little in a task where miscoordination is the typical failure.

Results that vary widely, or failures to meet, show that the outcome depends on which early experience happened to occur. That often appears for **Independent Q-Learning (IQL)** first, and with more agents. Repeat the test with more **Episodes**, or compare **Learner** options before concluding that a method fails.

## Testing recovery from a random partner

**Evaluation** on **Cooperative** runs the greedy policy 200 times with one agent replaced by random moves, in turn, alongside a baseline in which nobody is random. The baseline row has `random_agent` set to `none`.

A team that fails badly with a random partner has learned a narrow route. Off that route the tables hold few or no updates, and a state never visited makes the agent stay. Compare the rows with each other: a high `mean_steps` with `met_share` near 0 shows a policy that cannot adapt at all. Some loss is unavoidable, since no policy can meet quickly with an agent that wanders.

## Has self-play reached perfect play?

**Win Rate / Success Rate** on **Competitive** tests the greedy table at checkpoints against two opponents. Against a perfect player, the ideal is a draw share of 1 and a loss share of 0. A nonzero win share would mean an error in the code, because the perfect player cannot lose.

Against a random player, wins should dominate and losses should approach 0. Each checkpoint plays 200 games, half as X and half as O, so one share moves in steps of 0.005. The perfect player picks at random among its equally good moves, so it does not seek out every weakness. A clean record is strong evidence for the common lines, not a proof for all positions.

## Checking the learned policy opening by opening

**Coordination Test** on **Competitive** lists all nine openings with `perfect_value_for_X`, which is 0 for each of them, since every first move of tic-tac-toe draws under perfect play. `learned_vs_learned` shows the result when the table plays both sides after that opening.

Any nonzero `learned_vs_learned` shows a blunder by the table, from X or O depending on the sign. **Strategy Profile** adds a sharper test. It lists O's reply to each opening with the list of replies that keep the draw. After a corner opening, only the centre holds, and a table that answers elsewhere has a real weakness.

## Common symptoms and their usual causes

| Symptom | Usual cause | What to try |
|---|---|---|
| `greedy_steps_to_meet` is `missing` | The tables have not coordinated | Raise **Episodes**, or try another **Learner** |
| Curve flat, well over the bound | High exploration | Check `greedy_steps_to_meet`, lower **Exploration (epsilon)** |
| Good on one seed, poor on others | Luck in early experience | Use **Coordination Test** and report the spread |
| Runs slow sharply with four agents | 5^4 joint actions and a large state space | Reduce **Agents** or **Grid Size** |
| Losses against the perfect player | Too few games, or too little exploration | Raise **Episodes** or **Exploration (epsilon)** |
| Values far from 0 on the empty board | The values reflect exploring play | Lower **Exploration (epsilon)** late in training, by editing the code |

## References

<a id="ref-HKBM2017a"></a>Hernandez-Leal, P., Kaisers, M., Baarslag, T., & Munoz de Cote, E. (2017). A Survey of Learning in Multiagent Environments: Dealing with Non-Stationarity. [arXiv:1707.09183](https://arxiv.org/abs/1707.09183)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
