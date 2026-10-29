# Assumptions

## Smoothness
f should be **twice continuously differentiable** near the solution. The convergence theory assumes a Lipschitz-continuous Hessian; kinks or discontinuities in f or its gradient break the secant picture, and the line search may stall. Gradients that are only defined almost everywhere (absolute values, maxima, if-branches) may work away from the kink but not at a minimum that sits on it.

## A Local Minimum With Positive Curvature
Superlinear convergence holds near a minimiser where the gradient is zero and the Hessian is **positive definite**. At a degenerate minimum (a flat valley, a singular Hessian) convergence slows to linear or worse, and the minimiser is poorly determined in the flat directions.

## Boundedness Below
f must be bounded below along the path, or the iterates diverge. An objective that decreases without limit in some direction (a likelihood with separation, an unregularised loss) needs reformulating, not a better solver.

## The Curvature Condition
The BFGS update keeps H positive definite only if **s'y > 0**: the gradient increases along the step. On a convex function this always holds; on a non-convex one it is guaranteed by a line search that enforces the **Wolfe conditions** (HagerZhang, MoreThuente, StrongWolfe). BackTracking enforces only sufficient decrease, and Optim skips the BFGS update when s'y is not positive.

## Accurate Gradients
The method trusts the gradient. Automatic differentiation gives it to machine precision; finite differences (forward differences in the panel) have errors of about the square root of machine precision, 1e-8, relative to the scale of the gradient, which limits the accuracy of the solution and can mislead the line search near the minimum. A hand-coded gradient with a mistake converges to the wrong point or fails.

## Scaling
The first step uses the identity as the inverse Hessian (BFGS) or a scaled identity (L-BFGS): variables on very different scales make the early iterations poor and can upset the line search. Rescaling the variables to similar magnitudes helps.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
