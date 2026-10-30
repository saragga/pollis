# Diagnostics

## Convergence Curve and Constraint Violation
The **Convergence Curve** plots f at each recorded iterate, with the final value dashed: objective evaluations for SLSQP and MMA, iterations for the others. The **Constraint Violation** plots the largest violation of the constraints and bounds on a log scale; for Ipopt it is Ipopt's own primal infeasibility. A healthy run drives the violation to near zero while f settles. Infeasible methods may first decrease f below the final value and then rise as feasibility is restored: SLSQP often does.

## Solution Path
The **Solution Path** draws the contours of f, the constraint boundaries g(x) = 0 in black and the iterates, in the (x1, x2) plane. Interior Point records no iterates, so only the start and the solution appear. Frank-Wolfe's path zigzags towards the boundary, Gradient Projection slides along it.

## Feasibility Check
The **Feasibility Check** reports every constraint value at the solution, whether all are satisfied within 1e-6, whether the bounds hold, and the largest violation. A positive violation above the tolerance means the solution is not feasible: raise **Max Iterations** or try another method.

## KKT Conditions
The **KKT Conditions** action takes the constraints active at the solution, estimates their multipliers by least squares from grad f + J' lambda = 0 (on the coordinates not at a bound), and reports:
- the **stationarity residual**, near 0 at a KKT point;
- **dual feasibility**, every multiplier non-negative;
- **complementary slackness**, max |lambda_i g_i|, near 0.
For Interior Point it also prints Ipopt's multipliers, which should match. A large residual means the solver stopped short, or constraint qualification fails.

## Multi-Start
**Multi-Start** solves from 10 random starts in the box. One distinct solution suggests a convex problem or a dominant basin; several distinct solutions, a non-convex one with local optima.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Max violation | Below 1e-6 | Above the tolerance |
| Stationarity residual | Near 0 | Large |
| Multipliers | All >= 0 | Negative |
| Multi-Start | One solution | Several |
| Status | SUCCESS, LOCALLY_SOLVED | Iteration limit, infeasible |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
