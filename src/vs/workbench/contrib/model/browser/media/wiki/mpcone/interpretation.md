# Interpretation

## Solution Profile
The **Solution Profile** plots the optimal x: for the Exponential Cone, the maximum-entropy probabilities on 1, ..., n with a dashed line at the **Target Mean**. For a convex problem, this x is the **global** minimiser, and it is unique when the objective is strictly convex.

## Dual Variables
**Dual Variables** gives the **shadow price** of each scalar constraint, as JuMP defines it: the change in the optimal value per unit relaxation of the constraint, to first order. A constraint or bound whose shadow price is zero is not active at the solution: relaxing it a little leaves the optimal value unchanged. The duals of the cone constraints are not shadow prices of this kind; **Sensitivity Analysis** lists them.

## Sensitivity Analysis
**Sensitivity Analysis** lists the dual of every constraint, including the **cone duals**: a vector in the dual cone for each cone constraint. A non-zero cone dual marks a cone constraint that is active, on the boundary of its cone; the norm constraint ||x|| <= radius of the SOCP, for example, is active when its dual is non-zero.

## Parametric Sweep
The **Parametric Sweep** re-solves across a range of the model's key parameter, the norm radius, the target mean or p, and plots the optimal value. For a convex problem the optimal value is a **convex function** of a right-hand side, and its slope is given by the constraint's dual value. On the SOCP, the residual norm falls as the radius grows, until the radius exceeds the least-squares coefficients' norm, where the curve becomes flat.

## Solver Comparison
**Solver Comparison** solves the same problem with Clarabel, COSMO and SCS. They should agree to their tolerances; COSMO and SCS to fewer digits.

## vs Baseline
**vs Baseline** compares with ordinary least squares, the uniform distribution, or least squares and least absolute deviations: what the radius, the mean or the choice of p costs or buys.

## See Also
- [Diagnostics](diagnostics.md) · [Duality](duality.md) · [Decision Guide](decision-guide.md)
