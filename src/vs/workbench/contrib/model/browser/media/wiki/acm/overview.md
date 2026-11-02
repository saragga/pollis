# Overview

Actor-critic methods learn a controller from experience by training two networks together. The panel trains three of them on one small control task, so their behaviour can be compared with each other and with a known good answer.

## What Actor-Critic Methods Do

An actor is a policy, which chooses an action in each state. A critic estimates how good a state or an action is. The critic learns from observed rewards, and the actor changes in the direction that the critic favours. Using returns alone to train a policy gives noisy updates, and a pure value method must search over actions at every step, which is hard when actions are continuous. Pairing the two networks eases both problems. [Sutton and Barto (2018)](#ref-SB2018a) give the standard account, and [Sutton, McAllester, Singh and Mansour (2000)](#ref-SMSM2000a) give the policy gradient result behind it.

## Which Task the Actor-Critic Methods Panel Trains On

Each tab pushes a unit mass along a line to the origin. The state holds position and velocity, and the action is a force limited to the range from -1 to 1. An episode starts at rest, from a position drawn uniformly between -2 and 2, and lasts **Episode Length** steps of 0.1 time units. The reward at each step is -(position² + 0.1 velocity² + 0.01 force²), so a return is never positive and closer to zero is better. No state ends an episode early. Linear dynamics and a quadratic reward mean that a classical solution exists, which gives **LQR Benchmark** its reference.

## How A2C, SAC and TD3 Differ

| Tab | Policy | Data | Critic | Exploration |
|---|---|---|---|---|
| **A2C** | Gaussian | On-policy, from parallel environments | One state value | Learned noise level |
| **SAC** | Squashed Gaussian | Off-policy, from a replay buffer | Twin action values | Policy's own randomness, rewarded through entropy |
| **TD3** | Deterministic | Off-policy, from a replay buffer | Twin action values | Added Gaussian noise |

## Where Each Algorithm in the Panel Comes From

**A2C** is the synchronous form of the advantage method of [Mnih, Puigdomènech Badia, Mirza, Graves, Lillicrap, Harley, Silver and Kavukcuoglu (2016)](#ref-MBMGL...2016a). **SAC** follows [Haarnoja, Zhou, Abbeel and Levine (2018)](#ref-HZAL2018a), who add policy entropy to the objective. **TD3** comes from [Fujimoto, van Hoof and Meger (2018)](#ref-FHM2018a), who target the overestimation of values in deterministic actor-critic learning. Later work changed some details of each, so a tab may differ from the first paper.

## What Code the Actor-Critic Methods Panel Generates

All three tabs write out their networks and updates directly in `Flux.jl`, so every step of an algorithm can be read and changed. `ReinforcementLearning.jl`, the package of [Tian (2020)](#ref-Tia...2020a), offers ready-made agents and environments and is the panel's named toolkit for larger work, but the generated code does not load it. `Plots.jl` draws the Next Steps. A run prints the last training return, the number of episodes, and the return of the noise-free policy from four starting positions.

## A Common Workflow for Comparing Actor-Critic Methods

1. Train with a tab's defaults and read **Learning Curve**.
2. Check training health with **Critic Loss** and **Value Estimate Trend**.
3. Measure the result against the classical answer with **LQR Benchmark**.
4. Repeat with **Seed Stability**, as one good seed proves little.
5. Inspect behaviour with **Greedy Rollout** and **Policy Map**.
6. Change one input and repeat, or move to another tab with the same seed and step budget.

## References

<a id="ref-FHM2018a"></a>Fujimoto, S., van Hoof, H. and Meger, D. (2018). Addressing function approximation error in actor-critic methods. *ICML*. [proceedings.mlr.press/v80/fujimoto18a](https://proceedings.mlr.press/v80/fujimoto18a.html)

<a id="ref-HZAL2018a"></a>Haarnoja, T., Zhou, A., Abbeel, P. and Levine, S. (2018). Soft actor-critic: off-policy maximum entropy deep reinforcement learning with a stochastic actor. *ICML*. [proceedings.mlr.press/v80/haarnoja18b](https://proceedings.mlr.press/v80/haarnoja18b.html)

<a id="ref-MBMGL...2016a"></a>Mnih, V., Puigdomènech Badia, A., Mirza, M., Graves, A., Lillicrap, T., Harley, T., Silver, D. and Kavukcuoglu, K. (2016). Asynchronous methods for deep reinforcement learning. *ICML*. [proceedings.mlr.press/v48/mniha16](https://proceedings.mlr.press/v48/mniha16.html)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-SMSM2000a"></a>Sutton, R. S., McAllester, D., Singh, S. and Mansour, Y. (2000). Policy gradient methods for reinforcement learning with function approximation. *NeurIPS*. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: a reinforcement learning package for the Julia programming language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

## See Also

- [Factsheet](factsheet.md) · [A2C](a2c.md) · [SAC](sac.md) · [TD3](td3.md) · [Decision Guide](decision-guide.md)
