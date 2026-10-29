# Assumptions

## The Function
- **Differentiable.** The gradient must exist at the iterates. A kink (an absolute value, a maximum) makes the gradient jump, the line search fail and the method stall near it; use a smooth approximation or a proximal method.
- **Lipschitz-continuous gradient.** The gradient does not change too fast: there is an L with |grad f(x) - grad f(y)| <= L |x - y|. This is what makes a step of the right length always decrease f.
- **Bounded below**, with a minimum to find. If f decreases without limit, the iterates run away.
- **Unconstrained.** x can take any value; bounds must be handled by a change of variables (x = exp(z) for a positive x) or by another method.

## Convergence Guarantees
- On a **convex** function, both methods converge to the global minimum.
- On a **strongly convex** function with condition number kappa (the ratio of the largest to the smallest curvature), gradient descent reduces f(x) - f* by a factor of about ((kappa - 1) / (kappa + 1))^2 per iteration with exact line search; conjugate gradient by about (sqrt(kappa) - 1) / (sqrt(kappa) + 1), much faster when kappa is large.
- On a **non-convex** function, they converge to a stationary point (a gradient of zero), usually a local minimum, which one depending on x0.

## The Gradient
- **Automatic differentiation** (ForwardDiff) gives exact gradients for code written in Julia, at a cost proportional to the number of variables in forward mode.
- **Finite differences** need only f, but are inexact: their error limits how small the gradient norm can get, so a tight tolerance may never be met.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
