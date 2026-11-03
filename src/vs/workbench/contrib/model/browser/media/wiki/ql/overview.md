# Q-Learning: Overview

Q-learning learns how to act in a Markov decision process from experience alone, by estimating the value of every action in every state. The panel trains it on a small grid, either with a table of values or with a neural network.

## Learning action values

[Watkins and Dayan (1992)](#ref-WD1992a) describe Q-learning as a simple way for agents to learn how to act optimally in controlled Markovian domains, an incremental method for dynamic programming that works by successively improving its evaluations of the quality of particular actions at particular states. The agent tries an action, observes the reward and the next state, and judges the action by the immediate reward and its estimate of the value of the state it reaches.

The quality of an action is its Q-value, Q(s, a), the expected discounted reward for taking action a in state s and acting optimally thereafter. Once the optimal Q-values are known, the best action in each state is the one with the largest value: [Watkins and Dayan (1992)](#ref-WD1992a) note that an optimal policy follows directly from them.

## The update

After each transition from s to s′ with action a and reward r, Q-learning moves the estimate towards a target:

Q(s, a) ← Q(s, a) + α [r + γ maxₐ′ Q(s′, a′) − Q(s, a)]

with step size α and discount γ, the form (6.8) of [Sutton and Barto (2018)](#ref-SB2018a). The bracket is the temporal-difference error, the gap between the target and the current estimate.

[Sutton and Barto (2018)](#ref-SB2018a) call Q-learning an off-policy method: the learned Q directly approximates the optimal action-value function, independent of the policy being followed, while that policy still decides which state–action pairs are visited and updated.

## Exploration

The agent must keep trying actions whose values are uncertain. The panel uses the ε-greedy behaviour policy of the procedural form in [Sutton and Barto (2018)](#ref-SB2018a): with probability **Exploration (epsilon)** a random action, otherwise the action with the largest Q-value.

Since Q-learning is off-policy, the values it learns are those of the greedy policy, even though the agent explores while learning. The panel therefore reports two returns: `mean_return_last_50`, from the exploring training episodes, and `greedy_return`, from one episode with no exploration.

## Cliff Walking

The panel's grid is the Cliff Walking example of [Sutton and Barto (2018)](#ref-SB2018a): every step costs 1, and a step into the cliff along the bottom row costs 100 and sends the agent back to the start. The shortest path runs along the edge of the cliff.

[Sutton and Barto (2018)](#ref-SB2018a) use the example to compare Q-learning with Sarsa, an on-policy method. Q-learning learns the values of the optimal path along the edge, and its ε-greedy exploration occasionally takes it over the cliff; Sarsa takes the exploration into account and learns a longer but safer path through the upper part of the grid. **Algorithm Comparison** on the **Tabular** tab runs both.

## Two representations

The **Tabular** algorithm keeps one entry for each cell and action, the setting of the convergence proof of [Watkins and Dayan (1992)](#ref-WD1992a). The **DQN** algorithm replaces the table with a neural network, as in the deep Q-network of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a), which learned to play Atari 2600 games from the pixels and the game score.

[Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) add two ingredients to Q-learning for training a network: experience replay, which stores the agent's transitions and learns from random samples of them, and a target network, a copy of the Q-network updated only periodically, which supplies the targets. The panel's DQN has both, and writes the network with Flux, by [Innes (2018)](#ref-Inn2018a).

## The panel in Julia

The panel's code is plain Julia: the grid, the ε-greedy policy and the update are written out in a few lines, and Flux supplies the network, the Adam optimiser and the gradients for **DQN**. Flux, by [Innes (2018)](#ref-Inn2018a), lets models be written in Julia's mathematical syntax and applies automatic differentiation to calculate derivatives and train them.

ReinforcementLearning.jl, by [Tian (2020)](#ref-Tia...2020a), offers environments, policies, stop conditions and hooks for running such experiments at a larger scale, from traditional tabular methods to modern deep reinforcement learning algorithms. The code that accompanies [Lapan (2020)](#ref-Lap2020a) includes tabular Q-learning on the FrozenLake grid and a deep Q-network for the Atari game Pong.

## References

<a id="ref-Inn2018a"></a>Innes, M. (2018). Flux: Elegant Machine Learning with Julia. *Journal of Open Source Software* 3(25), 602. [doi:10.21105/joss.00602](https://doi.org/10.21105/joss.00602)

<a id="ref-Lap2020a"></a>Lapan, M. (2020). *Deep Reinforcement Learning Hands-On* (2nd ed.). Packt Publishing. [packtpub.com](https://www.packtpub.com/product/deep-reinforcement-learning-hands-on-second-edition/9781838826994)

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
