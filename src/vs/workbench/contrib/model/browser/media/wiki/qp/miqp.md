# MIQP

A **mixed-integer quadratic programme** is a QP in which some variables must take integer, usually binary, values. Binary variables model **discrete decisions**: whether an asset is held, a machine switched on, a facility opened.

## The Cardinality Constraint
The panel limits the portfolio to at most k assets. A binary z_i says whether asset i is held; the constraint w_i <= z_i forces its weight to zero when z_i = 0 (the weight's upper bound of one serves as the big-M), and sum(z) <= k limits the count. A **minimum holding** l_i z_i <= w_i, which rules out tiny positions, is the same construction with a lower bound.

## Branch and Bound
**Branch and bound** solves the **continuous relaxation** (the binaries allowed anywhere in [0, 1]): a convex QP whose optimum is a **lower bound** on the MIQP. If some z_i is fractional, it **branches** into two subproblems, z_i = 0 and z_i = 1, and repeats; a subproblem whose bound is no better than the best integer solution found is **pruned**. The **gap** between the best integer solution and the best bound measures how far from proven optimality the search is; solvers stop when it falls below a tolerance. Cutting planes, presolve and heuristics shrink the tree.

## Weak Relaxations
With w_i <= z_i and weights summing to one, the relaxation can set z_i = w_i, which satisfies sum(z) <= k for any k of at least one: the relaxed problem ignores the asset limit, and its bound is the plain QP. Weak relaxations make the tree large. Perspective reformulations, which replace w_i^2 by w_i^2 / z_i in a diagonal part of the variance, give much tighter bounds and are the standard remedy in cardinality-constrained portfolios.

## Solvers
**SCIP** is a global solver for mixed-integer nonlinear programmes: it proves optimality within its gap, also for non-convex quadratics. **Juniper** runs branch and bound with a nonlinear solver (Ipopt) at the nodes, optimal for convex problems and a heuristic otherwise. Commercial solvers (Gurobi, CPLEX, Mosek) are much faster on large instances.

## Cost
The worst-case search doubles with each binary variable; in practice, problems with tens to a few hundred binaries solve in seconds to minutes, and the time grows fast as k becomes tight.

## See Also
- [QP](qp.md) · [QCQP](qcqp.md) · [Portfolio Optimisation](portfolio-optimisation.md)
