# Q-Learning: Assumptions

What Q-learning assumes about the task, the exploration and the step sizes, and what changes when a network takes the place of the table.

## A Markov decision process

[Watkins and Dayan (1992)](#ref-WD1992a) consider an agent in a discrete, finite world, choosing one of a finite set of actions at every step. The world is a controlled Markov process: the reward has a mean that depends only on the state and the action, and the next state depends only on the current state and the action. The agent seeks a policy that maximises the total discounted expected reward, with rewards s steps ahead discounted by γˢ.

The panel's grid meets these conditions: the state is the agent's cell, there are four actions, and the reward and the next cell depend only on the cell and the action. Moves are deterministic, which is a special case of the probabilistic transitions of the theory.

## The convergence theorem

[Watkins and Dayan (1992)](#ref-WD1992a) prove that tabular Q-learning converges to the optimal action values with probability 1, given:

| Condition | Statement |
|---|---|
| Bounded rewards | ∣rₙ∣ ≤ R for some constant R |
| Learning rates | 0 < αₙ < 1 |
| Rates over the visits to each pair | Σᵢ α = ∞ and Σᵢ α² < ∞, summed over the visits to each state and action |
| Representation | A look-up table, one value for each state and action |

The most important condition implicit in the theorem, they write, is that the episodes include an infinite number of visits to each state and action; under the stochastic conditions of the theorem, no method could be guaranteed to find an optimal policy under weaker conditions.

## Visiting every pair

[Sutton and Barto (2018)](#ref-SB2018a) make the same point: all that is required for correct convergence is that all state–action pairs continue to be updated, a minimal requirement in the sense that any method guaranteed to find optimal behaviour in the general case must require it.

In the panel, ε-greedy exploration with a positive **Exploration (epsilon)** gives every action in a visited cell a positive probability. Cells the agent never reaches keep their initial values of 0; **Model Summary** on the **Tabular** tab counts them as `unvisited_states`. The cliff cells and the goal are never left by an action, so their entries also stay at 0.

## Step sizes

The rates of the theorem shrink with the number of visits to each pair, so that their sum diverges while the sum of their squares stays finite. The procedural form of Q-learning in [Sutton and Barto (2018)](#ref-SB2018a) uses a step size α in (0, 1], and the panel keeps **Learning Rate (alpha)** constant at 0.5 by default.

The tooltip of **Learning Rate (alpha)** describes the trade-off in the panel: a large step can make the values oscillate, a small one slows learning.

## Discounting and episodes

The theorem of [Watkins and Dayan (1992)](#ref-WD1992a) assumes 0 < γ < 1. They sketch an extension to the non-discounted case, γ = 1, for a Markov process with absorbing goal states. The Cliff Walking example of [Sutton and Barto (2018)](#ref-SB2018a) is an undiscounted, episodic task.

**Discount (gamma)** takes values in (0, 1], 0.99 by default. Every episode in the panel ends at the goal or after 4 × rows × columns steps, and the target of the last step into the goal uses a next value of 0, as the terminal state has value 0 in the algorithm of [Sutton and Barto (2018)](#ref-SB2018a).

## Function approximation

The proof of [Watkins and Dayan (1992)](#ref-WD1992a) assumes a look-up table. With a network, [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) write that reinforcement learning is known to be unstable or even to diverge when a nonlinear function approximator represents the action-value function. They name three causes: the correlations in the sequence of observations, the fact that small updates to Q may significantly change the policy and hence the data distribution, and the correlations between the action values and the target values.

[Sutton and Barto (2018)](#ref-SB2018a) describe the combination of function approximation, bootstrapping and off-policy training as the deadly triad: instability can be avoided when any two are present, but not all three. Q-learning with a network has all three, and the replay buffer and target network of **DQN** are the remedies of [Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a).

## Replay requires off-policy learning

[Mnih, Kavukcuoglu, Silver, Rusu, Veness, Bellemare, Graves, Riedmiller, Fidjeland, Ostrovski, Petersen, Beattie, Sadik, Antonoglou, King, Kumaran, Wierstra, Legg and Hassabis (2015)](#ref-MKSRV...2015a) note that learning from replayed experience requires an off-policy method, since the current parameters differ from those that generated the samples, which motivates the choice of Q-learning. [Sutton and Barto (2018)](#ref-SB2018a) add that, because Q-learning is off-policy, it does not need to be applied along connected trajectories.

The panel's replay buffer holds the last 10 000 transitions, and each gradient step of **DQN** uses **Batch Size** transitions drawn from it at random, with replacement.

## References

<a id="ref-MKSRV...2015a"></a>Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D. (2015). Human-level Control through Deep Reinforcement Learning. *Nature* 518(7540), 529-533. [doi:10.1038/nature14236](https://doi.org/10.1038/nature14236)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Tabular](tabular.md) · [DQN](dqn.md)
