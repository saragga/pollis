# Interpretation

## Solution Summary
The **Solution Summary** prints Optim's own report: the algorithm, the starting point, the minimiser, the minimum, the convergence measures (the change in x, the change in f, the gradient norm, each against its tolerance) and the work counters. Read the measure that triggered convergence: a small gradient means a stationary point, a small change in x or f alone may only mean slow progress.

## A Local Minimum
The minimiser is **local**: the minimum of the basin x0 lies in. **Multi-Start** solves from 20 random starts around x0 and sorts the results by their minimum: if most starts reach the same point, it is likely the global minimum within that region; if they spread over several, f has several basins, and the lowest found is the best candidate, with no guarantee.

## Local Optimality (Hessian)
The **Local Optimality (Hessian)** gives the eigenvalues of the exact Hessian at the solution. All positive confirms a **strict local minimum**; a zero eigenvalue a flat direction; a negative one a saddle point, not a minimum. The **condition number**, the largest over the smallest eigenvalue in absolute value, measures how elongated the valley is: large values explain slow gradient methods and a minimiser that is sensitive in some directions. At a solution on a bound, the gradient is not zero and the eigenvalues of the full Hessian are not the right test.

## Statistical Objectives
When f is a negative log-likelihood, the Hessian at the minimum is the **observed information**, and its inverse estimates the covariance of the estimates: small eigenvalues are combinations of parameters the data barely identify.

## Evaluate at New Point
**Evaluate at New Point** gives f at another point, the increase over the minimum and the distance from the minimiser: how much a practical or rounded alternative costs.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
