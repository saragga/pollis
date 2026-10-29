# Diagnostics

## Termination Status
The **Feasibility Check** reports the termination and primal status:
- **OPTIMAL**: a proven optimal solution was found.
- **INFEASIBLE**: no x satisfies all the constraints at once. Look for contradictory constraints, a wrong sign, or a right-hand side that is too tight.
- **DUAL_INFEASIBLE**: the problem is (usually) **unbounded**: the objective improves without limit. A constraint is missing, or the sense (maximise or minimise) is wrong.
- **TIME_LIMIT** or **OTHER_LIMIT** (MILP): the solver stopped early; the solution, if any, is feasible but not proven optimal.

Never read the solution before checking the status.

## Constraint Activity
**Constraint Activity** gives the **slack** b - A x of every constraint. A slack of about 0 means the constraint is **binding**: it holds the optimum where it is, and has a non-zero shadow price. A positive slack means the resource is not used up, and an extra unit of it is worth nothing.

## The Feasible Region
For two variables, the **Feasible Region** plot shows the polygon of feasible points, the contours of the objective and the optimum at a vertex. With more variables it shows the plane of x1 and x2 with the others held at their optimal values. An optimum on an edge parallel to a contour means **multiple optima**: any point on that edge is optimal.

## Degeneracy and Multiple Optima
If a basic variable is 0 at the optimum (degeneracy), the shadow prices are not unique and the sensitivity ranges can be one-sided. If a non-basic variable has a reduced cost of 0, there are other optimal solutions. Neither is an error, but both mean the reported duals or x are one choice among several.

## MILP Gap
For a MILP, the **relative gap** between the best integer solution and the best bound should be 0 (or below the solver's tolerance) at OPTIMAL. **LP Relaxation Gap** compares the integer optimum with the LP relaxation bound: a large gap means the formulation is weak, and branch-and-bound will need many nodes.

## Solvers
**Solver Comparison** solves the same problem with each solver. The status and the optimal objective should agree; the x may differ when there are multiple optima.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Status | OPTIMAL | INFEASIBLE, DUAL_INFEASIBLE, a limit reached |
| Slacks | Binding constraints make sense | A constraint you expected to bind has large slack |
| Solvers | Same objective | Different objectives: a numerical problem |
| MILP gap | 0 at the end | Large relative gap, or a large integrality gap |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Duality](duality.md)
