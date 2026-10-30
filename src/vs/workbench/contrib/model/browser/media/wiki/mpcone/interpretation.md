# Interpretation

## Solution Profile
The **Solution Profile** plots the optimal x: for the Exponential Cone, the maximum-entropy probabilities on 1, ..., n with a dashed line at the **Target Mean**. For a convex problem, this x is the **global** minimiser, and it is unique when the objective is strictly convex.

## Dual Variables
**Dual Variables** gives the **shadow price** of each scalar constraint: the change in the optimal value per unit increase in its right-hand side, to first order. On the default Convex Programming model, the shadow price of sum(x) == 1 says how much the optimal value changes if the total is allowed to grow. Bounds with zero shadow price are not active.

## Sensitivity Analysis
**Sensitivity Analysis** lists the dual of every constraint, including the **cone duals**: a vector in the dual cone for each cone constraint. A non-zero cone dual marks a cone constraint that is active, on the boundary of its cone; the norm constraint ||x|| <= radius of the SOCP, for example, is active when its dual is non-zero.

## Parametric Sweep
The **Parametric Sweep** re-solves across a range of the model's key parameter, the constraint's right-hand side, the norm radius, the target mean or p, and plots the optimal value. For a convex problem the optimal value is a **convex function** of a right-hand side, and its slope is the shadow price. On the SOCP, the residual norm falls as the radius grows, until the radius exceeds the least-squares coefficients' norm, where the curve becomes flat.

## Solver Comparison
**Solver Comparison** solves the same problem with Clarabel, COSMO and SCS. They should agree to their tolerances; COSMO and SCS to fewer digits.

## vs Baseline
**vs Baseline** compares with the unconstrained minimiser, ordinary least squares, the uniform distribution, or least squares and least absolute deviations: what the constraint, the radius, the mean or the choice of p costs or buys.

## See Also
- [Diagnostics](diagnostics.md) · [Duality](duality.md) · [Decision Guide](decision-guide.md)
