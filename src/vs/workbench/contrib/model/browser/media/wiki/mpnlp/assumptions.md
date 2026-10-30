# Assumptions

## Smooth Expressions
For NLP, the objective and constraints must be **twice continuously differentiable**: Ipopt and MadNLP use exact second derivatives, which JuMP computes from the expressions. Functions JuMP does not know must be registered with **@operator**, and nonsmooth functions (abs, max) should be reformulated. Global solvers need more: expressions built from the operations they can **relax**, such as sums, products, powers, exp, log and trigonometric functions.

## Finite Bounds for Global Solvers
EAGO and SCIP build convex relaxations over boxes, so they need **finite bounds** on every variable that appears nonlinearly; the tighter the bounds, the tighter the relaxations and the fewer nodes. The panel puts the same **Lower Bound** and **Upper Bound** on every x[i]: with the default ball sum(x .^ 2) <= 4, the bounds -2 and 2 are implied, and so cost nothing.

## Big-M for MINLP
The switch lb z[i] <= x[i] <= ub z[i] uses the bounds as its **big-M**: it requires lb <= 0 <= ub, so that x[i] = 0 is allowed, and its continuous relaxation is tight only when the bounds are. Loose bounds give weak relaxations and slow branch and bound.

## Convexity and Guarantees
- **Ipopt and MadNLP**: a local optimum, satisfying the KKT conditions. Global only if the problem is convex.
- **Juniper**: branch and bound over Ipopt relaxations, **exact for convex MINLPs only**; on nonconvex ones it is a heuristic.
- **SCIP and EAGO**: global optimality within their tolerance, for problems they can relax.

## Constraint Qualification
The multipliers and the KKT conditions hold under a constraint qualification, such as linearly independent gradients of the active constraints. Degenerate constraints give non-unique duals and slow interior-point convergence.

## One Constraint
The panel generates one constraint from **Constraint**; further ones are added as @constraint lines in the generated code.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [KKT Conditions](kkt.md)
