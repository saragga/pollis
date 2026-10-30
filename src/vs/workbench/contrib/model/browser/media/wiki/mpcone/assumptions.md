# Assumptions

## Convexity
The objective must be **convex** (when minimised) and the feasible set convex. That is what makes a local optimum global and lets the dual certify it. JuMP checks convexity only structurally: a quadratic objective is accepted and bridged to a cone only if its matrix is positive semidefinite, and the solver reports an error or infeasibility otherwise.

## Representable by Cones
The problem must be built from expressions the cones can represent: affine functions, quadratics, norms (second-order cone), exp, log and entropy (exponential cone), powers and geometric means (power cone). An arbitrary convex function written in Julia, such as one with branches, cannot be bridged.

## Constraint Qualification
Strong duality, a zero **Duality Gap**, holds when the problem is **strictly feasible**: some point satisfies the cone constraints strictly, in the interior of the cones (Slater's condition). Problems without a strictly feasible point, for example with x >= 0 and sum(x) == 0, can have a gap, and interior-point solvers then struggle or report a slow or inaccurate status.

## Scaling
Solvers work in floating point to a tolerance near 1e-8 (Clarabel) or 1e-4 to 1e-6 (SCS, COSMO). Data with entries of very different magnitudes worsens the conditioning: rescale A, b and the variables to similar ranges.

## Bounded and Feasible
The problem must have a finite optimum. Otherwise the solver returns a certificate instead: of **primal infeasibility** (no feasible x) or of **dual infeasibility** (the objective is unbounded). **Status and Feasibility** reports which.

## Model Inputs
**Target Mean** must lie strictly between 1 and n; **p** must be greater than 1; the **Norm Radius** positive. The default A and b are random data for trying the panel.

## See Also
- [Diagnostics](diagnostics.md) · [Duality](duality.md) · [Decision Guide](decision-guide.md)
