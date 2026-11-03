# Q-Learning: Decision Guide

Which algorithm to run, how to set the exploration, the step sizes and the length of training, and how to check the result.

## Choosing an algorithm

| Situation | Algorithm | Why |
|---|---|---|
| Small, discrete state and action spaces: grid worlds, board positions, inventory levels | **Tabular** | One Q(s, a) entry per state and action, updated towards r + γ maxₐ′ Q(s′, a′) |
| Large or continuous state spaces where a table is infeasible | **DQN** | A network approximates Q(s, ·), trained on minibatches from a replay buffer against a periodically synchronised target network |

The table follows the panel's decision table. The convergence theorem of [Watkins and Dayan (1992)](#ref-WD1992a) applies to the table; [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) introduced the network for inputs as large as the screens of Atari 2600 games.

## Exploration

**Exploration (epsilon)** sets the probability of a random action, 0.1 by default, the value of the Cliff Walking example of [Sutton and Barto (2018)](#ref-SB2018a). A positive ε keeps every action in a visited cell possible, which the convergence conditions of [Watkins and Dayan (1992)](#ref-WD1992a) need.

**Exploration Sweep** shows the training return and the greedy return for ε from 0.01 to 0.3. In the deep Q-network of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a), ε was annealed linearly from 1.0 to 0.1 over the first million frames and held at 0.1 thereafter. The panel keeps ε fixed for the whole run, and **Epsilon Decay** compares that run with one in which ε falls linearly from 1.0 to **Exploration (epsilon)** over the first half of the episodes.

## Step sizes

For **Tabular**, **Learning Rate (alpha)** is the step size of the update, 0.5 by default. The algorithm of [Sutton and Barto (2018)](#ref-SB2018a) takes α in (0, 1], while the theorem of [Watkins and Dayan (1992)](#ref-WD1992a) uses step sizes that shrink over the visits to each pair.

For **DQN**, **Adam Learning Rate** is the step size of the Adam optimiser, 1e-3 by default, and **Batch Size** the number of transitions in each minibatch, 32 by default, the minibatch size of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a), who trained with RMSProp.

## Discount and length of training

**Discount (gamma)** weighs future rewards, 0.99 by default; as its tooltip says, values close to 1 weigh long-term rewards. The theorem of [Watkins and Dayan (1992)](#ref-WD1992a) assumes γ < 1, with an extension to γ = 1 when the process has absorbing goal states, as the grid does.

**Episodes** sets the length of training, 300 by default. **Learning Curve** and **TD Error** show whether the returns and the errors have settled by the end of the run, and **Seed Stability** whether the same holds for other seeds.

## The network

**Hidden Units** sets the width of the single hidden layer, 64 by default. The input is a one-hot vector of rows × columns entries, one per cell, and the output has one value for each of the 4 actions, the architecture of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) in which a single forward pass gives the Q-values of all actions.

The replay buffer of 10 000 transitions and the synchronisation of the target network every C = 200 gradient updates are fixed in the code. In [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a), the replay memory held the 1 million most recent frames.

## Checking the result

| Question | Action |
|---|---|
| Has training settled? | **Learning Curve**, **TD Error** |
| Does the result depend on the seed? | **Seed Stability** |
| Has the greedy policy found a shortest path? | `greedy_return` against `optimal_return`, **Greedy Policy** |
| How costly is exploration? | **Expected Return**, **Exploration Sweep** |
| Which cells has the agent visited? | **Model Summary**, **Policy Table** |
| How does another method do here? | **Algorithm Comparison** |

## Further methods

[Sutton and Barto (2018)](#ref-SB2018a) present Sarsa, the on-policy counterpart of Q-learning, which **Algorithm Comparison** runs on the **Tabular** tab, and Expected Sarsa, which replaces the maximum over next actions with the expected value under the current policy.

The code that accompanies [Lapan (2020)](#ref-Lap2020a) has scripts for several extensions of DQN: n-step returns, double DQN, noisy networks, prioritised replay, dueling networks, a distributional DQN, and their combination in Rainbow. ReinforcementLearning.jl, by [Tian (2020)](#ref-Tia...2020a), provides components for experiments with such methods in Julia.

## References

<a id="ref-Lap2020a"></a>Lapan, M. (2020). *Deep Reinforcement Learning Hands-On* (2nd ed.). Packt Publishing. [packtpub.com](https://www.packtpub.com/product/deep-reinforcement-learning-hands-on-second-edition/9781838826994)

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
