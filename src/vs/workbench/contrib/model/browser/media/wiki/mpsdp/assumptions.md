# Semidefinite Programming: Assumptions

What the two problems take for granted about the data, the constraint and the solution, and what the duality results of the theory require.

## Symmetric data

The objective tr(C X) is a general linear function of a symmetric matrix, as [Boyd and Vandenberghe (2004)](#ref-BV2004a) note, and the data matrices of a standard form semidefinite program are symmetric. **Cost Matrix C** should therefore be symmetric, which the default `Symmetric(randn(n, n))` guarantees.

**Weight Matrix W** is symmetric as well, with non-negative entries and zeros on the diagonal: the default draws the upper triangle and adds its transpose. A non-symmetric W describes a directed graph, which the max-cut relaxation does not model.

## A feasible and bounded problem

A semidefinite program can be infeasible, or unbounded in the direction of optimisation. With the default `tr(X) == 1`, the feasible set is bounded: a positive semidefinite matrix with unit trace has all eigenvalues between 0 and 1. A constraint such as `X[1, 1] <= 2`, alone, leaves the rest of X free to grow, and the objective may then be unbounded.

**Feasibility Check** reports the termination, primal and dual status, which distinguish an optimal solution from infeasibility or unboundedness.

## Strict feasibility

[Vandenberghe and Boyd (1996)](#ref-VB1996a) show that the optimal values of a semidefinite program and its dual are equal when either problem is strictly feasible, and that both optimal sets are non-empty when both are strictly feasible. They also give examples, feasible but not strictly feasible, with a nonzero duality gap, which cannot happen in linear programming.

For the standard form, strict feasibility means a positive definite X that satisfies the linear constraints, the Slater condition of [Boyd and Vandenberghe (2004)](#ref-BV2004a). The default problem has one, the identity divided by n, and so does the relaxation, with the identity itself.

## One scalar constraint

**Semidefinite Programming** takes one scalar linear constraint in X through **Constraint**: an equality or an inequality, such as `tr(X) == 1` or `X[1, 1] + X[2, 2] <= 2`. **Parametric Sweep** varies its right-hand side.

The relaxation has n equality constraints, one for each diagonal entry. Problems with more constraints, or with LMIs of their own, are written in JuMP in the same way, as the [LMI Constraints](lmi.md) page describes.

## Size

The matrix variable has n(n + 1)/2 distinct entries, so the problem grows with the square of **n**. [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) describe COSMO's low cost per iteration as particularly efficient for large problems, and its chordal decomposition as a way of exploiting sparsity in large structured SDPs. [Goulart and Chen (2024)](#ref-GC2024a) also provide chordal decomposition in Clarabel.

**vs Baseline** finds the maximum cut by brute force only when **n** is at most 20, since the number of partitions doubles with each node.

## Numerical tolerances

Solvers return X positive semidefinite up to a tolerance, so the smallest eigenvalue can be slightly negative. **Feasibility Check** reports `min_eigenvalue` and lists any constraint violated by more than 1e-6; **Rank Check** counts as nonzero the eigenvalues larger than 1e-6 times the largest. The rounding adds 1e-8 times the identity to X before its Cholesky factorisation, so that the factor exists when X is singular.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
