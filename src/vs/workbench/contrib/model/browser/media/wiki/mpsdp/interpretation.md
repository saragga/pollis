# Semidefinite Programming: Interpretation

The solution of a semidefinite program is a matrix, with a dual matrix beside it. Reading it means looking at its structure, its eigenvectors, the prices of its constraints, and, for the relaxation, the partition it leads to.

## Reading the optimal matrix

**Matrix Heatmap** draws X with a diverging colour scale centred on zero, so that positive and negative entries stand out.

| Pattern | Reading |
|---|---|
| Mass concentrated on a few entries | A low-rank solution aligned with a few coordinates |
| A checkerboard of signs | A rank-one X = v v' with v of mixed signs |
| Entries of ±1 off the diagonal, for the relaxation | Pairs of nodes on the same side, or on opposite sides |
| Intermediate values | A solution that mixes several directions |

For the relaxation, X_ij is the inner product of the unit vectors of nodes i and j. A value near 1 places them on the same side of most hyperplanes, and a value near −1 on opposite sides.

## What do the eigenvectors say?

**Eigenvector Extraction** takes the eigenvector of the largest eigenvalue of X.

For **Semidefinite Programming**, it prints the leading eigenvalue, its share of the trace, and the eigenvector. A share near 1 means a rank-one solution, and with `tr(X) == 1` the vector is then an eigenvector of C for its smallest eigenvalue when minimising, or its largest when maximising.

For **SDP Relaxation**, it forms a partition from the signs of the eigenvector and prints its cut beside the rounded cut. The heuristic is the one that [Boyd and Vandenberghe (2004)](#ref-BV2004a) suggest for the two-way partitioning problem: take the eigenvector of the largest eigenvalue of the optimal X, and its signs as the guess for a good partition. It is deterministic, while the rounding is random.

## What are the constraints worth?

**Sensitivity Analysis** prints the shadow price of each scalar constraint. JuMP defines the shadow price as the change in the objective from an infinitesimal relaxation of the constraint, and translates it from the dual value according to the sense of the objective and of the constraint.

For the default problem, the constraint `tr(X) == 1` fixes the scale of X. Since tr(C X) is linear in X, doubling the right-hand side doubles the optimum, so the shadow price equals the optimal value itself in size. For the relaxation, the shadow prices of the n diagonal constraints give the dual vector of the problem, up to sign.

## How does the optimum respond?

**Parametric Sweep** varies one quantity and plots the result.

For **Semidefinite Programming**, it solves again for 15 right-hand sides of **Constraint**, from a quarter to twice the original, then restores the original. A straight line through the origin shows a constraint that only sets the scale, as `tr(X) == 1` does; a bend shows the point where the solution changes structure.

For **SDP Relaxation**, it plots the best rounded cut against the number of rounding trials, from 1 to 200, with the SDP bound as a dashed line. The rounding is reseeded before each count, so the trials are nested and the best cut can only rise with their number. It stays no larger than the maximum cut, which is no larger than the bound, so the distance to the dashed line includes a gap that no number of trials closes when the bound exceeds the maximum.

## Reading the cut

| Output | Reading |
|---|---|
| `sdp_bound` | An upper bound on the maximum cut |
| `cut` | The value of the partition found |
| `ratio` | The share of the bound reached |
| `partition` | The side of each node, +1 or −1 |

Since the bound is at least the maximum cut, `ratio` is a lower bound on the share of the optimum that the partition reaches. [Goemans and Williamson (1995)](#ref-GW1995a) prove that their randomised rounding delivers cuts of expected value at least 0.87856 times the optimal value, for graphs with non-negative weights.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-GW1995a"></a>Goemans, M. X., & Williamson, D. P. (1995). Improved Approximation Algorithms for Maximum Cut and Satisfiability Problems Using Semidefinite Programming. *Journal of the ACM* 42(6), 1115-1145. [doi:10.1145/227683.227684](https://doi.org/10.1145/227683.227684)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
