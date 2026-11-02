# Assumptions

Actor-critic methods assume things about the task and about the training data. A violation seldom raises an error, and usually shows up as a poor or an unstable policy.

## Why the State Must Hold What the Future Depends On

All three tabs treat the task as a Markov decision process: the next state and the reward depend only on the current state and action. Position and velocity satisfy that exactly here, since the code computes the next state from them. [Sutton and Barto (2018)](#ref-SB2018a) set out that framework. A real task often breaks it, for instance when a sensor gives position alone or when a load changes unseen. The networks here have no memory, so hidden information becomes noise that the critic cannot explain.

## What the Reward Assumes About the Goal

Training optimises the reward as written, and no other goal. Here the weights 1, 0.1 and 0.01 say that distance matters most and that force is cheap. A policy can score well and still do something a user dislikes, such as pushing hard at all times. Scale matters as well, since **Temperature (alpha)** in **SAC** is measured in reward units, and large rewards produce large targets for the critics. A reward changed in the code therefore calls for fresh settings, and **LQR Benchmark** then needs the same weights in `Qm` and `Rm`.

## How Fixed-Length Episodes Are Treated

Episodes end only because time runs out, so the task treats the end as a cut and not as a true terminal state. **SAC** and **TD3** apply the discount to the next state's value for every stored transition. **A2C** closes each rollout with the critic's value, including the one that ends an episode. The value of a state therefore does not depend on the clock, and the state need not contain time. A task with a real terminal state needs a done flag that removes the next-state value, which the code does not have.

## What Exploration Coverage the Critics Depend On

A critic is reliable only in regions that training has visited. Every episode starts at rest, in a position between -2 and 2, and speeds stay modest under force limited to 1. **Policy Map** and **Value Function** draw velocities from -2 to 2 and so include states rarely or never seen, such as a fast mass moving away from the origin at the edge. Values there are extrapolations. A change in the starting range after training is a change of task, and the policy has no guarantee there.

## What Off-Policy and On-Policy Data Assume

**A2C** needs samples from the current policy, so each batch is used once. Its copies of the task share a clock, so a batch at one moment holds only early or only late states, and the batches are correlated in time. **SAC** and **TD3** learn action values for the current policy from older data, a reuse that is valid in principle for an action value with a one-step target. Reuse needs coverage, though, and [Fujimoto, van Hoof and Meger (2018)](#ref-FHM2018a) show that errors from function approximation can still accumulate.

## What the Hidden Sizes and Step Budget Assume

**Hidden Units** must be large enough to express the policy and values, and the task's solution is simple. **Episode Length** must leave time to act: at a force of at most 1, stopping at the origin from a distance of 2 takes at least about 28 steps of 0.1. **Discount (gamma)** of 0.99 looks about 100 steps ahead. Results for one setting do not carry over to a harder task, where the same network or budget may fall short.

## References

<a id="ref-FHM2018a"></a>Fujimoto, S., van Hoof, H. and Meger, D. (2018). Addressing function approximation error in actor-critic methods. *ICML*. [proceedings.mlr.press/v80/fujimoto18a](https://proceedings.mlr.press/v80/fujimoto18a.html)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
