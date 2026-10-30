# Decision Guide

| Situation | Method |
|---|---|
| Smooth, moderate n, start near the minimum | **Newton** |
| Start far away, or indefinite Hessian along the way | **Newton Trust Region** |
| Box constraints on the variables | **IPNewton** |
| Large n, Hessian too costly to form or factorise | **Truncated Newton** |
| Hessian unavailable or expensive, moderate n | BFGS or L-BFGS (Quasi-Newton Methods) |
| General nonlinear constraints | Constrained Optimisation |

## Decision Flow

1. **Start with Newton Trust Region**: it is the most robust of the four and loses little when Newton would have worked.
2. **Switch to Newton** if the trust region is slow and the Hessian is positive definite along the path.
3. **Use IPNewton** when the variables have bounds that matter; keep x0 strictly inside.
4. **Use Truncated Newton** when n is large, in the thousands or more.
5. **Check the Convergence Check's observed order** and the **Hessian Conditioning** at the solution.

## Rules of Thumb

- **Prefer :forward derivatives**: exact Hessians make the quadratic convergence real; finite differences blunt it.
- **A few iterations is normal**: 10 to 30 on Rosenbrock; hundreds point to a problem.
- **Negative eigenvalues at x0** call for the trust region.
- **For n above a few hundred**, compare the seconds with BFGS, not the iterations.
- **Bounds by transformation** (exp for positive parameters) are an alternative to IPNewton when the minimum is not on the boundary.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
