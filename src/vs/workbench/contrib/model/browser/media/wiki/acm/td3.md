# TD3

Twin Delayed Deep Deterministic Policy Gradient keeps a deterministic policy and adds three changes aimed at one problem: critics that overrate actions, and actors that exploit the error.

## How the TD3 Tab Learns

Each step takes the actor's action with Gaussian noise of 0.1 added, or a uniform random action during the first 1000 steps. The transition enters a replay buffer, and the critics are updated on a batch of 64. Every second step, the actor takes a step to raise the first critic's value of its actions, and all target networks move towards their originals. The method extends the deterministic algorithm of [Lillicrap, Hunt, Pritzel, Heess, Erez, Tassa, Silver and Wierstra (2015)](#ref-LHPHE2015a), which uses one critic and updates everything at every step.

## What TD3 Optimises

- Target action: a' = clamp(mu'(s') + clamp(**Policy Noise** × noise, −0.5, 0.5), −1, 1)
- Critic target: y = r + gamma min(Q1', Q2')(s', a')
- Critic loss: mean((Q1(s, a) − y)²) + mean((Q2(s, a) − y)²)
- Actor loss: −mean(Q1(s, mu(s)))

Primes mark target networks. The actor's objective contains no entropy term, and the only randomness in training is the two noises. Exploration noise goes into the data, and smoothing noise goes into the target.

## Why TD3 Makes Three Changes

[Fujimoto, van Hoof and Meger (2018)](#ref-FHM2018a) show that overestimation occurs in actor-critic learning, as well as in value methods. Taking the minimum of two critics gives a pessimistic target, and resists errors that build on themselves through bootstrapping. Delaying the actor lets the critics settle before the policy follows them, so the actor chases less noise. Smoothing the target action makes nearby actions share a value, so the actor cannot exploit a narrow peak in a critic's surface. Each part addresses one failure, and each can be removed in the code to see what it contributes.

## Which Inputs the TD3 Tab Uses

**Policy Noise** sets the standard deviation of the target noise, with a clip at 0.5 fixed in the code, and 0 turns smoothing off. **Target Update (tau)** sets how far targets move at each delayed update. **Environment Steps** sets transitions, and **Episode Length**, **Discount (gamma)**, **Hidden Units** and **Random Seed** work as in the other tabs. **Parallel Environments** and **Temperature (alpha)** have no effect. Exploration noise, `delay` and `warmup` are keywords of `train`.

## Where TD3 Is Strong and Weak

A deterministic policy gives one clear action per state, with simple code for evaluation and deployment, and each transition is reused many times. Its weakness is that exploration is a fixed amount of added noise, unrelated to the state or to progress in learning. A task that needs deep exploration may get stuck, and a task needing precision pays for the noise while training. Actions must be continuous, since the gradient passes through the action into the critic.

## What to Compare TD3 With

**SAC** has the same structure with a stochastic policy, so differences mainly reflect how each explores. **Value Estimate Trend** is the direct check of TD3's aim, and the code can be edited to use one critic or a `delay` of 1 for a before and after. **LQR Benchmark** says how far the deterministic policy stands from the classical answer. Three seeds through **Seed Stability** should precede any verdict on which change helped.

## References

<a id="ref-FHM2018a"></a>Fujimoto, S., van Hoof, H. and Meger, D. (2018). Addressing function approximation error in actor-critic methods. *ICML*. [proceedings.mlr.press/v80/fujimoto18a](https://proceedings.mlr.press/v80/fujimoto18a.html)

<a id="ref-LHPHE2015a"></a>Lillicrap, T. P., Hunt, J. J., Pritzel, A., Heess, N., Erez, T., Tassa, Y., Silver, D. and Wierstra, D. (2015). Continuous control with deep reinforcement learning. [arXiv:1509.02971](https://arxiv.org/abs/1509.02971)

## See Also

- [Factsheet](factsheet.md) · [A2C](a2c.md) · [SAC](sac.md) · [Diagnostics](diagnostics.md)
