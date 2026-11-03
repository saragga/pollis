# Policy Gradient Methods: Diagnostics

How to check a run: the learning curve, the entropy of the policy, the gradient norm, the size of each update in KL divergence, the variation across seeds, and the fit of the critic.

## The learning curve

**Learning Curve** plots the mean episode return of each batch against the policy update, with a dashed line at **Max Episode Length**, the largest possible return. With a reward of 1 per step, the return is the number of steps the pole stayed up, as in the pole-balancing example of [Sutton and Barto (2018)](#ref-SB2018a).

A curve that climbs towards the dashed line and stays there shows a policy that learns to balance the pole for the whole episode. Each point averages only **Episodes per Update** episodes of a stochastic policy, so the curve is noisy; `best_mean_return` and `final_mean_return` in the main output summarise its peak and its end.

## Policy entropy

**Policy Entropy** plots the mean entropy of the action distribution over the states of each batch. As its description says, a high entropy means exploring and a low one committed, with log 2 for the uniform policy of two actions, where every run starts.

[Sutton and Barto (2018)](#ref-SB2018a) require in practice that the policy never become deterministic, to ensure exploration, and note that a soft-max in action preferences can approach a deterministic policy. [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) mention adding an entropy bonus to the objective to ensure sufficient exploration, as suggested in earlier work; the panel's objectives have no such bonus, so the entropy shows what the updates alone do to exploration.

## Gradient norm

**Gradient Norm** plots the norm of the policy gradient at each update on a log scale; as its description says, it should stay bounded and non-zero. For PPO, the norm is that of the first epoch on each batch, before the policy has moved.

The advantages that weight the gradient are normalised within each batch, to mean 0 and standard deviation 1, and the gradient is the average over all the steps of the batch. TRPO reports the norm of the plain gradient g that its conjugate-gradient solve starts from.

## KL divergence of each update

**KL Divergence** plots the mean KL divergence between the policy before and after each update, over the states of the batch. As its description says, PPO and TRPO keep it small, while REINFORCE does not control it; for TRPO, a dashed line marks **Max KL**.

[Schulman, Levine, Abbeel, Jordan and Moritz (2015)](#ref-SLAJM2015a) constrain the average KL divergence, a heuristic approximation of the maximum over states that the theory calls for, and [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) design the clipped surrogate to remove the incentive for large changes in the probability ratio.

## Variation across seeds

**Seed Stability** plots the learning curves of the selected algorithm for seeds 1 to 5, with all other settings unchanged. Different seeds give different start states and actions, and so different batches and updates.

Published comparisons average over several runs for the same reason: [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) ran each algorithm with three random seeds on each environment, and [Schulman, Levine, Abbeel, Jordan and Moritz (2015)](#ref-SLAJM2015a) show learning curves averaged across five runs of each algorithm.

## The critic

**Value Estimate** plots the critic V(s) along an episode sampled from the trained policy, against the realised discounted return from each step. The critic is the baseline of all three algorithms, and [Sutton and Barto (2018)](#ref-SB2018a) describe an estimate of the state value as one natural choice of baseline: a baseline leaves the expected update unchanged, but can have a large effect on its variance.

The critic of the action is fitted on a fresh batch collected with the trained policy, and the episode is sampled with seed 7, the same as in **Stochastic Rollout**.

## References

<a id="ref-SLAJM2015a"></a>Schulman, J., Levine, S., Abbeel, P., Jordan, M., & Moritz, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
