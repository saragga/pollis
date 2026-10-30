# Duality

Every conic programme, the **primal**,

    minimise c'x   subject to   A x + s = b,   s in K,

has a **dual**,

    maximise -b'y   subject to   A'y + c = 0,   y in K*,

where K* is the **dual cone**, the set of y with y's >= 0 for every s in K. The non-negative orthant, the second-order cone and the semidefinite cone are self-dual; the exponential and power cones have explicit duals of the same kind.

## Weak and Strong Duality
- **Weak duality**: any dual feasible y gives a lower bound on the primal minimum. The dual value is a certificate: no feasible x can do better.
- **Strong duality**: when the primal is strictly feasible (Slater's condition), the two optimal values are equal, and the **Duality Gap** is zero.
The panel's **Duality Gap** gives both values and their relative gap: near the solver's tolerance certifies optimality.

## Complementary Slackness
At the optimum, s'y = 0: for each constraint, either the slack is zero (active) or the dual is zero. A non-zero **Dual Variable** therefore marks an active constraint, and **Cone Membership** shows it on the boundary of its cone.

## Shadow Prices
The dual variable of a constraint is the sensitivity of the optimal value to its right-hand side: the **shadow price**. The **Parametric Sweep** shows the same thing globally, as the slope of the optimal value curve.

## Certificates of Infeasibility
When the primal is infeasible, the dual has a ray that proves it (Farkas' lemma); when the objective is unbounded, the primal has one. Conic solvers return these rays instead of failing silently: the status INFEASIBLE or DUAL_INFEASIBLE comes with a certificate.

## Sign Conventions
JuMP's dual() follows the conic convention; shadow_price() gives the change in the objective for a relaxation, with the sign that makes sense for the problem's sense. **Dual Variables** uses shadow_price, **Sensitivity Analysis** dual.

## See Also
- [Interior Point](ipm.md) · [Interpretation](interpretation.md) · [Assumptions](assumptions.md)
