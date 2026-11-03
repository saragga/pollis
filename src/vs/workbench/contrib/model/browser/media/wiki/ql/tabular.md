# Q-Learning: Tabular

**Tabular** Q-learning keeps one value for every cell and action of the grid, and moves the value of the pair just tried towards the reward plus the discounted best value of the next cell. The method is that of [Watkins and Dayan (1992)](#ref-WD1992a), in the procedural form of [Sutton and Barto (2018)](#ref-SB2018a).

## The algorithm

[Sutton and Barto (2018)](#ref-SB2018a) give Q-learning as an off-policy temporal-difference control algorithm:

1. Initialise Q(s, a) arbitrarily for all states and actions, except that Q(terminal, ·) = 0.
2. For each episode, start in the initial state.
3. At each step, choose A from S with a policy derived from Q, such as ε-greedy; take A and observe R and S′.
4. Update Q(S, A) ← Q(S, A) + α [R + γ maxₐ Q(S′, a) − Q(S, A)], and set S to S′.
5. Repeat until S is terminal.

The parameters are the step size α in (0, 1] and a small ε > 0.

## In the panel

The table has rows × columns rows, one per cell, and 4 columns, one per action, and starts at 0. Each episode begins in the bottom-left cell and ends at the goal or after 4 × rows × columns steps.

At every step the panel picks an action by ε-greedy selection, with probability **Exploration (epsilon)** at random, and otherwise the first action with the largest value. After the move, the temporal-difference error d = r + γ maxₐ′ Q(s′, a′) − Q(s, a) is computed, with a next value of 0 when s′ is the goal, and the entry is updated by α × d with α the **Learning Rate (alpha)**. Every error is stored for **TD Error**.

The random numbers come from a Mersenne Twister seeded with **Random Seed**, so a run can be repeated exactly.

## Convergence

[Watkins and Dayan (1992)](#ref-WD1992a) prove that Q-learning converges to the optimal action values with probability 1 so long as all actions are repeatedly sampled in all states and the action values are represented discretely, the case of the table. They call it a form of model-free reinforcement learning: the agent learns to act optimally without building a map of the domain.

[Sutton and Barto (2018)](#ref-SB2018a) add that the learned Q directly approximates the optimal action-value function, independent of the policy being followed, which dramatically simplifies the analysis of the algorithm and enabled early convergence proofs. [Assumptions](assumptions.md) sets out the conditions on the rewards, the step sizes and the visits.

## Sarsa

**Algorithm Comparison** on the **Tabular** tab runs Sarsa with the same code, changing only the next value in the target: the value of the next action the ε-greedy policy actually picks, Q(s′, a′), in place of maxₐ′ Q(s′, a′). Sarsa is therefore on-policy: it learns the values of the policy it follows, exploration included.

In the Cliff Walking example of [Sutton and Barto (2018)](#ref-SB2018a), with ε-greedy action selection and ε = 0.1, Q-learning learns values for the optimal policy, which travels right along the edge of the cliff, while Sarsa learns the longer but safer path through the upper part of the grid.

## When to use it

The panel's decision table suggests **Tabular** for small, discrete state and action spaces, such as grid worlds, board positions and inventory levels. The bullet of the panel describes it as exact and interpretable for small discrete state-action spaces: every entry of the table can be read, and **Policy Table** and **Value Heatmap** show all of them.

The table needs one entry per state and action, so its size grows with the number of states; **Model Summary** reports it, and **DQN** replaces it with a network.

## References

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-WD1992a"></a>Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning* 8(3-4), 279-292. [doi:10.1007/BF00992698](https://doi.org/10.1007/BF00992698)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [DQN](dqn.md)
