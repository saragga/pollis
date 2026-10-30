# Diagnostics

## Convergence Trace
The **Convergence Trace** plots f(x_k) - f*, the gap to the minimum, on a log scale. Newton-type methods show a slow or irregular start, while they are far from the minimum, then a **plunge**: the gap falls from 1e-2 to 1e-4 to 1e-8 to machine precision in a few steps. A trace that falls by a steady factor instead is linear convergence: a singular Hessian, inexact derivatives, or a truncated inner solve.

## Contour + Path
The **Contour + Path** draws the iterates on the contours of f. On Rosenbrock, Newton follows the curved valley in a few long steps; the trust region takes shorter, more cautious ones at first. For more than two variables the plot holds the others at the optimum.

## Convergence Check
The **Convergence Check** reports Optim's convergence flag, the iterations, the gradient norm at the solution and the **observed order** of convergence, computed from the distances of the last three iterates to the solution. About 2 means quadratic, about 1 linear. For Truncated Newton the path holds improving evaluations, not iterates, so the order is only indicative, and the count is of function evaluations.

## Gradient Check
The **Gradient Check** compares automatic-differentiation and finite-difference gradients at x0 and at the solution. A large difference means f is not what ForwardDiff differentiates (a branch, a non-generic function) or the finite differences are inaccurate.

## Hessian Conditioning
**Hessian Conditioning** reports the Hessian's eigenvalues at x0 and at the solution. Negative eigenvalues at x0 mean the start is in a region of negative curvature: plain Newton must modify H there, and the trust region copes better. A very large condition number at the solution means a nearly flat direction.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Converged | true | false |
| Observed order | About 2 | About 1, or erratic |
| Gradient norm | Below 1e-8 | Large |
| Hessian at the solution | All eigenvalues positive | Zero or negative eigenvalues |
| Gradient check | Differences near 1e-8 | Differences of the gradient's size |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
