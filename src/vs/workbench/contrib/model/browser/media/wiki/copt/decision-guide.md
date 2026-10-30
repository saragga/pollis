# Decision Guide

| Situation | Method |
|---|---|
| Smooth, small to medium n, nonlinear constraints | **SLSQP** |
| Many variables, few constraints; design and topology problems | **MMA** |
| Large, sparse, many constraints; equalities | **Interior Point** |
| Convex set where a linear objective is cheap to minimise | **Frank-Wolfe** |
| Convex set with a cheap projection (box, ball, simplex) | **Gradient Projection** |
| No derivatives available | COBYLA (Compare Methods), or Derivative-Free Methods |
| Linear or quadratic objective and constraints | Linear or quadratic programming solvers |

## Decision Flow

1. **Start with SLSQP** for small problems: it is fast and accurate.
2. **Use Interior Point** when the problem is large or has many constraints, or when you need reliable multipliers.
3. **Use MMA** when feasibility must be kept once reached, or n is large and constraints few.
4. **Use Frank-Wolfe or Gradient Projection** only for convex sets, when their oracle or projection is cheap.
5. **Check the KKT Conditions** and run **Multi-Start** on non-convex problems.

## Rules of Thumb

- **A feasible start helps** every method, and MMA especially.
- **Don't write equalities as pairs of inequalities** if a method takes equalities directly, such as Ipopt through JuMP.
- **Check the multipliers' signs**: a negative one usually means the solver stopped early.
- **Compare with the unconstrained optimum**: if no constraint binds, the problem is simpler than it looks.
- **First-order methods (Frank-Wolfe, Gradient Projection) converge slowly** to high accuracy; use them for large convex problems where a moderate accuracy is enough.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
