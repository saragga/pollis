# Interpretation

## What the Solution of Ipopt, MadNLP or Uno Means
Ipopt, MadNLP and Uno return a **local** optimum: no feasible point nearby is better, to first and second order. On a convex problem the local optimum is the global one; on a nonconvex problem another basin may hold a better point, which **Multi-Start** and the **Optimality Gap Check** look for. Report the result as a local optimum unless one of them, or convexity, says otherwise.

## KKT Conditions at the Solution
The **KKT Conditions** action lists, for each constraint and bound, its value, its multiplier and the product of multiplier and slack, which should be about 0 (complementary slackness). A binding constraint can carry a nonzero multiplier; a slack one must have a multiplier of zero. See [KKT Conditions](kkt.md).

## Constraint Activity
**Constraint Activity** lists the constraints and bounds with their slack and whether they bind (slack below 1e-6). Binding constraints shape the solution; the slack ones could be dropped without changing it, as long as the solver stays in the same basin.

## Constraint Sensitivity and Shadow Prices
**Constraint Sensitivity** gives the **shadow price** of each constraint: the change in the optimal objective per unit relaxation of its right-hand side. JuMP's `shadow_price` follows the economic convention, so its sign is that of an improvement for a relaxation, in minimisation and maximisation alike. A shadow price is a **local** derivative: valid for small changes, and on a nonconvex problem only around the local optimum found.

## Parametric Sweep of the Bounds
The **Parametric Sweep** tightens the upper bound on every variable in 15 steps, from ub to near lb, and plots the optimal objective against it. Flat stretches mean the bound does not bind; where it binds, the slope is the bound's shadow price; a jump can mean the solver moved to another local optimum, or that the problem became infeasible (NaN). The bound is restored afterwards.

## Solver Comparison of Ipopt, MadNLP and Uno
The **Solver Comparison** solves the same model with Ipopt, MadNLP and Uno and reports the status, the objective and the seconds. From the same start the three usually reach the same local optimum; different answers point to a problem with several basins close to the start.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [KKT Conditions](kkt.md)
