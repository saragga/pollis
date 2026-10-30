# Assumptions

## Smooth Functions
f and every entry of g must be **continuously differentiable**, written in generic Julia code that ForwardDiff can differentiate. Kinks in the constraints (a maximum, an absolute value) break the quadratic and linear models the methods rely on; they can often be rewritten as several smooth constraints.

## The Form of the Constraints
Constraints are written as a Julia vector of expressions, **feasible when every entry is <= 0**. A constraint h(x) >= c becomes c - h(x); an equality h(x) = 0 can be written as two inequalities, h(x) <= 0 and -h(x) <= 0, although that is poorly conditioned for most methods. Bounds go in **Lower Bounds** and **Upper Bounds**, not in g.

## A Nonempty Feasible Set
The constraints and bounds must have feasible points. If they do not, the solvers report infeasibility or stop at the least-infeasible point they find; the **Feasibility Check** and **Constraint Violation** show it.

## Constraint Qualification
The KKT conditions, and the multipliers, are guaranteed only when the active constraints are **well behaved** at the solution. The usual condition, LICQ, requires the gradients of the active constraints to be linearly independent. When it fails (two constraints tangent at the solution, or a constraint written twice), the multipliers are not unique and the solvers may struggle.

## Convexity
If f is convex and the feasible set is convex (g convex, as for the unit disk and the half-plane), any local solution is **global**, and the KKT conditions are sufficient. Without convexity the methods find local solutions. **Frank-Wolfe and Gradient Projection assume a convex feasible set**: in the Constrained Optimisation panel their oracle and projection are themselves small SLSQP problems, exact only when the set is convex.

## Scaling
Constraints and variables on very different scales slow convergence and blur the tolerance on violation, 1e-8 here. Scale them to comparable magnitudes.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
