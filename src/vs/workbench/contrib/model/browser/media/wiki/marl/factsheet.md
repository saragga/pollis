# Multi-Agent Reinforcement Learning: Factsheet

A quick reference for **Multi-Agent Reinforcement Learning**: the two tabs, their inputs, their update rules and what each action computes. All learning code is written out in the panel in Base Julia, with `Plots` for the charts.

## Tabs, tasks and outputs

| Tab | Task | Learning rule | Objects built | Printed result |
|---|---|---|---|---|
| **Cooperative** | Rendezvous on a grid | Tabular Q-learning, chosen by **Learner** | `train`, `rollout`, `step_env`, `res`, `path` | `greedy_steps_to_meet`, `lower_bound`, `mean_steps_last_100`, `states_visited` |
| **Competitive** | Tic-tac-toe by self-play | TD(0) on afterstates, one shared table | `train`, `selfplay_game!`, `evaluate`, `negamax`, `res` | `states_learned`, `vs_random`, `vs_perfect` |

Exploration and the learning rate stay constant through training on both tabs, since neither decays.

## Inputs shared by both tabs

| Input | Default | Meaning |
|---|---|---|
| **Episodes** | 5000 | Training episodes, or self-play games |
| **Learning Rate (alpha)** | 0.2 | Step size of each table update |
| **Exploration (epsilon)** | 0.1 | Chance of a random action during training |
| **Random Seed** | 1 | Seed of exploration and random opponents |

**Episodes** is the first input to raise if the curves have not flattened by the end of a run, at a cost proportional to its value. The comparison actions train several times, so their cost is that of many runs.

## Inputs of the Cooperative tab

| Input | Default | Meaning |
|---|---|---|
| **Agents** | 2 | Number of agents, 2 to 4, starting in different corners |
| **Grid Size** | 5 | Side n of the square grid |
| **Discount (gamma)** | 0.95 | Discount of the team's return |
| **Learner** | **Independent Q-Learning (IQL)** | Also **Value Decomposition (VDN)** and **Central Joint-Action Learner** |

An episode ends when all agents share a cell or after 4n steps, whichever comes first, and the cap has no input of its own. The state records all agents' positions, giving n^(2N) possible states for N agents, and there are 5^N joint actions.

## Update rules of the three learners

Each row shows the error that moves the table, with r = −1 per step and the future term dropped on the meeting step.

| **Learner** option | Error | Change to each entry used |
|---|---|---|
| **Independent Q-Learning (IQL)** | r + gamma max Q_i(s') − Q_i(s, a_i), one per agent | alpha times that agent's error |
| **Value Decomposition (VDN)** | r + gamma sum over i of max Q_i(s') − sum over i of Q_i(s, a_i) | alpha times the shared error, divided by N |
| **Central Joint-Action Learner** | r + gamma max Q(s', a') − Q(s, a) | alpha times the error |

On **Competitive**, each player's previous afterstate value V moves by alpha (target − V). The target is the value of that player's new afterstate, or else 1, 0 or −1 at a win, draw or loss.

## Visualise, Diagnose and Predict actions

| Group | Action | **Cooperative** output | **Competitive** output |
|---|---|---|---|
| Visualise | **Learning Curve** | Steps to meet, moving average of 50, with the lower bound | X win, draw and O win shares in self-play |
| Visualise | **Win Rate / Success Rate** | Share of episodes that met, moving average of 50 | Win, draw and loss shares against both opponents over training |
| Diagnose | **Non-Stationarity** | `res.qtrace` against the optimal start value | Value of corner, edge and centre openings |
| Diagnose | **Coordination Test** | `met` and `steps` for seeds 1 to 5 | `perfect_value_for_X`, `learned_vs_learned` for each opening |
| Predict | **Greedy Match** | Greedy paths on the grid | One game of the learned X against a perfect O |
| Predict | **Evaluation** | `met_share`, `mean_steps` with each agent random in turn | Win, draw and loss shares over 400 games |

## Compare and Interpret actions

| Group | Action | **Cooperative** output | **Competitive** output |
|---|---|---|---|
| Compare | **Learner Comparison** | Learning curves of all three learners | Results after 10%, 30% and 100% of the games |
| Compare | **Exploration Sweep** | `mean_steps_last_100`, `greedy_met`, `greedy_steps` for five epsilon values | `random_win`, `perfect_draw`, `perfect_loss` for five epsilon values |
| Interpret | **Individual Q-Values** | Action values at the start, or the top five joint actions | Value of each move on two boards |
| Interpret | **Strategy Profile** | Each agent's greedy action in every cell | O's reply to each opening, with the perfect replies |

The five epsilon values are 0.01, 0.05, 0.1, 0.2 and 0.4 whatever **Exploration (epsilon)** says, and those rows retrain from scratch.

## Packages and textbook

The learning code needs nothing beyond Julia's standard library, since every update is written out in the panel. `Plots` draws the charts of the **Learning Curve**, **Win Rate / Success Rate**, **Non-Stationarity**, **Greedy Match** and **Learner Comparison** actions, and the tables themselves stay readable in the printed results.

For the single-agent foundations of everything in the panel, including Q-learning, TD(0) and afterstates, the standard text is [Richard S. Sutton and Andrew G. Barto (2018)](#ref-SB2018a). Its first chapter uses tic-tac-toe as its running example.

## References

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md) · [Competitive](competitive.md)
