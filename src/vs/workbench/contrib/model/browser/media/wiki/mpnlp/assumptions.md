# Assumptions

## Smooth Objective and Constraints
The objective and the constraints must be **twice continuously differentiable**: Ipopt and MadNLP take Newton steps with the exact Hessian of the Lagrangian, which JuMP computes from the expressions. Functions JuMP does not know are registered with **@operator**. Nonsmooth terms such as abs and max break the Newton steps where they kink, and are better reformulated with an auxiliary variable and two smooth constraints.

## What a Local Solver Guarantees
Ipopt and MadNLP return a point satisfying the KKT conditions, which is a local optimum or, rarely, a saddle point. On a **convex** problem, a convex objective to minimise over a convex feasible set, any local optimum is global. On a nonconvex problem nothing is claimed about other regions, and the answer can change with the starting point.

## Constraint Qualification
The multipliers exist and are unique under a constraint qualification, such as linearly independent gradients of the active constraints. Redundant or degenerate constraints break it: the multipliers are no longer unique, and interior-point methods slow down near the solution. Removing duplicated constraints is the usual fix.

## Bounds and the Starting Point
The panel puts the same **Lower Bound** and **Upper Bound** on every x[i] and starts each variable at (lb + ub) / 2. Interior-point methods keep the iterates strictly inside the bounds, so a start on a bound is moved inside first. Infinite bounds are allowed for Ipopt and MadNLP, but the **Optimality Gap Check** calls a global solver, which needs finite ones.

## One Constraint in the Panel
The panel generates one constraint from **Constraint**; further ones are added as @constraint lines in the generated code.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [KKT Conditions](kkt.md)
