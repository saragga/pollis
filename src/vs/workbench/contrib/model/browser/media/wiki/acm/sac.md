# SAC

Soft Actor-Critic rewards the policy both for reward and for staying random. It reuses past data from a replay buffer, and its exploration comes from the objective itself.

## How the SAC Tab Learns

Each step adds one transition to a replay buffer, and then one update draws a batch of 64 from all the data so far. The first 1000 actions are uniform random, to fill the buffer with variety. The critics move first, towards a target built from the slowly moving target networks. The actor then moves to prefer actions the critics rate highly, while keeping its entropy. [Haarnoja, Zhou, Abbeel and Levine (2018)](#ref-HZAL2018a) introduced the method. Their first version also trained a separate state-value network, which the tab omits, as later versions do.

## What SAC Optimises

- Objective: sum over steps of discounted (reward − alpha log pi(a | s))
- Action: a = tanh(mu(s) + sd(s) × noise), with log sd clamped to the range from -5 to 2
- Critic target: y = r + gamma (min(Q1', Q2')(s', a') − alpha log pi(a' | s'))
- Actor loss: mean(alpha log pi(a | s) − min(Q1, Q2)(s, a))

The log-density includes a correction for the tanh, so that it stays a true density on the range from -1 to 1. Noise is passed through the network's output, which lets the gradient of the critic reach the actor. The minimum of the two critics counters overestimation.

## What the Temperature Controls in SAC

**Temperature (alpha)** prices entropy in units of reward. A large value gives a wide policy that explores but performs below its best. A small value gives an almost deterministic one, and 0 removes the entropy term altogether. Reward scale matters, as alpha is relative to the size of the reward, so a change in the task's reward calls for a new alpha. The tab holds alpha fixed. [Haarnoja, Zhou, Hartikainen, Tucker, Ha, Tan, Kumar, Zhu, Gupta, Abbeel and Levine (2018)](#ref-HZHTH...2018a) describe an automatic adjustment against a target entropy, which would have to be added to the code.

## Which Inputs the SAC Tab Uses

**Temperature (alpha)** weighs entropy, and **Target Update (tau)** sets how quickly target critics follow the critics, with theta_target = tau theta + (1 − tau) theta_target. **Environment Steps** sets both the transitions and, roughly, the updates. **Episode Length**, **Discount (gamma)**, **Hidden Units** and **Random Seed** work as in the other tabs, with two relu layers per network. **Parallel Environments** and **Policy Noise** are not used. The buffer holds every transition and discards none, so its memory grows with **Environment Steps**.

## Where SAC Is Strong and Weak

Off-policy reuse gives good sample use, so it suits a task where each step is costly. The stochastic policy keeps exploring without a noise schedule, and the state-dependent noise can be narrow where precision pays. The price is more networks and more computation per step, and sensitivity to alpha when the reward scale is unfamiliar. Actions are continuous by design, so a discrete task calls for a variant or another method. At high update counts, a stale buffer can also weigh the old policy's data heavily.

## What to Compare SAC With

**TD3** is the natural comparison, as it shares the twin critics and the replay buffer and differs in the deterministic policy. Evaluate both with **Greedy Rollout** and **LQR Benchmark**, which use the noise-free action. **Stochastic Rollout** shows the width of the trained policy. Setting **Temperature (alpha)** to 0 removes the entropy reward while keeping the rest, which isolates what the term contributes.

## References

<a id="ref-HZAL2018a"></a>Haarnoja, T., Zhou, A., Abbeel, P. and Levine, S. (2018). Soft actor-critic: off-policy maximum entropy deep reinforcement learning with a stochastic actor. *ICML*. [proceedings.mlr.press/v80/haarnoja18b](https://proceedings.mlr.press/v80/haarnoja18b.html)

<a id="ref-HZHTH...2018a"></a>Haarnoja, T., Zhou, A., Hartikainen, K., Tucker, G., Ha, S., Tan, J., Kumar, V., Zhu, H., Gupta, A., Abbeel, P. and Levine, S. (2018). Soft actor-critic algorithms and applications. [arXiv:1812.05905](https://arxiv.org/abs/1812.05905)

## See Also

- [Factsheet](factsheet.md) · [A2C](a2c.md) · [TD3](td3.md) · [Interpretation](interpretation.md)
