# Gradient Required

Gradient-based methods move along a **descent direction** built from the gradient g, by a step length that a **line search** chooses so that f decreases enough.

## Gradient Descent
**Gradient Descent** moves along -g. It is simple and always a descent direction, but on an elongated valley it **zigzags** across it, and its convergence is linear with a ratio near 1 when the condition number is large. It is in the panel as the baseline the others improve on.

## Conjugate Gradient
**Conjugate Gradient** combines the new gradient with the previous direction, so that successive directions do not undo each other's progress. On a quadratic it reaches the minimum in at most n steps in exact arithmetic; on general smooth f it is much faster than gradient descent, and needs only a few vectors of memory, which suits very large problems.

## BFGS and L-BFGS
**BFGS** builds an approximation of the inverse Hessian from the changes in the gradient between steps, and **L-BFGS** keeps only the last few of those changes instead of an n by n matrix. Both converge superlinearly near a minimum from gradients alone; BFGS is the default up to a few thousand variables, L-BFGS above. The Quasi-Newton Methods panel covers them in depth.

## Bounds: Fminbox
With any finite **Lower Bounds** or **Upper Bounds**, the panel runs the method inside **Fminbox**, which adds a logarithmic barrier that grows near the bounds and solves a sequence of problems with a shrinking barrier. x0 must be strictly inside the box.

## Derivatives
**:forward** differentiates the Julia code of f exactly; **:finite** approximates the gradient by finite differences, with n extra evaluations per gradient and errors of about 1e-8. **Autodiff vs Finite Differences** shows the difference in calls, time and accuracy on your f.

## See Also
- [Gradient Free](gradient-free.md) · [Hessian Required](hessian-required.md) · [Decision Guide](decision-guide.md)
