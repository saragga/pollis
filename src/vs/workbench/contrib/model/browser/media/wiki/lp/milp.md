# MILP

A **mixed-integer linear programme** is an LP in which some variables must take integer values (or 0/1 values, for decisions). In this panel every variable is integer:

    maximise (or minimise)   c' x
    subject to               A x <= b
                             x >= 0, integer

## Why It Is Harder
The feasible set is now a set of lattice points inside the polyhedron, not convex. Rounding the LP solution may give an infeasible point, or a feasible one far from optimal. MILP is NP-hard: no method is known that solves every instance in time growing only polynomially with its size.

## Branch-and-Bound
1. Solve the **LP relaxation**, the same problem without integrality. Its optimum is a **bound**: no integer solution can be better.
2. If the LP solution is integer, it is optimal. Otherwise pick a fractional variable, say x_j = 2.6, and **branch**: one subproblem adds x_j <= 2, the other x_j >= 3.
3. Solve the subproblems' relaxations. **Prune** a branch if it is infeasible, if its bound is no better than the best integer solution found so far (the **incumbent**), or if its solution is integer (it becomes a candidate incumbent).
4. Continue until no branch is left. The gap between the incumbent and the best remaining bound is the **relative gap**; it is 0 when the optimum is proven.

## Cutting Planes and Heuristics
Modern solvers such as HiGHS add **cuts**, inequalities that every integer solution satisfies but the current fractional solution violates, to tighten the relaxation; and run **heuristics** that find good integer solutions early, which lets them prune more branches.

## Formulation Matters
Two MILPs with the same integer solutions can have very different relaxations. The tighter the relaxation, the smaller the **integrality gap** reported by **LP Relaxation Gap**, and the fewer nodes branch-and-bound needs. Common tightenings: the smallest valid big-M coefficients, explicit bounds on variables, and aggregate constraints split into stronger individual ones.

## Duals in a MILP
A MILP has no useful dual solution: with all variables fixed at their integer values, every dual is zero. The panel's Shadow Prices, Reduced Costs and Sensitivity Analysis for a MILP are those of the LP relaxation, a guide only.

## See Also
- [LP](lp.md) · [Duality](duality.md) · [Diagnostics](diagnostics.md)
