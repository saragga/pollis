# Interpretation

A trained actor-critic gives a controller, a value map and a training history. Each needs reading with care, as only the controller's returns measure what was asked for.

## How to Read the Printed Results of an Actor-Critic Run

The run prints three things. `final_training_return` is the return of the last training episode, with exploration noise and a random start, so one number says little. `episodes` counts the episodes completed. `greedy_return_from` gives the noise-free return from positions -2, -1, 1 and 2, and is the fairest of the three. Returns add rewards without discount over **Episode Length** steps, so they are not on the same scale as critic values, and they grow with the episode's length. Starts further from the origin cost more by construction.

## How to Read a Return in the Point-Mass Task

A return sums negative rewards, so zero is an unreachable ceiling for any start away from the origin. Most cost falls early, while the mass is far away, so most of a return is set by how fast the mass arrives. A policy that arrives but never quite settles adds a small steady cost across the rest of the episode. Compare returns only at the same **Episode Length**, and judge them against **LQR Benchmark** and not in isolation.

## How to Read the Gap to the Regulator

Linear dynamics and a quadratic reward make the regulator a strong reference, and the gap between it and the learned policy says how much training left on the table. A small gap across all four starts is the sign of a good result on the task. A gap at one start only suggests a lopsided policy. A closeness to the regulator says nothing about a harder task, where no such reference exists. Reinforcement learning earns its place where a model is unknown or the solution has no simple form, as [Sutton and Barto (2018)](#ref-SB2018a) discuss.

## How to Read a Policy Map

**Policy Map** colours the force over position and velocity, with red for pushing right and blue for pushing left. A good solution has a roughly straight boundary through the origin, tilted so that a moving mass starts braking before it arrives. Large solid regions show saturation at the limit. Rough or patchy areas usually sit in regions rarely visited, and carry little meaning. In **SAC**, the map shows the squashed mean, and in **A2C**, the actor's mean, and neither shows the noise that training used.

## How to Read a Value Function

**Value Function** draws the critic's estimate at each state. **A2C** shows V(s). **SAC** and **TD3** show the lower of the twin action values at the policy's action. The best values should sit near the origin, falling away with distance and with motion away from it. Values are discounted, so they look about 1 / (1 − **Discount (gamma)**) steps ahead. In **SAC**, the soft values include the entropy reward, as [Haarnoja, Zhou, Abbeel and Levine (2018)](#ref-HZAL2018a) define them, so they are not plain expected returns. Comparing levels across tabs is therefore unsafe.

## How to Read the Noise in a Stochastic Rollout

**Stochastic Rollout** plots ten paths from position 2 with training noise. The task itself is deterministic, so the spread comes only from the policy. **A2C** shows the width of its single learned noise level, **SAC** its state-dependent width, and **TD3** the fixed noise of 0.1. Paths staying close to zero mean that the policy corrects its own errors. The spread is not a measure of uncertainty about the policy, and it says nothing of how a different seed would behave.

## References

<a id="ref-HZAL2018a"></a>Haarnoja, T., Zhou, A., Abbeel, P. and Levine, S. (2018). Soft actor-critic: off-policy maximum entropy deep reinforcement learning with a stochastic actor. *ICML*. [proceedings.mlr.press/v80/haarnoja18b](https://proceedings.mlr.press/v80/haarnoja18b.html)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
