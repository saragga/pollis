# Interpretation

## The Solution
**Solution Summary** gives the minimiser x*, the minimum f(x*), the number of iterations and the improvement over the start. On a non-convex function, x* is a local minimum: another x0 may give a different one, and a lower f.

## The Gradient Norm
At a minimum the gradient is zero, so the final **gradient norm** measures how close the result is to stationarity. How small is small enough depends on the scale of f and x: compare it with the gradient norm at x0.

## The Rate
Linear convergence with rate r means f(x_k) - f* shrinks by a factor r per iteration: r = 0.5 halves the error each time, r = 0.99 needs about 230 iterations per factor of 10. The rate depends on the condition number kappa: about ((kappa - 1) / (kappa + 1))^2 for gradient descent and (sqrt(kappa) - 1) / (sqrt(kappa) + 1) for conjugate gradient.

## The Cost
Each iteration costs at least one gradient and usually a few function values for the line search. **Compare Line Searches** shows the trade-off: a precise line search (HagerZhang, MoreThuente) takes more calls per iteration and fewer iterations; BackTracking the opposite. Count calls, not iterations, when f is expensive.

## The Hessian Eigenvalues
**Conditioning** reports the curvature in each principal direction at the solution. Positive eigenvalues confirm a minimum; a negative one means a saddle point; a near-zero one means a flat direction in which x* is poorly determined.

## Comparing Methods
**Compare Methods** runs gradient descent, momentum, accelerated (Nesterov) gradient descent, conjugate gradient and BFGS from the same start. BFGS, a quasi-Newton method that builds an approximation to the Hessian, is the reference: on small and medium problems it is usually the fastest, and the first-order methods' gap to it shows how much curvature information would help.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
