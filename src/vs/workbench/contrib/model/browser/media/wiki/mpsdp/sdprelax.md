# Semidefinite Programming: SDP Relaxations

The **SDP Relaxation** problem of the panel: how a hard problem with decisions of ±1 becomes a semidefinite program, what its value bounds, and how its solution is rounded back to a decision.

## From ±1 decisions to a matrix

The max-cut problem asks for a partition of the nodes of a weighted graph into two sets that maximises the total weight of the edges between them. Writing the side of node i as x_i, equal to +1 or −1, the code evaluates the cut as

cut(x) = x' L x / 4

with L the graph Laplacian, the diagonal matrix of node degrees minus **Weight Matrix W**, as its comment states.

[Boyd and Vandenberghe (2004)](#ref-BV2004a) treat the same kind of problem, a quadratic objective over vectors with x_i² = 1, as two-way partitioning. They show that it can be cast in matrix form: optimise tr(W X) over the matrices X that are positive semidefinite, have unit diagonal and rank one, since such a matrix is exactly x x' for a vector of ±1.

## The relaxation

Dropping the rank condition gives the semidefinite program

- maximise tr(L X) / 4
- subject to X_ii = 1, for i = 1, ..., n
- X ⪰ 0

which the panel solves. Every partition gives a feasible X = x x' with the same objective, so the optimal value, `sdp_bound`, is at least the maximum cut.

[Vandenberghe and Boyd (1996)](#ref-VB1996a) describe the step in general: a relaxation replaces the non-convex constraint X = x x' by a convex one, and becomes the original problem again if a rank-one condition is added. When the optimal X happens to have rank one, the relaxation is exact and the partition can be read from it, which **Rank Check** tests.

## The Goemans-Williamson rounding

A positive semidefinite X with unit diagonal is the Gram matrix of n unit vectors, one per node, and the code finds them from the Cholesky factor V of X plus 1e-8 times the identity. A random vector r then defines a hyperplane through the origin, and `sign.(V' * r)` puts each node on the side of the hyperplane where its vector lies.

[Goemans and Williamson (1995)](#ref-GW1995a) present randomised approximation algorithms for max-cut that round the solution of such a relaxation, and that always deliver cuts of expected value at least 0.87856 times the optimal value. [Vandenberghe and Boyd (1996)](#ref-VB1996a) summarise their result as a bound from the relaxation at most 14% suboptimal.

Since V' r is normal with mean zero and covariance X plus 1e-8 times the identity, the procedure is also the randomised method that [Boyd and Vandenberghe (2004)](#ref-BV2004a) propose for two-way partitioning: draw samples from a normal distribution with covariance X, take their signs, and keep the best.

## Many trials, one partition

`round_cut` draws 100 hyperplanes and keeps the partition with the largest cut, `x_cut`. The guarantee concerns the expected value of one random cut, so the best of many is at least as good on average, and **Parametric Sweep** plots the best cut against the number of trials, from 1 to 200.

**Eigenvector Extraction** gives a deterministic alternative: the signs of the leading eigenvector of X, the heuristic that [Boyd and Vandenberghe (2004)](#ref-BV2004a) suggest beside the randomised one. Its cut is printed beside the rounded cut.

## How good is the bound?

| Quantity | Relation |
|---|---|
| Random partition | A reference with no optimisation |
| Rounded cut, `cut` | At most the maximum cut |
| Maximum cut | Found by **vs Baseline** for **n** up to 20 |
| `sdp_bound` | At least the maximum cut |

`ratio`, the rounded cut divided by the bound, is therefore a lower bound on the share of the maximum that the partition reaches. Where brute force is available, the gap between the maximum and the bound shows how tight the relaxation is for the graph at hand.

## Beyond max-cut

The same lifting applies to any quadratic problem in variables of ±1, and [Vandenberghe and Boyd (1996)](#ref-VB1996a) note that most semidefinite relaxations of NP-hard combinatorial problems are related to the relaxation they describe for quadratic programs. [Boyd and Vandenberghe (2004)](#ref-BV2004a) show that the Lagrange dual of the two-way partitioning problem is itself a semidefinite program, which gives a bound at least as good as the one from the smallest eigenvalue of W.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-GW1995a"></a>Goemans, M. X., & Williamson, D. P. (1995). Improved Approximation Algorithms for Maximum Cut and Satisfiability Problems Using Semidefinite Programming. *Journal of the ACM* 42(6), 1115-1145. [doi:10.1145/227683.227684](https://doi.org/10.1145/227683.227684)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
