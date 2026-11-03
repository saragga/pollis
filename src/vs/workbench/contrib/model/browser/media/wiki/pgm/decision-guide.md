# Policy Gradient Methods: Decision Guide

Which algorithm to run, how to set the batch, the step and the algorithm-specific inputs, and where to go beyond the panel.

## Choosing an algorithm

| Situation | Algorithm | Why |
|---|---|---|
| Teaching, small problems, a baseline | **REINFORCE** | The simplest policy gradient: one step along γᵗ × advantage × ∇log π |
| Some of the benefits of TRPO, simpler to implement | **PPO** | Reuses each batch for several epochs |
| Steady improvement with little tuning of hyperparameters | **TRPO** | A natural-gradient step with a line search that enforces a KL limit |

The table follows the panel's decision table. All three use the same batches, critic and advantages, so **REINFORCE vs PPO vs TRPO** compares the updates and nothing else.

## What the sources report

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) propose PPO as a method with the data efficiency and reliable performance of TRPO that uses only first-order optimisation, and report that it outperformed other online policy gradient methods on their benchmarks, including simulated robotic locomotion and Atari games.

[Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) report that TRPO tends to give monotonic improvement with little tuning of hyperparameters, and found that constraining the KL divergence was a more robust way to choose step sizes than a fixed penalty. [Sutton and Barto (2018)](#ref-SB2018a) describe REINFORCE as having good theoretical convergence properties, but possibly high variance and slow learning.

## The batch

**Episodes per Update** sets how many episodes each update sees, 10 by default, and **Policy Updates** how many updates there are, 60. **Batch Size Study** keeps their product fixed and compares 2, 5, 10 and 20 episodes per update, which shows how to spend a fixed number of episodes.

**Max Episode Length**, 500, caps the return and the length of each episode, and **Discount (gamma)**, 0.99, weights later rewards in the returns that the critic is fitted to.

## Step size and the specific inputs

| Input | Algorithm | Guidance |
|---|---|---|
| **Learning Rate** | REINFORCE, PPO | Adam step, 0.05 by default |
| **Clip (epsilon)** | PPO | [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) suggest 0.2, the best of 0.1, 0.2 and 0.3 in their comparison |
| **Epochs** | PPO | Number of passes over each batch, 10 |
| **Max KL** | TRPO | [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) used 0.01 in all their experiments |
| **Damping** | TRPO | Numerical stability of the conjugate-gradient solve, 0.1 |

[Sutton and Barto (2018)](#ref-SB2018a) remark that the step size of the policy parameters is less clear to set than that of value estimates, and that its best value depends on the range of variation of the rewards and on the policy parameterisation. [Kingma and Ba (2015)](#ref-KB2015a) describe Adam as suited to noisy gradients, with hyperparameters that typically require little tuning.

## Checking a choice

Before trusting a comparison, look at **Seed Stability**: five seeds of the selected algorithm show how far a single learning curve can be from another. **KL Divergence** shows whether the updates stay small, and **Policy Entropy** how quickly the policy commits.

A policy that reaches the cap in **Learning Curve** can be checked with **Deterministic Policy**, which compares the greedy and the stochastic policy over 50 episodes, and with **Stochastic Rollout**, which plots the cart position and the pole angle of one episode.

## Beyond the panel

The panel's policy is linear in the state and its actions are discrete. [Sutton and Barto (2018)](#ref-SB2018a) treat policy parameterisations for continuous actions, actor–critic methods that use the critic to assess actions through a one-step return, and policy gradients for continuing tasks; [Williams (1992)](#ref-Wil1992a) gives REINFORCE algorithms for Gaussian units as well as Bernoulli ones.

ReinforcementLearning.jl, by [Tian (2020)](#ref-Tia...2020a), provides environments such as `CartPoleEnv` and components for policies, stop conditions and hooks, for experiments beyond the code of the panel.

## References

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-SLMJA2015a"></a>Schulman, J., Levine, S., Moritz, P., Jordan, M., & Abbeel, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-Wil1992a"></a>Williams, R. J. (1992). Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning. *Machine Learning* 8(3-4), 229-256. [doi:10.1007/BF00992696](https://doi.org/10.1007/BF00992696)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
