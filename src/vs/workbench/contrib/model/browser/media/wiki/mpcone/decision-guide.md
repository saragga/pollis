# Decision Guide

| Situation | Method |
|---|---|
| Convex quadratic or general convex objective, linear constraints | **Convex Programming** |
| Norms, Euclidean distances, robust least squares, portfolio risk | **Second-Order Cone** |
| Logs, exponentials, entropy, logistic losses, geometric programmes | **Exponential Cone** |
| Powers, p-norms with 1 < p < 2, geometric means | **Power Cone** |
| Matrix variables, eigenvalues | Semidefinite programming (not in this panel) |
| Non-convex objective | Nonlinear Programming panel |

## Decision Flow

1. **Write the problem from convex atoms**: norms, quadratics, logs, powers.
2. **Identify the cones** the atoms need: the hardest one decides the solver's requirements.
3. **Solve with Clarabel** first, for accuracy.
4. **Check the status and the duality gap**.
5. **For large sparse problems**, switch to **COSMO** or **SCS** and accept fewer digits.

## Rules of Thumb

- **Prefer the simplest cone**: a linear or second-order cone formulation solves faster than an exponential one.
- **Use an epigraph variable**: minimise t subject to ||A x - b|| <= t, as the SOCP model does.
- **Clarabel for accuracy**, 1e-8; **SCS or COSMO for scale**, 1e-4 to 1e-6.
- **Never trust a solution without its status**: OPTIMAL and a small gap.
- **Rescale the data** when the solver reports slow progress.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Interior Point](ipm.md)
