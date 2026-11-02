# Decision Guide

The choice among actor-critic methods turns mainly on what a sample costs and on how the policy should explore. A first question is whether learning is needed at all.

## Which Actor-Critic Tab Fits a Task

| Situation | Tab | Why |
|---|---|---|
| Simulation is cheap and simple code is valued | **A2C** | No buffer or targets, and fresh data for each update |
| Samples are costly and exploration needs little tuning | **SAC** | Reuses data, and the objective handles exploration |
| Samples are costly and a deterministic policy is wanted | **TD3** | Reuses data, with one clear action per state |
| Comparing the off-policy pair | **SAC** and **TD3** | Same structure, different exploration |

## When to Use Learning at All

A known model with a simple form usually calls for classical control, and the task in the panel is an example: the regulator solves it directly. Learning earns its cost when dynamics are unknown, when the reward has no convenient form, or when a simulator exists but no solution does. Actions that come from a small discrete set suit value-based methods, as [Sutton and Barto (2018)](#ref-SB2018a) explain. Use the panel to learn how the methods behave, and then consider `ReinforcementLearning.jl` for larger environments.

## When to Choose On-Policy or Off-Policy Learning

Choose on-policy learning when samples are nearly free, or when the old data would mislead because the environment changes. Choose off-policy learning when samples are expensive, for instance on physical hardware or a slow simulator. Off-policy methods cost more computation per sample, through the critics, the buffer and an update per step, so the comparison must count what is scarce. A budget in transitions favours **SAC** and **TD3**. A budget in computing time may not.

## How to Choose Stochastic or Deterministic Exploration

Choose the stochastic **SAC** when a suitable noise level is unknown, or when it should vary by state. [Haarnoja, Zhou, Abbeel and Levine (2018)](#ref-HZAL2018a) describe the formulation as stable. Choose the deterministic **TD3** when a known noise level will do and the fewer moving parts are welcome. Note that either way, the policy is run without noise when evaluated in the panel, so **Greedy Rollout** compares like with like.

## How to Set the Main Inputs

Change one input at a time, and hold **Random Seed** fixed while comparing, then vary seeds to confirm.

- **Environment Steps**: raise it when the curve is still rising at the end.
- **Discount (gamma)**: 1 / (1 − gamma) steps should cover the time needed to reach the goal.
- **Target Update (tau)**: lower it when values become unstable, at the cost of slower learning.
- **Temperature (alpha)**: lower it when the policy remains too noisy at the end, and raise it when learning settles early on a poor result.
- **Policy Noise**: keep it small relative to the force limit of 1.
- **Parallel Environments**: raise it when curves are too noisy.

## What to Report from an Actor-Critic Comparison

Report the number of seeds, the step budget in transitions, and evaluation returns without exploration noise. [Henderson, Islam, Bachman, Pineau, Precup and Meger (2018)](#ref-HIBPP2018a) offer guidelines for more reproducible results, as small implementation differences can matter. State hyperparameters, including those fixed in the code. A claim that one method wins needs a spread across seeds, and holds only for the task and the settings used.

## References

<a id="ref-HZAL2018a"></a>Haarnoja, T., Zhou, A., Abbeel, P. and Levine, S. (2018). Soft actor-critic: off-policy maximum entropy deep reinforcement learning with a stochastic actor. *ICML*. [proceedings.mlr.press/v80/haarnoja18b](https://proceedings.mlr.press/v80/haarnoja18b.html)

<a id="ref-HIBPP2018a"></a>Henderson, P., Islam, R., Bachman, P., Pineau, J., Precup, D. and Meger, D. (2018). Deep reinforcement learning that matters. *Proceedings of the AAAI Conference on Artificial Intelligence* 32(1). [doi:10.1609/aaai.v32i1.11694](https://doi.org/10.1609/aaai.v32i1.11694)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [A2C](a2c.md) · [SAC](sac.md) · [TD3](td3.md)
