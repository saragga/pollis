# Interpretation

## The Solution
**Solution Summary** values: the optimal objective, the best attainable, and the optimal x, the plan that attains it. The **Solution Plot** shows each constraint's use A x against its limit b.

## Shadow Prices
The **Shadow Price** of a constraint is the change in the optimal objective per extra unit of its right-hand side, as long as the change stays within the constraint's sensitivity range. In a maximisation of profit with a capacity constraint, it is the most it would be worth paying for one more unit of capacity. A non-binding constraint has a shadow price of 0. For a MILP, the panel reports the shadow prices of the LP relaxation: a guide to which resources matter, not an exact value.

## Reduced Costs
The **Reduced Cost** of a variable at 0 says how much its objective coefficient must improve before it becomes worth using. A variable already in the solution has a reduced cost of 0. In a product mix, a product left out with a large reduced cost would need a much better price to be made.

## Sensitivity Ranges
The **Sensitivity Analysis** gives, for each objective coefficient, the range over which it can move without changing the optimal vertex (x stays the same, the objective changes), and for each right-hand side, the range over which its shadow price stays valid (the vertex moves, the binding set stays the same). Outside these ranges, solve again.

## Parametric Analysis
**Parametric Analysis** sweeps the first cost coefficient and plots the optimal value and x1. For an LP the optimal value is **piecewise linear** in a coefficient, with kinks where the optimal vertex changes; x1 jumps at those kinks. For a MILP, both change in steps.

## The Integrality Gap
**LP Relaxation Gap** compares the integer optimum with the LP bound. Their difference is the price of integrality; the LP bound tells how good any integer solution could at best be.

## See Also
- [Duality](duality.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
