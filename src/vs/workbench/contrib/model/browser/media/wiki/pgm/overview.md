# Policy Gradient Methods: Overview

**Policy Gradient Methods** trains a stochastic policy for the cart-pole task with three algorithms, REINFORCE, PPO and TRPO, all written out in plain Julia so that every step of an update can be read in the code.

## Learning a policy directly

[Sutton and Barto (2018)](#ref-SB2018a) describe policy gradient methods as methods that learn a parameterised policy π(a|s, θ), which selects actions without consulting a value function, and update θ by approximate gradient ascent on a performance measure J(θ):

θₜ₊₁ = θₜ + α ∇Ĵ(θₜ)

where ∇Ĵ is a stochastic estimate whose expectation approximates the gradient. Methods that also learn a value function, the critic, next to the policy, the actor, are called actor–critic methods.

[Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) contrast the approach with value-function methods, which are oriented towards deterministic policies, whereas the optimal policy is often stochastic, and in which an arbitrarily small change in an estimated value can cause an action to be selected or not.

## The policy gradient theorem

The difficulty is that performance depends on the distribution of states, which the policy changes in an unknown way. The policy gradient theorem, in the form [Sutton and Barto (2018)](#ref-SB2018a) give for the episodic case, expresses the gradient without the derivative of the state distribution:

∇J(θ) ∝ Σₛ μ(s) Σₐ q_π(s, a) ∇π(a|s, θ)

with μ the on-policy distribution of states. [Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) show that the gradient can be written in a form suitable for estimation from experience, aided by an approximate action-value or advantage function, and that a version of policy iteration with arbitrary differentiable function approximation then converges to a locally optimal policy.

## Three algorithms

| Algorithm | Update | Source |
|---|---|---|
| **REINFORCE** | One gradient step per batch, weighted by the advantage | [Williams (1992)](#ref-Wil1992a) |
| **PPO** | Several epochs on a clipped surrogate objective | [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) |
| **TRPO** | A natural-gradient step within a limit on the KL divergence | [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) |

All three share the same environment, policy, critic and batches of episodes, and differ only in the update.

## The cart-pole task

The pole-balancing task of [Sutton and Barto (2018)](#ref-SB2018a) is to apply forces to a cart moving along a track so as to keep a pole hinged to the cart from falling over; a failure occurs when the pole falls past a given angle from vertical or the cart runs off the track. With a reward of +1 for every step without failure, the return is the number of steps until failure.

The panel writes the dynamics directly: a push of 10 to the left or right every 0.02 s, and an episode ends when the cart leaves ±2.4, the pole leans past 12°, or **Max Episode Length** steps pass. ReinforcementLearning.jl, by [Tian (2020)](#ref-Tia...2020a), offers the same task as `CartPoleEnv`, with components for policies, stop conditions and hooks.

## How the panel is organised

**Policy Updates** sets the number of collect-then-update iterations, **Episodes per Update** the size of each batch, and **Discount (gamma)** the discount of the returns. **Learning Rate** sets the Adam step of REINFORCE and PPO, **Clip (epsilon)** and **Epochs** the PPO update, and **Max KL** and **Damping** the TRPO step.

The actions fall into five groups: Visualise shows the learning curve and the entropy of the policy; Diagnose follows the gradient norm, the KL divergence of each update and the variation across seeds; Predict runs the trained policy; Compare sets the three algorithms and four batch sizes side by side; and Interpret shows the action probabilities and the critic.

## References

<a id="ref-SLMJA2015a"></a>Schulman, J., Levine, S., Moritz, P., Jordan, M., & Abbeel, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-SMSM2000a"></a>Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (2000). Policy Gradient Methods for Reinforcement Learning with Function Approximation. *NeurIPS*. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-Wil1992a"></a>Williams, R. J. (1992). Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning. *Machine Learning* 8(3-4), 229-256. [doi:10.1007/BF00992696](https://doi.org/10.1007/BF00992696)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
