# Interpretation

## Solution Summary and Active Constraints
The **Solution Summary** gives the solution, the objective, the solver's status, the iterations, the active constraints and bounds, and the largest violation. **Active Constraints** lists each constraint and bound with its value and whether it binds. A **binding** constraint holds with equality at the solution and shapes it; a non-binding one could be removed without changing the answer. In the default problem the disk binds, the half-plane x2 <= x1 does not.

## Multipliers as Shadow Prices
The multiplier lambda_i of a constraint g_i(x) <= 0 is its **shadow price**: if the constraint were relaxed to g_i(x) <= delta, the optimal value would fall by about lambda_i times delta. A large multiplier marks a constraint that costs a lot; a zero multiplier, one that does not bind. In the default problem the disk's multiplier is sqrt(3.25) - 1, about 0.80.

## Constraint Relaxation
**Constraint Relaxation** re-solves with all constraints shifted to g(x) <= delta for delta from -0.2 to 0.2, plots the optimal value, and reports its slope at 0: **minus the multiplier** when one constraint binds, minus their sum when several do. It is a numerical check of the shadow prices.

## Bounds Sensitivity
**Bounds Sensitivity** re-solves with the box shrunk by 10, 25 and 50 percent around its centre. If the objective does not change, the bounds are not binding; if it rises, the box is limiting the solution.

## vs Unconstrained
**vs Unconstrained** solves with the bounds only, by L-BFGS, and reports which constraints that solution violates and the **cost of the constraints**: the constrained optimum minus the box-only one.

## Compare Methods and Budget Study
**Compare Methods** runs the selected method, NLopt's SLSQP and MMA, and the derivative-free COBYLA from the same start, with objective, violation, evaluations and seconds. On a convex problem they should agree. The **Budget Study** shows how the objective and the violation improve as **Max Iterations** grows.

## Algorithm Info and Evaluate at Solution
**Algorithm Info** summarises what the selected method needs and handles, and its caveats. **Evaluate at Solution** gives f, g and the gradient of f at the solution.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
