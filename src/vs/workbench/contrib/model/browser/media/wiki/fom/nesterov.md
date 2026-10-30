# Nesterov

**Nesterov** momentum, from Nesterov's accelerated gradient method (1983), is momentum with a correction: the gradient is taken at the **look-ahead point** the velocity is about to carry the iterate to, not at the current point. If the velocity is about to overshoot, the look-ahead gradient already points back, and the step is corrected before the overshoot happens.

## The Update
In its usual form, v = rho * v + lr * g(x - rho * v), and x_new = x - v. Optimisers.jl implements an equivalent rearrangement that needs the gradient at the current point only, so the panel's training loop is the same as for the other rules. **Momentum rho** plays the same role as in Momentum.

## Convergence
For smooth convex functions, Nesterov's method is **accelerated**: the error after k steps falls like 1/k^2, against 1/k for gradient descent, which is the best rate any first-order method can achieve on that class. On strongly convex quadratics it shares momentum's dependence on the square root of the condition number, with less oscillation.

## In Practice
Nesterov usually oscillates less than plain momentum at the same rho, and tolerates slightly larger learning rates. With noisy gradients the advantage of acceleration shrinks: noise, not curvature, then limits progress, and both momentum methods settle into a similar noise floor.

## See Also
- [Momentum](momentum.md) · [SGD](sgd.md) · [Decision Guide](decision-guide.md)
