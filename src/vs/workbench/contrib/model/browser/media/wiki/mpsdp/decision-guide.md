# Semidefinite Programming: Decision Guide

The choice between the two problems follows from the question asked, and the choice of solver from the size of the problem and the accuracy wanted. Beyond the panel, semidefinite programming is one of several conic forms, and the simplest one that fits is usually the best to use.

## Which problem?

| Situation | Choose | Reason |
|---|---|---|
| A matrix to optimise, with linear constraints | **Semidefinite Programming** | The standard form of the panel |
| The extreme eigenvalues of a symmetric matrix | **Semidefinite Programming**, with `tr(X) == 1` | The optimum equals the smallest or largest eigenvalue |
| A partition of a graph that cuts the most weight | **SDP Relaxation** | A bound and a rounded partition |
| Decisions of ±1 with a quadratic objective | **SDP Relaxation** | The same lifting of x x' |

The decision table on the panel gives the same choices.

## Which solver?

| Situation | Choose | Reason |
|---|---|---|
| Small and medium problems, high accuracy | Clarabel | Interior point, the panel's default |
| Large sparse problems | COSMO | Low cost per iteration, chordal decomposition |
| Very large problems, where a rough bound suffices | SCS | Operator splitting, with a homogeneous self-dual embedding |
| Cones beyond the standard ones | Hypatia | A generic interface for further cones |

[Goulart and Chen (2024)](#ref-GC2024a) describe Clarabel's support for chordal decomposition of semidefinite cones. [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) present COSMO as particularly efficient for large problems, such as the semidefinite programs that arise in portfolio optimisation, graph theory and robust control. [Coey, Kapelevich and Vielma (2022)](#ref-CKV2022a) introduce Hypatia's generic interface for exotic cones, through which natural formulations can be solved directly. **Solver Comparison** runs all four on the problem at hand.

## How large can n be?

The variable X has n(n + 1)/2 distinct entries, so the cost grows quickly with **n**. [Boyd and Vandenberghe (2004)](#ref-BV2004a) note that the dual SDP of the two-way partitioning problem can be solved efficiently even for n around 1000, while checking every partition is possible only for small problems, around n ≤ 30.

**vs Baseline** uses brute force up to n = 20, which gives the exact maximum cut to compare with the relaxation. Beyond that, the SDP bound is the reference.

## When is another panel the better place?

| Situation | Better place |
|---|---|
| A linear objective with second-order cone or exponential cone constraints | **Convex and Conic Programming** |
| Polynomial non-negativity, or polynomial optimisation | **Polynomial Programming** |
| A nonlinear objective with smooth constraints | **Nonlinear Programming** |
| Integer decisions alongside cones | **Mixed-Integer Conic Programming** |

[Vandenberghe and Boyd (1996)](#ref-VB1996a) note that semidefinite programming includes linear and quadratic programming, but that a problem cast as an SDP can be solved less efficiently than in a more specialised form, as they show for quadratically constrained quadratic programs, better handled as second-order cone problems.

## A sensible order of work

1. Write the problem: **Cost Matrix C** and **Constraint**, or **Weight Matrix W**.
2. Solve with Clarabel, and read **Feasibility Check** and **Duality Gap**.
3. Read **Eigenvalue Spectrum** and **Rank Check**.
4. Compare with **vs Baseline**.
5. Read the solution with **Eigenvector Extraction**, **Dual Matrix** and **Sensitivity Analysis**.
6. For larger problems, compare solvers with **Solver Comparison**.

Step 2 comes before reading any value, because a solution without a small duality gap and feasible statuses is not yet a solution.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-CKV2022a"></a>Coey, C., Kapelevich, L., & Vielma, J. P. (2022). Solving Natural Conic Formulations with Hypatia.jl. *INFORMS Journal on Computing* 34(5), 2686-2699. [doi:10.1287/ijoc.2022.1202](https://doi.org/10.1287/ijoc.2022.1202)

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
