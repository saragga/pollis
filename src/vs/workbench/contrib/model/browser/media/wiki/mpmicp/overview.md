# Overview

Many decisions combine a convex model with yes-or-no choices: which assets to hold, which predictors to keep, which items to pack. Convex cones express the continuous part (risks, residual norms, log-likelihoods), and integer variables express the choices. Together they give a **mixed-integer conic program** (MICP).

## Why Conic Form

A conic program states every nonlinear part as membership of a cone:

- the **second-order cone** for Euclidean norms, risks, and variances;
- the **exponential cone** for logarithms, exponentials, and the logistic loss;
- the **positive semidefinite cone** for matrix inequalities.

Conic solvers return certificates: a dual point that proves optimality or infeasibility. Pajarito turns those certificates into linear cuts.

## Mixed-Integer Convex or Mixed-Integer Conic?

A **mixed-integer convex program** is one whose continuous relaxation, with the integrality dropped, is convex, and a **mixed-integer conic program** is one written in conic form. [Coey, Lubin and Vielma (2020)](#ref-CLV2020a) solve mixed-integer convex problems stated in conic form: the cuts of Pajarito come from the dual certificates of the conic subproblems, so every model of the Mixed-Integer Convex Programming panel states its nonlinear parts as cones. A convex model with integer variables written with general smooth functions, and not with cones, belongs in the **Mixed-Integer Nonlinear Programming** panel.

## Outer Approximation

Pajarito alternates between two solvers:

1. A **mixed-integer linear** master problem, in which each cone is replaced by the linear cuts collected so far. Its optimum is a bound and proposes values for the integer variables.
2. A **continuous conic** subproblem with those integers fixed. Its solution is a candidate, and its dual certificate gives new cuts that remove the master's proposal if it violated a cone.

The loop stops when the bound and the best candidate meet. Cuts are valid because the cones are convex, so the method is exact; the cost is the number of master solves.

## Choosing the Conic Solver

- **Clarabel** is an interior-point solver for second-order, exponential, power, and positive semidefinite cones; it is usually fast and robust on subproblems.
- **Hypatia** is an interior-point solver with many more cones, including root-determinant and log-determinant cones, but on some subproblems it can stall or fail numerically.

If a solve ends with `ITERATION_LIMIT`, `TIME_LIMIT`, or `OTHER_ERROR`, rerun with the other conic solver before changing the model.

## Big-M and the Strength of a Formulation

Linking a continuous variable to a binary with `-M z <= x <= M z` is simple but weak when M is large: the continuous relaxation can switch many binaries partly on. Choose M as small as the problem allows. The relaxation gap, the difference between the integer optimum and the continuous relaxation, measures how much the integrality matters and how hard the search is.

## The Four Problems in This Panel

- **Cardinality Portfolio**: minimum-risk portfolio holding at most k assets.
- **Best Subset Regression**: least squares with at most k non-zero coefficients (Bertsimas, King and Mazumder, 2016).
- **Sparse Logistic Regression**: logistic loss through exponential cones, with at most k predictors.
- **Chance-Constrained Knapsack**: items with normally distributed weights must fit the capacity with a given probability, which is a second-order cone constraint.

## References

<a id="ref-CLV2020a"></a>Coey, C., Lubin, M. and Vielma, J. P. (2020). Outer Approximation with Conic Certificates for Mixed-Integer Convex Problems. *Mathematical Programming Computation* 12(2), 249–293. [doi:10.1007/s12532-020-00178-3](https://doi.org/10.1007/s12532-020-00178-3)

## See Also
- [Factsheet](factsheet.md)
