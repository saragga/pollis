# IPNewton

**IPNewton** is Optim.jl's **interior-point Newton** method for constrained problems. In the Second Order Methods panel it handles **box constraints**, **Lower Bounds** <= x <= **Upper Bounds**, set per variable, with -Inf and Inf for no bound.

## The Barrier
An interior-point method replaces the constraints with a **logarithmic barrier**: it minimises f(x) - mu * sum(log(x - lb) + log(ub - x)), which is infinite on the boundary, so the iterates stay strictly inside. Newton steps are taken on this barrier problem while mu is driven towards zero; the solutions of the successive problems, the **central path**, lead to the constrained minimum. Optim updates the barrier and the Lagrange multipliers together, in a primal-dual scheme, with a line search that keeps the iterates feasible.

## Starting Point
The barrier is infinite on the boundary and undefined outside, so **x0 must lie strictly inside** the bounds. With all bounds infinite, as in **Compare Methods**, IPNewton is an unconstrained Newton method with its own line search.

## Active Bounds
If the constrained minimum lies on a bound, the iterates approach it from inside and the corresponding multiplier becomes positive; the final x sits at or just inside the bound, within the convergence tolerance. If no bound is active, the solution is the unconstrained one.

## Beyond Boxes
Optim's IPNewton also accepts general nonlinear equality and inequality constraints, through TwiceDifferentiableConstraints with constraint functions and their Jacobians; the Second Order Methods panel uses only the bounds. The Constrained Optimisation panel covers the general case.

## See Also
- [Newton Trust Region](newton-trust-region.md) · [Newton](newton.md) · [Decision Guide](decision-guide.md)
