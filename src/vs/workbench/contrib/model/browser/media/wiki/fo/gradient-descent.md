# Gradient Descent

Gradient descent, or **steepest descent**, moves from x_k in the direction in which f decreases fastest:

    d_k     = -grad f(x_k)
    x_{k+1} = x_k + alpha_k d_k

with the step length alpha_k chosen by a line search.

## Why It Works
Near x_k, f is close to its linear approximation f(x_k) + grad f(x_k)' (x - x_k), which decreases fastest along minus the gradient. A small enough step therefore always decreases f, unless the gradient is zero. With a line search that satisfies the **Wolfe conditions** (a sufficient decrease of f, and a sufficient flattening of the slope along d_k) the method converges to a stationary point.

## Why It Zig-Zags
With an exact line search, each step ends where the new gradient is at right angles to the old direction, so successive steps are perpendicular. On a function whose contours are long thin ellipses, the gradient points across the valley rather than along it, and the iterates bounce from wall to wall, making slow progress along the floor. The worse the **condition number** kappa, the ratio of the largest to the smallest curvature, the slower the progress: the error shrinks by about ((kappa - 1) / (kappa + 1))^2 per iteration.

## Momentum and Acceleration
Two variants, compared in **Compare Methods**, reduce the zig-zag by remembering the previous step. **Momentum** (the heavy-ball method) adds a fraction of the last step to the new one. **Accelerated** (Nesterov) gradient descent evaluates the gradient at a point extrapolated along the last step; on convex functions it reaches the best rate possible for a method that uses only gradients.

## In Optim.jl

    optimize(f, x0, GradientDescent(linesearch = HagerZhang()); autodiff = :forward)

## See Also
- [Conjugate Gradient](conjugate-gradient.md) · [Diagnostics](diagnostics.md) · [Overview](overview.md)
