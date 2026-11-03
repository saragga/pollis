# Semidefinite Programming: Duality

Every semidefinite program has a dual, another semidefinite program, whose value bounds the primal's. The dual solution certifies optimality, prices the constraints, and appears in the panel as the dual matrix S and the duality gap.

## The dual of the standard form

[Boyd and Vandenberghe (2004)](#ref-BV2004a) derive the Lagrange dual of a cone program in standard form, minimising c'x subject to A x = b and x in a proper cone, as maximising b'y subject to c − A'y lying in the dual cone. The cone of positive semidefinite matrices is self-dual, so for the standard form SDP the dual is

- maximise b'y
- subject to S = C − (y_1 A_1 + ... + y_p A_p)
- S ⪰ 0

with one multiplier y_i for each linear constraint, and the dual matrix S as the slack. Strong duality holds under the Slater condition: some positive definite X satisfies the linear constraints.

## Weak duality and the gap

[Vandenberghe and Boyd (1996)](#ref-VB1996a) show that the objective of any dual feasible point is no better than that of any primal feasible point, so each dual feasible point bounds the primal optimal value. The difference between the two objectives is the duality gap, a linear function of the primal and dual variables, which for the standard form equals tr(X S).

**Duality Gap** prints the primal objective, the dual objective from JuMP's `dual_objective_value`, and their relative gap. A gap near zero certifies that X is optimal to that precision, independently of how the solver found it.

## When is the gap zero?

[Vandenberghe and Boyd (1996)](#ref-VB1996a) prove that the primal and dual optimal values are equal if either problem is strictly feasible, and that both have optimal solutions if both are. Unlike linear programming, semidefinite programming admits feasible problems with a finite nonzero duality gap at the optimum; their examples are feasible but not strictly feasible.

The panel's problems are strictly feasible on both sides in their defaults, so the gap closes. A constraint of one's own that leaves no positive definite feasible X, such as fixing a diagonal entry to zero, removes that guarantee.

## Complementary slackness

When both optimal sets are non-empty, the gap tr(X S) is zero at an optimal pair. Since X and S are both positive semidefinite, [Vandenberghe and Boyd (1996)](#ref-VB1996a) conclude that their product X S is zero, the complementary slackness condition: the ranges of X and S are orthogonal. It generalises the complementary slackness of linear programming, which it becomes when X and S are diagonal.

**Dual Matrix** reads the dual of the constraint `X in PSD` from JuMP, reshapes it into the symmetric matrix S, and prints `complementarity`, tr(X S), with the eigenvalues of S.

| Output | Reading |
|---|---|
| `complementarity` near zero | X and S optimal together |
| `dual_eigenvalues` all non-negative | S feasible for the dual |
| Zero eigenvalues of S | Directions in which X can be nonzero |

Since the ranges are orthogonal, the rank of X plus the rank of S is at most n. A dual matrix with n − 1 positive eigenvalues forces X to have rank one.

## The eigenvalue example

For the default problem, minimising tr(C X) with tr(X) = 1, the dual has one multiplier y and the constraint S = C − y I ⪰ 0. The largest y for which C − y I stays positive semidefinite is the smallest eigenvalue of C, so the dual value equals the primal one.

S then has a zero eigenvalue in the direction of the eigenvector of C for its smallest eigenvalue, and X is concentrated in that direction, as complementary slackness requires.

## Shadow prices

The multipliers y_i are the sensitivities of the optimal value to the right-hand sides b_i. JuMP's `shadow_price`, used by **Sensitivity Analysis**, returns the change in the objective from an infinitesimal relaxation of a constraint, computed from the dual value with a sign that depends on the sense of the objective and of the constraint. The JuMP documentation notes that the function only translates signs from the dual, and that checking for an optimal primal-dual pair is up to the caller, which **Feasibility Check** and **Duality Gap** do.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md)
