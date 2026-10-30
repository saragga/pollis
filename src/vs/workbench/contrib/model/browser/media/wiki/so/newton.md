# Newton

**Newton's method** for minimisation steps to the minimum of the local quadratic model: it solves H d = -g for the step d, where g and H are the gradient and Hessian at the current point. In Optim.jl, Newton() adds two safeguards.

## Modified Hessian
Where H is not positive definite the pure step may point uphill. Optim then **modifies H** (by default, a modified Cholesky factorisation that adds to the diagonal until the matrix is positive definite), so that d is always a descent direction. Far from the minimum this turns the step into something between a Newton step and a scaled gradient step.

## Line Search
A **line search** along d (Hager-Zhang by default) then chooses how far to go, accepting the full step when it reduces f enough. Near the minimum the full step is always accepted, and the method converges **quadratically**: the error at the next step is proportional to the square of the current one.

## Cost per Iteration
Each iteration computes the Hessian, n forward-mode passes with ForwardDiff, and factorises it, about n^3 / 3 operations. For small n the iterations are cheap and few; for large n the factorisation dominates.

## Behaviour on Rosenbrock
From (-1.2, 1), Newton follows the curved valley in about twenty iterations, and the **Convergence Trace** shows the final plunge. From some random starts the modified Hessian and line search take small, inefficient steps, which is what **Start Robustness** measures against the trust region.

## See Also
- [Newton Trust Region](newton-trust-region.md) · [Truncated Newton](truncated-newton.md) · [Decision Guide](decision-guide.md)
