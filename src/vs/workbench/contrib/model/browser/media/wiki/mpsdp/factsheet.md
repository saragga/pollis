# Semidefinite Programming: Factsheet

A quick reference for **Semidefinite Programming**: the two problems, the inputs, the solvers, and what each action computes. JuMP builds both problems with a positive semidefinite matrix variable, and one of four conic solvers solves them.

## The two problems side by side

| Problem | Variable | Objective | Constraints |
|---|---|---|---|
| **Semidefinite Programming** | X, n × n, positive semidefinite | tr(C X), minimised or maximised | One scalar linear constraint, by default tr(X) == 1 |
| **SDP Relaxation** | X, n × n, positive semidefinite | tr(L X) / 4, maximised | diag(X) .== 1 |

L is the Laplacian of the graph with weights W, the diagonal matrix of node degrees minus W. Both problems are semidefinite programs in the standard form of [Boyd and Vandenberghe (2004)](#ref-BV2004a): a linear function of a symmetric matrix variable, linear equality or inequality constraints, and the constraint that the matrix be positive semidefinite.

## Inputs

| Input | Default | Used by | Meaning |
|---|---|---|---|
| **n** | 6 | Both | Size of X; for the relaxation, the number of nodes |
| **Cost Matrix C** | `Symmetric(randn(n, n))` | **Semidefinite Programming** | Symmetric cost matrix |
| **Constraint** | `tr(X) == 1` | **Semidefinite Programming** | One scalar linear constraint in X |
| **Sense** | Minimise | **Semidefinite Programming** | Minimise or maximise |
| **Weight Matrix W** | A random graph, each edge present with probability 0.5 | **SDP Relaxation** | Non-negative symmetric edge weights |
| **Solver** | Clarabel | Both | Clarabel, COSMO, SCS or Hypatia |

Both programs start with `Random.seed!(1)`, so the random defaults are the same on every run.

## Solvers

| Solver | Method | Source |
|---|---|---|
| Clarabel | Interior point, with a homogeneous embedding | [Goulart and Chen (2024)](#ref-GC2024a) |
| COSMO | Operator splitting, with chordal decomposition for sparse SDPs | [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) |
| SCS | Operator splitting, with a homogeneous self-dual embedding | [O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a) |
| Hypatia | Generic conic primal-dual interior point, written in Julia | [Coey, Kapelevich and Vielma (2022)](#ref-CKV2022a) |

All four are called through JuMP, so changing **Solver** changes nothing else in the model.

## What a run prints

| Problem | Output | Meaning |
|---|---|---|
| **Semidefinite Programming** | `status` | JuMP's termination status |
| | `objective` | Optimal value of tr(C X) |
| | `eigenvalues_C` | Eigenvalues of C, for comparison |
| **SDP Relaxation** | `sdp_bound` | Optimal value of the relaxation, an upper bound on the maximum cut |
| | `cut` | Value of the best rounded partition |
| | `ratio` | `cut` divided by `sdp_bound` |
| | `partition` | The rounded partition, a vector of ±1 |

The relaxation rounds X by drawing 100 random hyperplanes through the node vectors and keeping the best cut, a randomised rounding in the manner of [Goemans and Williamson (1995)](#ref-GW1995a).

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Matrix Heatmap** | The optimal X as a heat map |
| Visualise | **Eigenvalue Spectrum** | Eigenvalues of X in decreasing order |
| Diagnose | **Feasibility Check** | Termination, primal and dual status, `min_eigenvalue`, `violated` |
| Diagnose | **Rank Check** | Numerical rank of X and its eigenvalues |
| Diagnose | **Duality Gap** | `primal`, `dual`, `relative_gap` |
| Predict | **Sensitivity Analysis** | Shadow price of each scalar constraint |
| Predict | **Parametric Sweep** | Optimal value over 15 right-hand sides, or best cut against rounding trials |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Solver Comparison** | Status, objective and time for all four solvers |
| Compare | **vs Baseline** | The optimum against the extreme eigenvalues of C, or the cut against a random partition and brute force |
| Interpret | **Dual Matrix** | The dual matrix S, `complementarity` tr(X S), `dual_eigenvalues` |
| Interpret | **Eigenvector Extraction** | Leading eigenvalue and eigenvector of X, or the partition by its signs |

## Packages and textbooks

JuMP, described by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), declares X with `@variable(model, X[1:n, 1:n], PSD)` and passes the problem to the solver. `LinearAlgebra` gives the eigenvalues and the Cholesky factor, and `Plots` draws the charts.

[Boyd and Vandenberghe (2004)](#ref-BV2004a) cover semidefinite programs, duality and interior-point methods. [Vandenberghe and Boyd (1996)](#ref-VB1996a) survey the theory and applications of semidefinite programs, and [Nesterov and Nemirovskii (1994)](#ref-NN1994a) give the unified theory of polynomial-time interior-point methods on which the solvers rest.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-CKV2022a"></a>Coey, C., Kapelevich, L., & Vielma, J. P. (2022). Solving Natural Conic Formulations with Hypatia.jl. *INFORMS Journal on Computing* 34(5), 2686-2699. [doi:10.1287/ijoc.2022.1202](https://doi.org/10.1287/ijoc.2022.1202)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GW1995a"></a>Goemans, M. X., & Williamson, D. P. (1995). Improved Approximation Algorithms for Maximum Cut and Satisfiability Problems Using Semidefinite Programming. *Journal of the ACM* 42(6), 1115-1145. [doi:10.1145/227683.227684](https://doi.org/10.1145/227683.227684)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-NN1994a"></a>Nesterov, Y., & Nemirovskii, A. (1994). *Interior-Point Polynomial Algorithms in Convex Programming*. SIAM. [doi:10.1137/1.9781611970791](https://doi.org/10.1137/1.9781611970791)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N., & Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042-1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
