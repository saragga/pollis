# Semidefinite Programming: Diagnostics

A semidefinite program comes with its own certificates: the solver's status, the feasibility of the matrix, the gap between the primal and dual values, and the rank of the solution. The checks read each one, and compare solvers and simple bounds.

## Did the solver succeed?

**Feasibility Check** reports the solver's view and checks the solution.

| Output | Reading |
|---|---|
| `termination` | `OPTIMAL` for a solved problem; `ALMOST_OPTIMAL` or `SLOW_PROGRESS` for a looser solution |
| `primal` | `FEASIBLE_POINT` when the returned X satisfies the constraints |
| `dual` | `FEASIBLE_POINT` when a dual solution is available |
| `min_eigenvalue` | Smallest eigenvalue of X, zero or slightly negative within tolerance |
| `violated` | Constraints violated by more than 1e-6; an empty dictionary means none |

JuMP's `primal_feasibility_report` measures each violation as the distance between the value of the constraint and the nearest point of its set. `INFEASIBLE` or `DUAL_INFEASIBLE` as termination points to a constraint that cannot be met, or an objective without bound.

## Is the solution optimal?

**Duality Gap** prints the primal and dual objective values and their relative gap, the absolute difference divided by one plus the absolute primal value.

[Vandenberghe and Boyd (1996)](#ref-VB1996a) show that a dual feasible point gives a bound on the primal optimal value, so a pair of feasible points with values close together certifies that both are nearly optimal, whatever the method that found them. They describe the duality gap as the width of the uncertainty interval for the optimal value.

| `relative_gap` | Reading |
|---|---|
| Below 1e-6 | Optimal to the precision of an interior-point solver |
| Small, but more than 1e-6 | A solution to a looser tolerance |
| Large | Not converged, or a problem without strict feasibility |

The [Duality](duality.md) page explains the dual problem.

## What is the rank of X?

**Rank Check** counts the eigenvalues of X larger than 1e-6 times the largest, and **Eigenvalue Spectrum** draws them.

| Spectrum | Reading |
|---|---|
| One nonzero eigenvalue | X has rank one, X = v v' |
| A few nonzero eigenvalues | A low-rank solution |
| Many similar eigenvalues | A solution spread over many directions |
| A negative eigenvalue beyond tolerance | X is not positive semidefinite, and the solution should not be trusted |

For the relaxation, a rank-one X gives an optimal partition, as [Boyd and Vandenberghe (2004)](#ref-BV2004a) show for the two-way partitioning problem: a feasible rank-one matrix has the form x x' with entries of x equal to ±1. For the default problem with `tr(X) == 1`, a rank-one X is the outer product of an eigenvector of C with itself.

## Do the solvers agree?

**Solver Comparison** solves the same model with Clarabel, COSMO, SCS and Hypatia, and prints the status, the objective and the time of each, then returns to the chosen solver.

| Pattern | Reading |
|---|---|
| Same objective to many digits | A well-posed problem solved to optimality |
| Objectives agree to a few digits | Solutions to different tolerances |
| Statuses differ | Read each solver's `status` before its objective |

[Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) describe COSMO as alternating, at each step, between a linear system with a constant matrix and a projection onto convex sets, which keeps each iteration cheap. The times include JuMP's model copy to each solver, and the first run of each includes compilation.

## Simple bounds as checks

**vs Baseline** compares the optimum with values known in advance.

For **Semidefinite Programming**, it prints the smallest and largest eigenvalues of C beside the optimum. With `tr(X) == 1`, the minimum of tr(C X) equals the smallest eigenvalue and the maximum the largest, so a mismatch shows a solver problem. With another constraint, the eigenvalues still give a scale for the result.

For **SDP Relaxation**, it prints the SDP bound, the rounded cut, the cut of a random partition, and, for **n** up to 20, the maximum cut by brute force. The rounded cut can be no larger than the maximum, and the maximum no larger than the bound; the random partition shows how much the relaxation adds over chance.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| `DUAL_INFEASIBLE` | The objective is unbounded under **Constraint** | Add a constraint that bounds X |
| `INFEASIBLE` | **Constraint** cannot be met by a PSD matrix | Check its sign and right-hand side |
| A large `relative_gap` | The solver stopped before convergence | Read `termination` |
| Cholesky error in the rounding | X far from positive semidefinite | Check `min_eigenvalue` |
| Brute force shows `missing` | **n** larger than 20 | Use the SDP bound instead |

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
