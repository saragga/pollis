# Semidefinite Programming: Overview

A semidefinite program optimises a linear function of a symmetric matrix subject to linear constraints and the condition that the matrix be positive semidefinite. [Vandenberghe and Boyd (1996)](#ref-VB1996a) describe the constraint as nonlinear and nonsmooth, but convex, so that semidefinite programs are convex optimisation problems.

## What is a positive semidefinite matrix?

A symmetric matrix X is positive semidefinite when u'Xu ≥ 0 for every vector u, or equivalently when all its eigenvalues are non-negative. The set of such matrices is a convex cone: a sum of two of them, or a non-negative multiple of one, is again positive semidefinite.

Covariance matrices, Gram matrices of vectors, and kernel matrices are all positive semidefinite, which is one reason the constraint appears so often. A Gram matrix X with entries X_ij = v_i'v_j is positive semidefinite, and every positive semidefinite matrix can be written that way, which is the idea behind the max-cut relaxation of the panel.

## Why does it matter?

[Vandenberghe and Boyd (1996)](#ref-VB1996a) state that semidefinite programming unifies several standard problems, such as linear and quadratic programming, and finds many applications in engineering and combinatorial optimisation. Although much more general than linear programs, semidefinite programs are not much harder to solve: most interior-point methods for linear programming have been generalised to them, with polynomial worst-case complexity and very good performance in practice.

The theory behind those methods is that of [Nesterov and Nemirovskii (1994)](#ref-NN1994a), the first unified theory of polynomial-time interior-point methods, with a conic formulation in which duality is completely symmetric.

## Where semidefinite programs appear

| Field | Example | Panel |
|---|---|---|
| Eigenvalue optimisation | The smallest or largest eigenvalue of a symmetric matrix | **Semidefinite Programming** with `tr(X) == 1` |
| Combinatorial optimisation | Bounds for max-cut and two-way partitioning | **SDP Relaxation** |
| Control | Lyapunov inequalities and other LMIs | [LMI Constraints](lmi.md) |
| Statistics | Covariance and kernel fitting | **Semidefinite Programming** with constraints of one's own |

[Vandenberghe and Boyd (1996)](#ref-VB1996a) note that eigenvalue problems arise in control theory, structural optimisation, graph theory and combinatorial optimisation. [Boyd, El Ghaoui, Feron and Balakrishnan (1994)](#ref-BGFB1994a) show that a wide variety of problems from control theory can be cast as LMIs.

## Relaxations of hard problems

Many hard problems with decisions of ±1 can be written with the matrix x x', which is positive semidefinite and of rank one. Dropping the rank condition leaves a semidefinite program whose value bounds the original problem, as [Boyd and Vandenberghe (2004)](#ref-BV2004a) show for the two-way partitioning problem.

[Goemans and Williamson (1995)](#ref-GW1995a) used such a relaxation for max-cut, with a randomised rounding that delivers cuts of expected value at least 0.87856 times the optimal value. They describe it as the first use of semidefinite programming in the design of approximation algorithms.

## How the panel is organised

The panel solves one of two problems, and the actions examine the solution.

1. **Matrix Heatmap** and **Eigenvalue Spectrum** show the optimal matrix.
2. **Feasibility Check**, **Rank Check** and **Duality Gap** certify it.
3. **Sensitivity Analysis** and **Parametric Sweep** show how the optimum responds to the data.
4. **Solver Comparison** and **vs Baseline** set it against other solvers and simple bounds.
5. **Dual Matrix** and **Eigenvector Extraction** read the solution.

The [SDP](sdp.md) and [SDP Relaxations](sdprelax.md) pages describe the two problems, and [Duality](duality.md) the certificates.

## References

<a id="ref-BGFB1994a"></a>Boyd, S., El Ghaoui, L., Feron, E., & Balakrishnan, V. (1994). *Linear Matrix Inequalities in System and Control Theory*. SIAM. [doi:10.1137/1.9781611970777](https://doi.org/10.1137/1.9781611970777)

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-GW1995a"></a>Goemans, M. X., & Williamson, D. P. (1995). Improved Approximation Algorithms for Maximum Cut and Satisfiability Problems Using Semidefinite Programming. *Journal of the ACM* 42(6), 1115-1145. [doi:10.1145/227683.227684](https://doi.org/10.1145/227683.227684)

<a id="ref-NN1994a"></a>Nesterov, Y., & Nemirovskii, A. (1994). *Interior-Point Polynomial Algorithms in Convex Programming*. SIAM. [doi:10.1137/1.9781611970791](https://doi.org/10.1137/1.9781611970791)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
