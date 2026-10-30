# Interpretation

## What the Answer Guarantees
The meaning of the solution depends on the class and the solver:
- **NLP** with Ipopt or MadNLP: a **local** optimum; nothing is claimed about other regions.
- **MINLP** with SCIP: the global optimum of the mixed-integer problem within the gap; with Juniper, optimal for convex problems and a good feasible point otherwise.
- **Global NLP** with EAGO or SCIP: the **certified global optimum** within the solver's tolerance.

## KKT Conditions
The **KKT Conditions** action lists, for each constraint and bound, its value, its multiplier and the product of multiplier and slack, which should be about 0 (complementary slackness). It needs duals, which interior-point solvers return and MINLP and global solvers usually do not. See [KKT Conditions](kkt.md).

## Constraint Activity
**Constraint Activity** lists the constraints and bounds with their slack and whether they bind (slack below 1e-6). Binding constraints shape the solution; the others could be dropped without changing it.

## Constraint Sensitivity
**Constraint Sensitivity** gives the **shadow price** of each constraint: the change in the optimal objective per unit relaxation of its right-hand side. JuMP's shadow_price follows the economic convention, so the sign is that of an improvement for a relaxation, in both minimisation and maximisation. Non-binding constraints have a shadow price of 0. Like the multipliers, it is a **local** derivative: valid for small changes, and for nonconvex problems only around the local optimum found.

## Parametric Sweep
The **Parametric Sweep** tightens the upper bound on every variable in 15 steps, from ub to near lb, and plots the optimal objective against it. Flat stretches mean the bound does not bind; the slope where it binds is the shadow price of the bound; a jump can mean the solver moved to another local optimum, or the problem became infeasible (NaN). The bound is restored afterwards.

## Solver Comparison
The **Solver Comparison** solves the same model with the two solvers of its class, Ipopt and MadNLP, SCIP and Juniper, or EAGO and SCIP, and reports the status, objective and seconds.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [KKT Conditions](kkt.md)
