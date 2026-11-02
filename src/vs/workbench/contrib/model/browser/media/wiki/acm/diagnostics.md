# Diagnostics

Deep reinforcement learning fails quietly, as a network always returns a number. The checks in the panel look at training health, at the outcome against a reference, and at repeatability.

## How to Read a Learning Curve for Problems

**Learning Curve** plots each training episode's return against environment steps. A healthy curve rises and then flattens near zero. In **SAC** and **TD3**, the first 1000 steps are random, so the early part says nothing about learning. Sudden collapses after a good stretch suggest instability, often from a critic that has gone wrong. A flat curve from the start suggests no learning at all, or too few steps. Training returns include exploration noise and random starts, so the curve is jagged and understates the noise-free policy.

## How to Spot Overestimation in a Critic

**Value Estimate Trend** plots the mean critic estimate on training batches, along with a reference line: episode return / **Episode Length** / (1 − **Discount (gamma)**). A steady climb above the reference suggests overestimation, the failure studied by [Fujimoto, van Hoof and Meger (2018)](#ref-FHM2018a). The line is a rough level, since it pretends that the average reward continues for ever, whereas here costs fall as the mass settles. Read the gap's direction and trend, and not its size. Critics in **SAC** also carry the entropy reward, which shifts their level.

## How to Read Critic and Actor Losses

**Critic Loss** plots the mean squared error between critic and target, on a log scale, with a moving average of 100 updates. Falling and settling is healthy, and steady growth is a warning. Targets move during training, so the loss need not fall all the way. **Actor Loss** has a different meaning per tab. In **TD3** it is minus the critic's value, and in **SAC** it adds the entropy term, so a fall means that the critic rates the policy higher. In **A2C** the advantage is normalised, so the value hovers and does not show progress. Neither loss replaces a measure of return.

## How to Check a Policy Against the Classical Answer

**LQR Benchmark** runs the learned policy and a regulator from the four starts, noise-free, and tabulates undiscounted returns. Regulator gains come from a discounted Riccati iteration, with force clipped to the limit. A learned return far below the regulator's means that training is unfinished or failed. A learned return slightly above it is possible, since a linear rule that is clipped is not exactly optimal under a bound, and since the gains target a discounted criterion. The task is symmetric, so returns from a start and from its mirror image should be similar, and a large gap reveals a lopsided policy.

## How to Check Repeatability Across Seeds

**Seed Stability** trains again with seeds 1, 2 and 3 and overlays the curves, ignoring **Random Seed** and taking three times as long. A wide spread means that a single run says little. [Henderson, Islam, Bachman, Pineau, Precup and Meger (2018)](#ref-HIBPP...2018a) show how much reported deep reinforcement learning results vary with seeds and with implementation choices. Three seeds reveal only gross instability. A claim that one setting beats another needs more seeds, which means widening the range in the loop.

## How to Check Behaviour Directly

**Greedy Rollout** shows the path from position 2. The position should reach zero and stay there, with the velocity settling too. A force that chatters between its limits, or a position that sits away from zero, each point to a flaw that a return alone may hide. **Stochastic Rollout** draws ten noisy paths from the same point, using a fixed generator, and shows whether the training noise would disturb the goal. **Policy Map** should show a boundary through the origin, with force opposing position and velocity.

## References

<a id="ref-FHM2018a"></a>Fujimoto, S., van Hoof, H. and Meger, D. (2018). Addressing function approximation error in actor-critic methods. *ICML*. [proceedings.mlr.press/v80/fujimoto18a](https://proceedings.mlr.press/v80/fujimoto18a.html)

<a id="ref-HIBPP...2018a"></a>Henderson, P., Islam, R., Bachman, P., Pineau, J., Precup, D. and Meger, D. (2018). Deep reinforcement learning that matters. *Proceedings of the AAAI Conference on Artificial Intelligence* 32(1). [doi:10.1609/aaai.v32i1.11694](https://doi.org/10.1609/aaai.v32i1.11694)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
