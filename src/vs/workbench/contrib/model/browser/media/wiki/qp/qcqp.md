# QCQP

A **quadratically constrained quadratic programme** allows quadratic functions in the constraints as well as the objective:

minimise x'Q0x/2 + c0'x  subject to  x'Qix/2 + ci'x <= bi,  i = 1, ..., m.

The panel's example has a linear objective, the expected return, and one quadratic constraint, the volatility cap w'Sigma w <= cap^2.

## Convexity
A QCQP is **convex** when the objective's matrix and the matrix of every quadratic inequality constraint are **positive semidefinite**: each such constraint then defines a convex region (an ellipsoid or a cylinder). Quadratic equality constraints, or an indefinite matrix in any term, make it non-convex.

## Second-Order Cones
A convex quadratic constraint x'Qx <= t can be rewritten, with a factor Q = F'F, as ||Fx|| <= sqrt(t): a **second-order cone** constraint. Conic interior-point solvers such as Clarabel solve it in this form, with the same reliability and accuracy as a QP; JuMP performs the conversion automatically. Ipopt instead treats the constraint as a general smooth inequality.

## The Volatility Cap and the Frontier
Maximising the return for a volatility cap and minimising the variance for a target return trace the **same efficient frontier**: each cap corresponds to a target, and the two problems give the same portfolio. The QCQP formulation is natural when the risk budget is the hard limit. The dual price of the cap is the marginal expected return per unit of extra variance allowed.

## Non-Convex QCQPs
Non-convex QCQPs (for example, constraints that a distance be at least some value, or bilinear terms) are NP-hard in general. Global solvers such as SCIP or Gurobi solve them by spatial branch and bound; local solvers such as Ipopt find a local optimum, and semidefinite relaxations give bounds.

## See Also
- [QP](qp.md) · [MIQP](miqp.md) · [Overview](overview.md)
