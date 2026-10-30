# Assumptions

## A Minimum Exists and Is Reachable
f must be **bounded below** along the path, and have a minimum the iterates can reach from x0. An objective that decreases without limit in some direction (a likelihood with perfect separation, an unregularised loss) makes every method diverge or stop at the iteration limit; it needs reformulating, not another algorithm.

## Smoothness, for the Derivative Methods
Gradient Required methods assume f is **continuously differentiable**; Hessian Required methods, **twice** continuously differentiable, with a Lipschitz-continuous Hessian near the solution for their fast convergence. Kinks (absolute values, maxima, if-branches) and jumps break that picture: the line search may stall, and a minimum that sits on a kink is not where the gradient is zero. Gradient Free methods need only function values, but converge more reliably on continuous f too.

## Positive Curvature at the Minimum
Fast convergence, and the Hessian check, assume a minimum where the Hessian is **positive definite**. At a degenerate minimum, a flat valley or a ridge of equally good points, all methods slow down and the minimiser is poorly determined in the flat directions.

## Accurate Derivatives
The derivative methods trust the gradient and the Hessian. Automatic differentiation (:forward) gives them to machine precision. Finite differences (:finite) carry errors of about 1e-8 relative to the size of the gradient, which limits the accuracy of the solution and can mislead the line search near the minimum.

## Scaling
Variables on very different scales (one in thousands, another in thousandths) make the early steps poor for every class: the simplex, the first gradient step and the line search all assume the variables are comparable. Rescaling them to similar magnitudes helps.

## Box Bounds
Bounds are handled by Fminbox (gradient methods) or IPNewton, both **interior** methods: x0 must lie strictly inside the box. A minimum on a bound is approached from inside, and there the gradient is not zero.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
