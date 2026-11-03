# Policy Gradient Methods: Assumptions

What the three algorithms take for granted: an episodic task, a stochastic policy that is differentiable in its parameters, data collected with the current policy, a baseline that depends only on the state, and small enough steps.

## An episodic task

The cart-pole task is episodic: an episode ends when the pole falls, the cart leaves the track or **Max Episode Length** steps pass. [Sutton and Barto (2018)](#ref-SB2018a) note that pole-balancing can be treated as episodic, with the repeated attempts to balance the pole as the natural episodes and a reward of +1 for every step without failure.

REINFORCE uses the complete return from each step to the end of the episode, and [Sutton and Barto (2018)](#ref-SB2018a) describe it as well defined only for the episodic case, with updates made after the episode is completed. The returns are discounted with **Discount (gamma)**, 0.99 by default.

## A differentiable stochastic policy

Policy gradient methods need π(a|s, θ) to be differentiable with respect to θ. [Sutton and Barto (2018)](#ref-SB2018a) add that, to ensure exploration, the policy is generally required never to become deterministic, so that every action keeps a probability strictly between 0 and 1.

The panel's softmax of linear action preferences meets both conditions: every action has a positive probability, and the log-probability has a closed-form gradient. The preferences are linear in the four state variables, cart position, cart velocity, pole angle and angular velocity, and a constant, as in the linear action preferences of [Sutton and Barto (2018)](#ref-SB2018a).

## Data from the current policy

The policy gradient theorem weights states by the on-policy distribution, the distribution of states under the policy being improved, as [Sutton and Barto (2018)](#ref-SB2018a) write. Each batch of **Episodes per Update** episodes is therefore collected with the current policy, and used for one update before a new batch is collected.

PPO and TRPO evaluate the new policy on the batch of the old one through the probability ratio π_θ(aₜ|sₜ) / π_θold(aₜ|sₜ), which [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) and [Schulman, Levine, Abbeel, Jordan and Moritz (2015)](#ref-SLAJM2015a) use in their surrogate objectives; the clip and the KL limit keep the new policy close to the one that collected the data.

## A baseline that ignores the action

[Sutton and Barto (2018)](#ref-SB2018a) state that the baseline subtracted from the return can be any function, even a random variable, as long as it does not vary with the action; it then leaves the expected update unchanged.

The panel's critic V(s) = φ(s)ᵀw, with φ(s) = [1; s; s²], depends only on the state, and is refitted by least squares to the discounted returns of every batch. The advantages are the returns minus the critic, normalised to mean 0 and standard deviation 1 within each batch.

## Small steps

[Sutton and Barto (2018)](#ref-SB2018a) write that the expected REINFORCE update over an episode points in the direction of the performance gradient, which assures an improvement in expected performance for a sufficiently small step size, and convergence to a local optimum under standard stochastic approximation conditions for a decreasing one.

The panel keeps **Learning Rate** constant and uses Adam, by [Kingma and Ba (2015)](#ref-KB2015a), for REINFORCE and PPO; TRPO sets the size of each step from **Max KL** instead. All three start from the same uniform policy, W = 0.

## Local optima

[Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) prove that a version of policy iteration with arbitrary differentiable function approximation converges to a locally optimal policy. In the panel, the policy class is the linear softmax, and every run starts from the uniform policy.

**Seed Stability** runs the selected algorithm with seeds 1 to 5; different seeds give different episodes and can lead to different final policies.

## References

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-SLAJM2015a"></a>Schulman, J., Levine, S., Abbeel, P., Jordan, M., & Moritz, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-SMSM2000a"></a>Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (2000). Policy Gradient Methods for Reinforcement Learning with Function Approximation. *NeurIPS*. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
