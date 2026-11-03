# Policy Gradient Methods: Factsheet

The panel's environment, policy, algorithms, inputs, outputs and sources at a glance.

## Environment and policy

| Item | Value |
|---|---|
| Task | Cart-pole: actions push left or push right with force 10, time step 0.02 |
| State | Cart position and velocity, pole angle and angular velocity |
| Start | Each state variable uniform in [−0.05, 0.05] |
| End of episode | Cart beyond ±2.4, pole beyond ±12°, or **Max Episode Length** steps |
| Reward | 1 per step |
| Policy | Linear softmax: π(·∣s) = softmax(W [s; 1]), W a 2 × 5 matrix starting at 0, a uniform policy |
| Critic | Least squares on φ(s) = [1; s; s²], refitted to the discounted returns of each batch |
| Advantages | Return minus critic, normalised to mean 0 and sd 1 in each batch |

## Algorithms

| Algorithm | Update of W | Source |
|---|---|---|
| **REINFORCE** | One Adam step along the mean of advantage × ∇log π | [Williams (1992)](#ref-Wil1992a), [Sutton and Barto (2018)](#ref-SB2018a) |
| **PPO** | **Epochs** Adam steps along the gradient of the clipped surrogate | [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) |
| **TRPO** | Conjugate-gradient step on the Fisher matrix, scaled to **Max KL**, with a backtracking line search | [Schulman, Levine, Abbeel, Jordan and Moritz (2015)](#ref-SLAJM2015a) |

Adam, by [Kingma and Ba (2015)](#ref-KB2015a), uses moment decay rates 0.9 and 0.999 in the panel.

## Inputs

| Input | Default | Algorithms |
|---|---|---|
| **Policy Updates** | 60 | all |
| **Episodes per Update** | 10 | all |
| **Max Episode Length** | 500 | all |
| **Discount (gamma)** | 0.99 | all |
| **Random Seed** | 1 | all |
| **Learning Rate** | 0.05 | REINFORCE, PPO |
| **Clip (epsilon)** | 0.2 | PPO |
| **Epochs** | 10 | PPO |
| **Max KL** | 0.01 | TRPO |
| **Damping** | 0.1 | TRPO |

## Outputs

| Output | Meaning |
|---|---|
| `final_mean_return` | Mean return of the episodes of the last batch |
| `best_mean_return` | Highest batch mean over training |
| `max_return` | **Max Episode Length**, the largest possible return |
| `greedy_return` | Return of one episode with the most probable action at every step |
| `policy_weights` | The matrix W, rounded |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Learning Curve**, **Policy Entropy** | Mean return per update; mean entropy of the policy |
| Diagnose | **Gradient Norm**, **KL Divergence**, **Seed Stability** | Norm per update; mean KL(old ‖ new); curves for seeds 1 to 5 |
| Predict | **Stochastic Rollout**, **Deterministic Policy** | One sampled episode; greedy against stochastic over 50 episodes |
| Compare | **REINFORCE vs PPO vs TRPO**, **Batch Size Study** | Three learning curves; 2, 5, 10 and 20 episodes per update |
| Interpret | **Action Probabilities**, **Value Estimate** | P(push right) by angle and angular velocity; critic against return |

## Further reading

| Topic | Work |
|---|---|
| Policy gradient methods, REINFORCE and actor–critic methods | [Sutton and Barto (2018)](#ref-SB2018a) |
| The policy gradient theorem with function approximation | [Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) |
| ReinforcementLearning.jl | [Tian (2020)](#ref-Tia...2020a) |

The original papers of REINFORCE, PPO and TRPO are listed in the table of algorithms, and each algorithm has its own page under Algorithms, with its update, its inputs and the way the panel implements it.

## References

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-SLAJM2015a"></a>Schulman, J., Levine, S., Abbeel, P., Jordan, M., & Moritz, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-SMSM2000a"></a>Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (2000). Policy Gradient Methods for Reinforcement Learning with Function Approximation. *NeurIPS*. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

<a id="ref-Wil1992a"></a>Williams, R. J. (1992). Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning. *Machine Learning* 8(3-4), 229-256. [doi:10.1007/BF00992696](https://doi.org/10.1007/BF00992696)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md) · [TRPO](trpo.md)
