# A2C

Advantage Actor-Critic learns from short, fresh rollouts, gathered by many copies of the task stepped together. It is simple and cheap per update, and it spends many samples.

## How the A2C Tab Learns

**Parallel Environments** copies of the task are stepped together for five steps, using the current policy. The critic's value of the last state closes each rollout, and the targets are worked out backwards from there. All the data then enter a single gradient step and are thrown away. The tab's form is the synchronous version of the asynchronous workers of [Mnih, Puigdomènech Badia, Mirza, Graves, Lillicrap, Harley, Silver and Kavukcuoglu (2016)](#ref-MBMGL...2016a). The environments run one after another in a loop, so more of them do not save computing time here. Their value is in the variety of each batch.

## What A2C Optimises

- Rollout target: R_k = r_k + gamma R_(k+1), with the last R taken from V(final state)
- Advantage: A = R − V(s), then rescaled to mean 0 and standard deviation 1 across the batch
- Log-density: log pi(a | s) = −0.5 ((a − mu(s)) / sd)² − log sd, dropping a constant
- Combined loss: −mean(log pi × A) − 0.001 log sd + 0.5 mean((R − V(s))²)

Actor and critic share one optimiser and one loss. The middle term pays a little for a wider policy, and so slows the collapse of exploration. A policy gradient needs only a score and a weight, as [Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) show, and a better weight lowers variance without moving the gradient's aim.

## Why the A2C Tab Uses Short Rollouts

Rollout length trades bias against variance. A long rollout relies on many sampled rewards, which are unbiased but noisy. A short one leans on the critic's estimate, which is steady but wrong while the critic is still poor. [Schulman, Moritz, Levine, Jordan and Abbeel (2015)](#ref-SMLJA2015a) study that trade-off as a family of advantage estimators. The tab fixes `nstep = 5` in the signature of `train`. Rollouts also stop at the end of an episode, so the last one in an episode can be shorter if **Episode Length** is not a multiple of five. All copies then restart together.

## Which Inputs the A2C Tab Uses

**Parallel Environments** sets the batch width, and more copies lower the variance of each update. **Environment Steps** counts per copy, so the total of transitions is the product of the two, and the x axis of **Learning Curve** counts the total. **Discount (gamma)** sets the weight on future rewards. **Hidden Units** sizes one tanh hidden layer in each network. **Random Seed** sets starts, noise and weights. **Temperature (alpha)**, **Target Update (tau)** and **Policy Noise** are not used by this tab.

## Where A2C Is Strong and Weak

A2C has no replay buffer and no target networks, so the code is short, the memory is small and each update is quick. It suits a simulator that is cheap to run. Its weakness is sample use, since each transition teaches one update. The noise level in the tab is a single learned number, shared by all states, so the policy cannot be careful in one state and bold in another. Action samples beyond the force limit are clamped by the task, while the log-density ignores the clamp, which adds a small bias near the limits.

## What to Compare A2C With

**SAC** and **TD3** reuse each transition many times and usually need far fewer. Compare them on transitions and not on **Environment Steps**, since the same input gives **A2C** more data by a factor of **Parallel Environments**. **LQR Benchmark** gives a target common to all three tabs. Try **Parallel Environments** of 1 to see how variance changes the curve, and repeat with **Seed Stability** to judge whether a change is real.

## References

<a id="ref-MBMGL...2016a"></a>Mnih, V., Puigdomènech Badia, A., Mirza, M., Graves, A., Lillicrap, T., Harley, T., Silver, D. and Kavukcuoglu, K. (2016). Asynchronous methods for deep reinforcement learning. *ICML*. [proceedings.mlr.press/v48/mniha16](https://proceedings.mlr.press/v48/mniha16.html)

<a id="ref-SMLJA2015a"></a>Schulman, J., Moritz, P., Levine, S., Jordan, M. and Abbeel, P. (2015). High-dimensional continuous control using generalized advantage estimation. [arXiv:1506.02438](https://arxiv.org/abs/1506.02438)

<a id="ref-SMSM2000a"></a>Sutton, R. S., McAllester, D., Singh, S. and Mansour, Y. (2000). Policy gradient methods for reinforcement learning with function approximation. *NeurIPS*. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)

## See Also

- [Factsheet](factsheet.md) · [SAC](sac.md) · [TD3](td3.md) · [Diagnostics](diagnostics.md)
