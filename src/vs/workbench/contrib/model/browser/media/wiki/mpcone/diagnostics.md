# Diagnostics

## Status and Feasibility
**Status and Feasibility** gives the termination status, the primal and dual status, and any constraint, cones included, violated by more than 1e-6. A clean solve reads OPTIMAL with FEASIBLE_POINT for both primal and dual and an empty violation report. ALMOST_OPTIMAL or SLOW_PROGRESS means the solver stopped near its tolerance; INFEASIBLE and DUAL_INFEASIBLE mean there is no solution or the objective is unbounded, with a certificate.

## Duality Gap
The **Duality Gap** gives the primal and dual objectives and their relative gap, |primal - dual| / (1 + |primal|). Near 1e-8 (Clarabel) or 1e-5 (SCS, COSMO) certifies optimality to that accuracy: no feasible point can do better than the dual value. A large gap means the solver did not converge. See [Duality](duality.md).

## Solver Statistics
**Solver Statistics** gives the solve time, the iterations and the solver's raw status. Interior-point solvers take 10 to 50 iterations almost independently of the size; first-order solvers take hundreds or thousands of cheaper ones.

## Residuals and Slacks
**Residuals and Slacks** shows, for the regressions, the histogram of the residuals A x - b, and otherwise the slack of every scalar constraint and bound. A zero slack marks an **active** constraint, the ones that determine the solution.

## Cone Membership
**Cone Membership** gives the distance of each cone constraint's value to its cone: about 0 means inside. A distance well above the tolerance means the solver returned an infeasible point.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Termination | OPTIMAL | ALMOST_OPTIMAL, SLOW_PROGRESS, INFEASIBLE |
| Violations | Empty report | Constraints violated |
| Duality gap | Near the solver's tolerance | Large |
| Cone distances | About 0 | Above the tolerance |
| Solvers | Agree | Disagree beyond tolerance |

## See Also
- [Interpretation](interpretation.md) · [Duality](duality.md) · [Interior Point](ipm.md)
