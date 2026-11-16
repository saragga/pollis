# Interpretation

## What the Answer of Each MINLP Solver Means
- **SCIP** with status OPTIMAL: the global optimum of the mixed-integer problem, within the gap, convex or not.
- **Juniper** and **Bonmin** with status LOCALLY_SOLVED: the optimum when the problem is convex; on a nonconvex problem a good feasible solution, whose quality the Solver Comparison against SCIP shows.
Report the solver and its status with the result.

## Which Switches Are On
The solution lists the variables switched on, the indices with z[i] = 1. Under a cardinality limit they are the variables that improve the objective most when allowed to be nonzero; the rest are held at 0. Different solvers can return different sets with the same objective, when ties exist.

## Cardinality Sweep and the Value of One More Variable
The **Cardinality Sweep** solves the problem for every limit on the nonzeros, from 1 to n, and plots the optimal objective against the limit. Each step down the curve is what one more nonzero variable is worth; a flat stretch means further variables add nothing. The curve is the mixed-integer counterpart of a shadow price, which an integer constraint does not have. The limit is restored afterwards.

## Duals at the Chosen Switches
MINLP solvers usually return no duals, as the integer problem has no multipliers of its own. **Duals at the Chosen Switches** fixes the switches at their optimal values and solves the continuous problem that remains with Ipopt: its shadow prices say how the objective would change if a constraint were relaxed, with the same variables on and off.

## Constraint Activity
**Constraint Activity** lists the constraints and bounds with their slack and whether they bind (slack below 1e-6). The switch constraints of the variables switched off bind by construction; the ones that matter are the panel's **Constraint**, the bounds of the variables switched on, and the cardinality limit.

## Solver Comparison of SCIP, Juniper and Bonmin
The **Solver Comparison** solves the same model with the three solvers and reports the status, the objective and the seconds. On a convex problem all three should agree; on a nonconvex one SCIP gives the global optimum, and Juniper and Bonmin may stop at a worse point, not necessarily the same one.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Branch and Bound](minlp.md)
