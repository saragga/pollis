# Q-Learning: Diagnostics

How to check a training run: the learning curve, the temporal-difference error, the variation across seeds, and the coverage of the table or the size of the network.

## The learning curve

**Learning Curve** plots the return of every training episode, faint, with a trailing moving average of 20 episodes and a dashed line at the optimal return, −(columns + 1). The vertical axis runs from −10 × (rows + columns) to 0.

The training episodes use ε-greedy exploration, so the curve shows online performance, the measure in the Cliff Walking figure of [Sutton and Barto (2018)](#ref-SB2018a). In their example, Q-learning learns the values of the optimal path but its online returns stay worse than those of Sarsa, because exploration occasionally takes it over the cliff. They add that if ε were gradually reduced, both methods would asymptotically converge to the optimal policy. The panel keeps **Exploration (epsilon)** fixed, so the training returns include the cost of exploring; `greedy_return` measures the policy without it.

## The temporal-difference error

**TD Error** plots a moving average of 200 values of the absolute temporal-difference error over the updates. As its description says, the error should shrink as Q settles.

| Algorithm | Value recorded at each update |
|---|---|
| **Tabular** | r + γ maxₐ′ Q(s′, a′) − Q(s, a), one value per environment step |
| **DQN** | The square root of the mean squared error of the minibatch, the RMS TD error |

The two series differ in what one point means: one transition for **Tabular**, one minibatch of **Batch Size** transitions for **DQN**, whose updates begin once the buffer holds a full minibatch.

## Variation across seeds

**Seed Stability** trains the selected algorithm with seeds 1 to 5 and draws their moving averages of 20 episodes on one plot. **Random Seed** controls the exploration, the sampling from the replay buffer and the initial weights of the network.

As its description says, the curves show how reliable training is: the spread between them is the part of a single run's result that depends on chance, and a run of **Random Seed** alone does not show it.

## The greedy return

The output `greedy_return` comes from one episode with no exploration, compared with `optimal_return`, −(columns + 1). Equality means the greedy policy has found a shortest path.

A greedy episode that never reaches the goal stops after 4 × rows × columns steps, so its return is at most −4 × rows × columns, −192 on the default grid. **Greedy Policy** draws the path, and shows where it loops or falls into the cliff. Each fall into the cliff costs 100 instead of 1 and sends the agent back to the start, so a few falls lower the return sharply.

## Coverage of the table

On the **Tabular** tab, **Model Summary** reports the number of states, rows × columns, the 4 actions, the number of table entries, the number of entries the updates have changed from 0, and the number of states whose four entries are all still 0.

The conditions of [Watkins and Dayan (1992)](#ref-WD1992a) ask that every state and action be visited again and again. A state with all its entries at 0 has never been left by an action in training. The cliff cells and the goal are always among them, since the agent is sent from the cliff back to the start and the episode ends at the goal.

## The network

On the **DQN** tab, **Model Summary** shows the network, its number of parameters, the size of the equivalent table, rows × columns × 4, and the number of gradient updates.

With n = rows × columns cells and h **Hidden Units**, the network has (n + 1) × h + (h + 1) × 4 parameters, against the 192 entries of the table on the default grid. [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) use a network where the states are screen images, far too many for a table, and the panel's decision table suggests **DQN** for large or continuous state spaces where a table is infeasible. **Algorithm Comparison** sets the two side by side on the grid.

## References

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
