# Assumptions

## Convexity
The QP and QCQP are **convex** when the matrix in the quadratic terms, here Sigma, is **positive semidefinite**: then the feasible set is convex, every local optimum is global, and interior-point solvers find it reliably. A covariance matrix estimated from complete data is positive semidefinite; one assembled by hand, estimated pairwise from incomplete data, or altered for scenarios may not be. If Sigma is positive definite (all eigenvalues above zero), the variance-minimising solution is also **unique**.

## Feasibility
The constraints must admit a solution. With long-only weights summing to one, the expected return lies between the smallest and the largest expected return of the assets, so a higher target is infeasible; a volatility cap below the minimum achievable volatility is infeasible too; and with at most k assets, the target must be reachable by k of them.

## Correct Inputs
mu and Sigma are taken as **known**. In practice they are estimates, and the optimiser amplifies their errors: it overweights the assets whose expected returns are overestimated and whose risks are underestimated. The solution is optimal for the inputs, not necessarily for the future.

## Consistent Units
Expected returns, covariances, the target and the cap must refer to the same period (all daily, all annual) and the same units (fractions or percentages). Mixing them gives a feasible but meaningless solution.

## Numerical Scale
Solvers work to tolerances of about 1e-8 (interior point) or 1e-3 to 1e-4 (OSQP). Very small or very large numbers, or a nearly singular Sigma, make the results sensitive to them; rescaling the data, for example to percentages, can help.

## The Mixed-Integer Model
The MIQP is non-convex because of the binary variables, and its solution time grows with the number of assets and the tightness of k. SCIP proves the global optimum within a gap; Juniper is a heuristic on non-convex problems.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
