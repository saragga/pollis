# Interpretation

## Solution Summary
The **Solution Summary** gives the minimiser, the minimum, the value at the start, the improvement and the iterations. The minimiser is a **local** minimum: the one the iterates reached from x0. Running from several starts and finding the same minimum is the practical evidence that it is the global one; finding different minima is information about f.

## Local Curvature
The **Local Curvature** gives the eigenvalues and eigenvectors of the Hessian at the solution. All positive confirms a strict local minimum. Each eigenvalue is the curvature along its direction: a large one means f rises steeply and the minimiser is sharply determined that way; a small one means a **flat direction**, along which f barely changes and the minimiser is poorly determined. The **condition number**, the largest over the smallest eigenvalue, measures how elongated the valley is: large values mean slow early progress and sensitivity to rounding.

## Statistical Objectives
When f is a negative log-likelihood, the Hessian at the minimum is the **observed information**: its inverse estimates the covariance of the estimates, and the flat directions are combinations of parameters the data do not identify well. Use the exact Hessian (by automatic differentiation) for this, not the BFGS approximation, which is built for finding the minimum and need not match the Hessian at it.

## Evaluate at New Point
**Evaluate at New Point** gives f and the gradient at another point and the increase over the minimum: how much worse a nearby or practical alternative is.

## Local Quadratic Model
The **Local Quadratic Model** compares f with its second-order Taylor approximation, f* + d'Hd/2, at growing distances from the minimum. Where they agree, the quadratic picture that quasi-Newton methods build is accurate and convergence is fast; where they diverge, the iterates are outside the region of superlinear convergence. For a likelihood, the same comparison shows how far normal-approximation intervals can be trusted.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
