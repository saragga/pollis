# Momentum

**Momentum**, the heavy-ball method of Polyak (1964), keeps a velocity: v = rho * v + lr * g, and steps x_new = x - v. The **Momentum rho** setting is the fraction of the previous velocity kept at each step, 0.9 by default.

## Why It Helps
Along a direction where the gradient keeps the same sign, the velocity builds up to lr / (1 - rho) times the gradient, ten times the plain step at rho = 0.9, so the iterates speed up along a valley. Across the valley the gradient changes sign from step to step, and those components cancel in the velocity, damping the zigzag of SGD.

## Convergence
On a quadratic with condition number kappa, momentum with well-chosen lr and rho converges at a rate set by the **square root** of kappa, instead of kappa for plain gradient descent: on kappa = 100, about 10 times fewer iterations. The gain is largest on ill-conditioned problems.

## Overshoot
The velocity carries the iterates past the minimum, and they swing back: the **Parameter Trajectory** shows the spiral. Too large a rho with too large a rate makes the oscillation grow; lowering either restores stability. Momentum also lowers the largest stable learning rate compared with SGD.

## With Noise
The velocity averages the noisy gradients over roughly 1 / (1 - rho) steps, but it also multiplies the effective step, so the noise floor is set by the effective rate lr / (1 - rho).

## See Also
- [Nesterov](nesterov.md) · [SGD](sgd.md) · [Decision Guide](decision-guide.md)
