# Diagnostics

## Did It Converge?
The **Convergence Check** reports whether Optim's convergence test was met, the number of iterations, function calls and gradient calls, and the final gradient norm. Optim stops when the gradient norm falls below its tolerance, when f or x stops changing, or when the iteration limit is reached. **Reaching the limit is not convergence**: raise the limit, or improve the method.

## The Convergence Trace
The **Convergence Trace** plots f(x_k) - f* and the gradient norm against the iteration on a log scale. A **straight line** is linear convergence, the expected behaviour of both methods; its slope is the rate, reported by the Convergence Check. A **shallow slope** means poor conditioning. A **plateau** means a flat region or a saddle. **Noise** at the bottom means the gradient's own error (finite differences) has been reached.

## The Path
For two variables, **Contour + Path** draws the iterates on the contours of f. Gradient descent on a long narrow valley zig-zags from wall to wall, each step at right angles to the last; conjugate gradient moves along the valley.

## The Gradient
The **Gradient Check** compares finite-difference and automatic-differentiation gradients at x0 and at the solution. They should agree to several digits. A large difference means a bug in the function (a branch, a non-differentiable point) or a finite-difference step that is too large or too small.

## Conditioning
**Conditioning** gives the eigenvalues of the Hessian at the solution. Their ratio, the condition number, predicts the speed: **Iteration Estimate** turns it into the textbook number of iterations. Rescaling the variables so that their curvatures are similar is often the most effective fix.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Convergence flag | Converged on the gradient tolerance | Iteration limit reached |
| Trace | Steep straight line | Shallow slope, plateau, noisy floor |
| Path (2D) | Moves along the valley | Zig-zags across it |
| Gradient check | AD and finite differences agree | Large difference |
| Condition number | Small | Large: rescale, or use CG or BFGS |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
