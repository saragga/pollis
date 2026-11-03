# Policy Gradient Methods: Interpretation

How to read the outputs: returns, the greedy and the stochastic policy, the policy weights and action probabilities, the critic, and the comparisons between algorithms and batch sizes.

## Returns

With a reward of 1 per step, the return of an episode is the number of steps before the pole fell or the cart left the track, up to **Max Episode Length**; [Sutton and Barto (2018)](#ref-SB2018a) describe the same reading for pole-balancing, where the return at each time is the number of steps until failure.

`final_mean_return` is the mean return of the last batch, `best_mean_return` the highest batch mean during training and `max_return` the cap. A final mean equal to `max_return` means that every episode of the last batch ran to the cap.

## Greedy and stochastic policies

The trained policy is stochastic: at every step it samples push left or push right with the probabilities of the softmax. `greedy_return` in the main output, and **Deterministic Policy** over 50 episodes, take the most probable action instead.

**Deterministic Policy** prints, for the greedy and the stochastic policy, the mean return, the smallest return and the share of episodes that reach **Max Episode Length**. [Sutton and Barto (2018)](#ref-SB2018a) note that a soft-max in action preferences can approach a deterministic policy, and that, when the optimal policy is deterministic, the preferences of the optimal actions are driven ever higher than those of the others.

## Policy weights and action probabilities

`policy_weights` is the 2 × 5 matrix W, one row of preferences per action, with columns for cart position, cart velocity, pole angle, angular velocity and the constant. The probabilities follow from the softmax of W [s; 1].

**Action Probabilities** draws the probability of pushing right as a heat map over the pole angle, from −12° to 12°, and the angular velocity, from −2 to 2 rad/s, with the cart centred and still. The map shows how the trained weights turn the angle and its rate of change into a choice between the two pushes.

## The critic

**Value Estimate** compares the critic V(s) with the realised discounted return along one sampled episode. The critic is fitted by least squares on the features [1; s; s²], so it is a quadratic function of the state, and it estimates the expected discounted return from each state under the trained policy.

[Sutton and Barto (2018)](#ref-SB2018a) call methods that learn both a policy and a value function actor–critic methods. In the panel, the critic serves as the baseline of REINFORCE and of the advantages of PPO and TRPO; in their terms, it estimates the value of the first state of each transition and sets a baseline for the return that follows.

## Comparing the algorithms

**REINFORCE vs PPO vs TRPO** plots the learning curves of the three algorithms with their default settings, from the same seed: learning rate 0.05 for REINFORCE and PPO, clip 0.2 and 10 epochs for PPO, and a KL limit of 0.01 with damping 0.1 for TRPO.

The three runs share the environment, the policy class, the critic and the first batch, and differ in the update. [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) report that PPO outperformed other online policy gradient methods on their benchmarks, with a favourable balance between sample complexity, simplicity and wall time; **Seed Stability** shows, for the selected algorithm, how far the curves of other seeds lie from the one of seed 1.

## Batch size

**Batch Size Study** trains with 2, 5, 10 and 20 episodes per update, adjusting the number of updates so that the total number of episodes stays at **Policy Updates** × **Episodes per Update**, and prints the number of updates and the final and best mean returns for each.

Small batches give many updates from few episodes each; large batches give fewer updates, each estimated from more episodes. [Sutton and Barto (2018)](#ref-SB2018a) point to the high variance of REINFORCE, as a Monte Carlo method, as a source of slow learning.

## References

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
