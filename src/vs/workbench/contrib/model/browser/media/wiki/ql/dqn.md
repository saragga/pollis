# Q-Learning: DQN

**DQN**, the deep Q-network of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a), replaces the table of Q-values with a neural network, and trains it by Q-learning on minibatches drawn from a replay buffer, against targets from a target network that is updated only periodically.

## The deep Q-network

[Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) developed the deep Q-network to learn successful policies directly from high-dimensional sensory inputs. Receiving only the pixels and the game score, it reached a level comparable to that of a professional human games tester across 49 Atari 2600 games, with the same algorithm, network architecture and hyperparameters for all of them.

The network takes the state as its input and has a separate output unit for each action, so that one forward pass gives the predicted Q-values of all actions in a state. In the Atari agent the input was a stack of preprocessed screen images and the network was convolutional.

## The loss

At iteration i, the parameters θᵢ of the Q-network are fitted to minimise the loss

Lᵢ(θᵢ) = E[(r + γ maxₐ′ Q(s′, a′; θᵢ⁻) − Q(s, a; θᵢ))²]

where the expectation is over transitions drawn uniformly from the replay memory and θᵢ⁻ are the parameters of the target network, as [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) define it. For a transition that ends the episode, the target is the reward alone.

[Sutton and Barto (2018)](#ref-SB2018a) explain the difficulty the target network addresses: with function approximation, the target of a Q-learning update depends on the same parameters that are being updated, which, unlike supervised learning, can lead to oscillations or divergence.

## Experience replay

[Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) store the agent's experience at each step, the tuple (s, a, r, s′), in a replay memory, and apply Q-learning updates to minibatches drawn from it at random. They give three advantages over standard online Q-learning:

| Advantage | Reason |
|---|---|
| Data efficiency | Each step of experience is potentially used in many weight updates |
| Lower variance | Random samples break the strong correlations between consecutive samples |
| Stability | The behaviour distribution is averaged over many previous states, avoiding oscillations or divergence |

Their algorithm stores only the last N transitions and samples uniformly from them.

## The target network

Every C updates, [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) clone the Q-network to obtain a target network and use it to generate the Q-learning targets for the next C updates. In standard online Q-learning, an update that increases Q(sₜ, aₜ) often also increases Q(sₜ₊₁, a) for all a, and hence the target; generating the targets with an older set of parameters adds a delay that makes divergence or oscillations much more unlikely.

[Sutton and Barto (2018)](#ref-SB2018a) report that, in runs on 5 games with experience replay and the target network switched on or off, each feature alone significantly improved performance, and the two together very dramatically.

## In the panel

| Part | Panel |
|---|---|
| Input | One-hot vector of rows × columns entries, one per cell |
| Network | `Chain(Dense(rows × columns => hidden, relu), Dense(hidden => 4))`, with **Hidden Units** for the hidden layer |
| Replay buffer | The last 10 000 transitions (s, a, r, s′, done) |
| Minibatch | **Batch Size** transitions drawn at random, with replacement, once the buffer holds that many |
| Loss | Mean squared TD error, with targets from the target network |
| Optimiser | Adam with **Adam Learning Rate** |
| Target network | A copy of the Q-network, renewed every 200 environment steps |
| Exploration | ε-greedy with **Exploration (epsilon)**, fixed over training |

One gradient step is taken after every environment step. The network, the Adam optimiser and the gradients come from Flux, by [Innes (2018)](#ref-Inn2018a), in which models are written in Julia's mathematical syntax and trained by automatic differentiation.

## Settings of the Atari agent

[Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) trained with RMSProp on minibatches of 32, with ε annealed linearly from 1.0 to 0.1 over the first million frames and fixed at 0.1 thereafter, and a replay memory of the 1 million most recent frames. They also clipped the rewards to between −1 and 1, and clipped the error term of the update to the same interval, which further improved the stability of the algorithm.

The panel's grid has rewards of −1 and −100 and a few dozen states, and its defaults, a minibatch of 32 and ε = 0.1, match the corresponding settings of the Atari agent. The code that accompanies [Lapan (2020)](#ref-Lap2020a) trains a DQN on the Atari game Pong.

## References

<a id="ref-Inn2018a"></a>Innes, M. (2018). Flux: Elegant Machine Learning with Julia. *Journal of Open Source Software* 3(25), 602. [doi:10.21105/joss.00602](https://doi.org/10.21105/joss.00602)

<a id="ref-Lap2020a"></a>Lapan, M. (2020). *Deep Reinforcement Learning Hands-On* (2nd ed.). Packt Publishing. [packtpub.com](https://www.packtpub.com/product/deep-reinforcement-learning-hands-on-second-edition/9781838826994)

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md)
