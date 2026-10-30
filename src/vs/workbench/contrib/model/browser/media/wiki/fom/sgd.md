# SGD

**Stochastic gradient descent** takes the plainest step: x_new = x - lr * g, where g is the gradient, or in the stochastic setting an unbiased noisy estimate of it. In Optimisers.jl the rule is Descent.

## Stability
On a smooth loss with largest curvature L, the step is stable for **lr < 2 / L**. Along a direction of curvature c, the error is multiplied by (1 - lr * c) each step, so the slowest direction, the smallest curvature, decides the speed: the convergence is linear, with a ratio close to 1 when the **condition number**, the largest over the smallest curvature, is large. On an elongated valley SGD zigzags across it and creeps along it.

## Noise
With noisy gradients and a constant rate the iterates do not converge: near the minimum they fluctuate in a cloud whose spread grows with the rate and the noise. Robbins and Monro (1951) showed that a decreasing rate, with steps that sum to infinity while their squares do not (for example lr proportional to 1/t), converges to the minimiser. In practice a constant rate followed by a decay, or **Iterate Averaging**, does the same job.

## Why It Is Still Used
SGD has no state and costs one gradient per step. With momentum and a tuned schedule it often reaches solutions that generalise as well as or better than adaptive rules in deep learning, and its behaviour is the easiest to understand.

## See Also
- [Momentum](momentum.md) · [Adam](adam.md) · [Decision Guide](decision-guide.md)
