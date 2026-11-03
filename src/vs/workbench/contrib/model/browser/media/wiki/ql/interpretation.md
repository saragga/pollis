# Q-Learning: Interpretation

How to read the outputs: the values, the greedy policy and its path, the returns with and without exploration, and the comparisons between algorithms and exploration rates.

## The values

**Value Heatmap** colours every cell by maxₐ Q(s, a), the learned value of the cell under the greedy policy. Every step costs 1, so the values are negative and rise towards the goal: a cell's value is the discounted cost of the remaining path, as the agent has learned it.

[Watkins and Dayan (1992)](#ref-WD1992a) note that the optimal state value is the maximum of the optimal Q-values over the actions, V*(x) = maxₐ Q*(x, a). With **Discount (gamma)** at 1 and the optimal policy, the value of a cell would be minus the number of steps to the goal; with γ < 1, the cost of distant steps is discounted.

On the **Tabular** tab, the cliff cells and the goal keep the value 0, since no action is ever taken from them. On the **DQN** tab, the network returns a value for every cell, including those it has never been trained on.

## The greedy policy

**Policy Table** shows the action with the largest Q-value in every cell, as ^, >, v or <, with C for the cliff cells and G for the goal. **Greedy Policy** follows these actions from the start and draws the path over the grid, with the cliff dark, and gives its return in the title.

[Watkins and Dayan (1992)](#ref-WD1992a) explain that once the agent has learned the Q-values, an optimal policy follows by taking in each state an action at which the maximum is attained: herein lies the utility of the Q-values. There may be more than one optimal policy, but the optimal Q-values are unique.

When several actions share the largest value, the panel takes the first in the order up, right, down, left. A cell whose entries are all still 0 therefore shows ^ in **Policy Table**.

## Returns with and without exploration

**Expected Return** plays 100 episodes greedily and 100 with ε-greedy exploration at **Exploration (epsilon)**, with the random number generator seeded at 99, and reports the mean, the standard deviation and the worst return of each.

The grid is deterministic, so every greedy episode follows the same path and the 100 greedy returns are equal, with a standard deviation of 0. The ε-greedy returns vary from episode to episode, and their worst value shows the cost of a fall into the cliff. [Sutton and Barto (2018)](#ref-SB2018a) make the same distinction in the Cliff Walking example: Q-learning learns the values of the optimal policy, while its online performance with ε-greedy action selection includes the occasional fall.

## Q-learning against Sarsa

On the **Tabular** tab, **Algorithm Comparison** trains Sarsa with the same step size and exploration and plots both learning curves, with the two greedy returns in the title. Sarsa uses the value of the next action actually chosen, Q(s′, a′), in place of maxₐ′ Q(s′, a′).

[Sutton and Barto (2018)](#ref-SB2018a) explain the difference in the Cliff Walking example: Q-learning learns the optimal path along the edge of the cliff, but falls off occasionally because of the ε-greedy action selection; Sarsa takes the action selection into account and learns the longer but safer path through the upper part of the grid. The online performance of Q-learning is worse than that of Sarsa, although Q-learning learns the values of the optimal policy.

## DQN against the table

On the **DQN** tab, **Algorithm Comparison** trains tabular Q-learning with a step size of 0.5 and the same exploration, and plots both learning curves with both greedy returns.

On a grid of a few dozen cells, the table represents every state exactly, while the network must learn a function of the one-hot state. [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) built the deep Q-network for inputs such as the pixels of Atari 2600 games, where a table is out of the question. The comparison shows how the two training procedures behave on the same small task.

## The exploration rate

**Exploration Sweep** trains the selected algorithm with ε at 0.01, 0.05, 0.1, 0.2 and 0.3, and lists for each the mean return of the last 50 training episodes and the greedy return.

The two columns answer different questions. The training return measures performance while exploring, and so includes the falls that exploration causes near the cliff; the greedy return measures the policy that has been learned. In the Cliff Walking example of [Sutton and Barto (2018)](#ref-SB2018a), a gradually decreasing ε would bring Q-learning and Sarsa alike to the optimal policy in the limit.

## References

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
