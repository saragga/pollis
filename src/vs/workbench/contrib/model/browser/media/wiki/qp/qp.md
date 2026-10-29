# QP

A **quadratic programme** in standard form is

minimise x'Qx/2 + c'x  subject to  Ax <= b,  Ex = d,

with a symmetric matrix Q. It is the simplest step beyond linear programming, and solvable almost as reliably when it is convex.

## Convexity and Optimality
When Q is **positive semidefinite**, the objective is convex, and the **Karush-Kuhn-Tucker** (KKT) conditions, stationarity of the Lagrangian, feasibility, non-negative multipliers for the inequalities and complementary slackness, are necessary and sufficient for a global optimum. When Q is positive definite on the feasible directions, the optimum is unique. With an indefinite Q the problem can have many local optima, and finding the global one is NP-hard in general.

## Algorithms
- **Interior-point methods** (Clarabel, Ipopt) follow a path through the inside of the feasible region, solving a linear system at each step; they reach high accuracy in a few tens of iterations, almost independently of the problem size. Clarabel treats the QP as a conic problem with a quadratic objective.
- **Operator splitting** (OSQP, ADMM) alternates cheap projections and a factorised linear system: very fast per iteration, with warm starts and good scaling to large sparse problems, but converging to moderate accuracy.
- **Active-set methods** guess which inequalities bind, solve the equality-constrained problem, and update the guess; they are efficient for small dense problems and for re-solving after small changes.

## Duality
Each constraint has a **dual variable**, its multiplier in the KKT conditions, which measures how much the optimal objective changes when the constraint is relaxed. A multiplier is non-zero only when its constraint binds (complementary slackness).

## Applications
Mean-variance portfolios; least squares with bounds or equality constraints; support vector machines; model predictive control; the subproblems of sequential quadratic programming for nonlinear optimisation.

## See Also
- [QCQP](qcqp.md) · [MIQP](miqp.md) · [Overview](overview.md)
