# Diagnostics

## Feasibility Check
The **Feasibility Check** reports the **termination status** and the **primal status**, and a feasibility report of any constraint violated by more than 1e-6. OPTIMAL with a FEASIBLE_POINT and an empty report is a solved problem. INFEASIBLE means the constraints cannot all hold: lower the target return, raise the volatility cap or allow more assets. ALMOST_OPTIMAL or SLOW_PROGRESS means the solver stopped near a solution but not within its tolerances: check the scaling of the data. Never read the weights before checking the status.

## Convexity Check
The **Convexity Check** reports the eigenvalues of Sigma. All non-negative (above -1e-10) makes the problem convex, so the solution is the global optimum; all strictly positive makes it unique. A negative eigenvalue means Sigma is not a valid covariance matrix: repair it (the nearest positive semidefinite matrix, or a shrinkage estimate) rather than solving a non-convex problem. The **condition number**, the largest eigenvalue over the smallest, measures how close Sigma is to singular: a large one means weights that are unstable to small changes in the inputs.

## Efficient Frontier and Weights
The **Efficient Frontier** traces volatility against expected return across the grid of targets (or caps), with the single assets and the solution marked. The frontier should be a smooth curve to the left of the assets; for the QP, targets below the return of the minimum-variance portfolio do not bind, so that part of the curve is flat in variance. The **Portfolio Weights** chart shows the weights: many at zero or at a bound is usual in long-only portfolios; one asset taking almost everything suggests extreme inputs.

## Solver Agreement
The **Solver Comparison** solves the same problem with each capable solver. Objectives that agree to the solvers' tolerances confirm the solution; OSQP's are less precise by design. Disagreement beyond the tolerances points to a badly scaled or nearly singular problem.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Termination status | OPTIMAL | INFEASIBLE, ALMOST_OPTIMAL, iteration limit |
| Feasibility report | Empty | Violated constraints |
| Smallest eigenvalue of Sigma | Positive | Negative |
| Condition number | Moderate | Very large |
| Solver comparison | Objectives agree | Objectives differ beyond tolerances |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
