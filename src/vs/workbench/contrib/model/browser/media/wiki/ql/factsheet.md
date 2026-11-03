# Q-Learning: Factsheet

The panel's task, algorithms, inputs, outputs and sources at a glance.

## The task

| Item | Value |
|---|---|
| Task | Cliff Walking, a grid of **Grid Rows** × **Grid Columns** cells, 4 × 12 by default |
| Start and goal | Start in the bottom-left cell, goal in the bottom-right cell |
| Actions | Up, right, down, left; a move into the edge of the grid leaves the agent in place |
| Reward | −1 for every step; −100 for a step into the cliff, the bottom row between start and goal, which sends the agent back to the start |
| End of episode | The goal is reached, or 4 × rows × columns steps pass |
| Optimal return | −(columns + 1), one step up, along the row over the cliff, and one step down |

The task follows Example 6.6 of [Sutton and Barto (2018)](#ref-SB2018a), which compares Q-learning and Sarsa on the same grid.

## Algorithms

| Algorithm | Q-function | Update | Source |
|---|---|---|---|
| **Tabular** | A table of rows × columns × 4 entries, starting at 0 | One step of size α towards r + γ maxₐ′ Q(s′, a′) after every transition | [Watkins and Dayan (1992)](#ref-WD1992a), [Sutton and Barto (2018)](#ref-SB2018a) |
| **DQN** | A network with one hidden layer of **Hidden Units** ReLU units on a one-hot state | One Adam step on a minibatch from the replay buffer, against a target network | [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) |

The network is written with Flux, by [Innes (2018)](#ref-Inn2018a).

## Inputs

| Input | Default | Algorithms |
|---|---|---|
| **Grid Rows** | 4 | both |
| **Grid Columns** | 12 | both |
| **Episodes** | 300 | both |
| **Discount (gamma)** | 0.99 | both |
| **Exploration (epsilon)** | 0.1 | both |
| **Random Seed** | 1 | both |
| **Learning Rate (alpha)** | 0.5 | Tabular |
| **Adam Learning Rate** | 1e-3 | DQN |
| **Batch Size** | 32 | DQN |
| **Hidden Units** | 64 | DQN |

The DQN code also fixes a replay buffer of 10 000 transitions and copies the network to the target network every 200 gradient updates.

## Outputs

| Output | Meaning |
|---|---|
| `greedy_return` | Return of one episode from the start, taking the action with the largest Q-value in every cell |
| `optimal_return` | −(columns + 1), the best return possible on the grid |
| `mean_return_last_50` | Mean return of the last 50 training episodes, played with ε-greedy exploration |
| `episodes_trained` | The value of **Episodes** |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Learning Curve**, **Value Heatmap** | Return per episode with a moving average of 20; maxₐ Q(s, a) over the grid |
| Diagnose | **TD Error**, **Seed Stability** | Moving average of the TD error over updates; learning curves for seeds 1 to 5 |
| Predict | **Greedy Policy**, **Expected Return** | Greedy path over the grid; returns of 100 greedy and 100 ε-greedy episodes |
| Compare | **Algorithm Comparison**, **Exploration Sweep**, **Epsilon Decay** | Q-learning against Sarsa, or DQN against tabular Q-learning; ε from 0.01 to 0.3; constant against annealed ε |
| Interpret | **Policy Table**, **Model Summary** | Greedy action in every cell; size and coverage of the table, or of the network |

## Further reading

| Topic | Source |
|---|---|
| Q-learning, Sarsa and the Cliff Walking example | [Sutton and Barto (2018)](#ref-SB2018a), chapter 6 |
| Convergence of tabular Q-learning | [Watkins and Dayan (1992)](#ref-WD1992a) |
| Deep Q-networks, experience replay and target networks | [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) |
| Deep Q-learning in code, with extensions of DQN | [Lapan (2020)](#ref-Lap2020a) |
| Reinforcement learning components in Julia | [Tian (2020)](#ref-Tia...2020a) |

## References

<a id="ref-Inn2018a"></a>Innes, M. (2018). Flux: Elegant Machine Learning with Julia. *Journal of Open Source Software* 3(25), 602. [doi:10.21105/joss.00602](https://doi.org/10.21105/joss.00602)

<a id="ref-Lap2020a"></a>Lapan, M. (2020). *Deep Reinforcement Learning Hands-On* (2nd ed.). Packt Publishing. [packtpub.com](https://www.packtpub.com/product/deep-reinforcement-learning-hands-on-second-edition/9781838826994)

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
