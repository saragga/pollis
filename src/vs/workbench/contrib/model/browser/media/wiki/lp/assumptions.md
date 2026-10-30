# Assumptions

## Linear Programming
- **Proportionality.** Each variable's contribution to the objective and to each constraint is its value times a fixed coefficient: no fixed costs, no discounts for volume.
- **Additivity.** The contributions of different variables add up: no interactions between them.
- **Divisibility.** Variables can take any real value within their bounds. When they count indivisible things and are large, rounding an LP solution is often good enough; when they are small, use MILP.
- **Certainty.** c, A and b are known numbers. The **Sensitivity Analysis** shows how far they can move before the solution changes.
- **Non-negativity.** In the Linear Programming panel every variable is at least 0, and every constraint is of the form A x <= b. An equality is two inequalities; a >= constraint is a <= constraint multiplied by -1.

## Mixed-Integer Linear Programming
The same as LP, except that the variables must be **integers**. Integrality destroys convexity, so:
- the duals of the MILP itself are not defined; the panel reports those of the **LP relaxation**, which are a guide only;
- the optimum can change abruptly as the data change, in steps rather than along straight lines;
- solving time can grow exponentially with the size of the problem.

## Numerical Assumptions
- **Reasonable scaling.** Coefficients spanning many orders of magnitude (1e-6 next to 1e6) cause numerical trouble in every solver; rescale the units.
- **A bounded problem.** If the objective can improve without limit, the solver reports DUAL_INFEASIBLE: a constraint is missing.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
