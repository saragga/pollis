# Mixed-Integer Convex Programming — Overview

Many decisions combine a convex model with yes-or-no choices: which assets to hold, which predictors to keep, which items to pack. Convex cones express the continuous part (risks, residual norms, log-likelihoods), and integer variables express the choices. Together they give a **mixed-integer conic program** (MICP), which the Mixed-Integer Convex Programming panel writes in JuMP and solves with Pajarito.jl.

## Why Write a Mixed-Integer Convex Problem in Conic Form?

A conic program states every nonlinear part as membership of a cone:

- the **second-order cone** for Euclidean norms, risks, and variances;
- the **exponential cone** for logarithms, exponentials, and the logistic loss;
- the **positive semidefinite cone** for matrix inequalities.

Conic solvers return certificates: a dual point that proves optimality or infeasibility. Pajarito turns those certificates into linear cuts ([Coey, Lubin and Vielma (2020)](#ref-CLV2020a)), so the continuous part of every model in the Mixed-Integer Convex Programming panel is written with cones.

## Mixed-Integer Convex or Mixed-Integer Conic?

A **mixed-integer convex program** is one whose continuous relaxation, with the integrality dropped, is convex, and a **mixed-integer conic program** is one written in conic form. [Coey, Lubin and Vielma (2020)](#ref-CLV2020a) solve mixed-integer convex problems stated in conic form: the cuts of Pajarito come from the dual certificates of the conic subproblems, so every model of the Mixed-Integer Convex Programming panel states its nonlinear parts as cones. A convex model with integer variables written with general smooth functions, and not with cones, belongs in the **Mixed-Integer Nonlinear Programming** panel.

## How Does Pajarito's Outer Approximation Work?

Pajarito alternates between two solvers ([Coey, Lubin and Vielma (2020)](#ref-CLV2020a)):

1. A **mixed-integer linear** master problem, in which each cone is replaced by the linear cuts collected so far. Its optimum is a bound and proposes values for the integer variables. The panel solves it with HiGHS, whose dual simplex method [Huangfu and Hall (2018)](#ref-HH2018a) describe.
2. A **continuous conic** subproblem with those integers fixed. Its solution is a candidate, and its dual certificate gives new cuts that remove the master's proposal if it violated a cone.

The loop stops when the bound and the best candidate meet. Cuts are valid because the cones are convex, so the method is exact; the cost is the number of master solves.

## Choosing the Conic Solver for Pajarito

- **Clarabel** is an interior-point solver for conic programs with quadratic objectives, covering the second-order, exponential, power and positive semidefinite cones ([Goulart and Chen (2024)](#ref-GC2024a)).
- **Hypatia** is a generic primal-dual interior-point solver whose many cones, among them root-determinant and log-determinant cones, allow natural conic formulations ([Coey, Kapelevich and Vielma (2022)](#ref-CKV2022a)).

The **Conic Solver Comparison** solves the problem with each as Pajarito's conic solver, and reports the status, the objective and the seconds. If a solve ends with `ITERATION_LIMIT`, `TIME_LIMIT` or `OTHER_ERROR`, rerun it with the other conic solver before changing the model.

## Big-M Bounds and the Relaxation Gap

Linking a continuous variable to a binary with `-M z <= x <= M z` is simple but weak when M is large: the continuous relaxation can switch many binaries partly on. Choose M as small as the problem allows; [Bertsimas, King and Mazumder (2016)](#ref-BKM2016a) write best subset selection as a mixed-integer program with such bounds on the coefficients. The **Relaxation Gap** step measures the difference between the integer optimum and the continuous relaxation, which shows how much the integrality matters and how hard the search is, and **vs Rounding Heuristic** compares the exact optimum with a rounded relaxation.

## The Four Tabs of Mixed-Integer Convex Programming

- **Cardinality Portfolio**: the minimum-risk portfolio with a target expected return, holding at most k assets.
- **Best Subset Regression**: least squares with at most k non-zero coefficients ([Bertsimas, King and Mazumder (2016)](#ref-BKM2016a)).
- **Sparse Logistic Regression**: the logistic loss through exponential cones, with at most k predictors.
- **Chance-Constrained Knapsack**: items with normally distributed weights must fit the capacity with a given probability, which is a second-order cone constraint.

The **Parametric Sweep** varies the **Cardinality k**, or the **Capacity C** of the knapsack.

## References

<a id="ref-BKM2016a"></a>Bertsimas, D., King, A. and Mazumder, R. (2016). Best Subset Selection via a Modern Optimization Lens. *The Annals of Statistics* 44(2), 813–852. [doi:10.1214/15-AOS1388](https://doi.org/10.1214/15-AOS1388)

<a id="ref-CKV2022a"></a>Coey, C., Kapelevich, L. and Vielma, J. P. (2022). Solving Natural Conic Formulations with Hypatia.jl. *INFORMS Journal on Computing* 34(5), 2686–2699. [doi:10.1287/ijoc.2022.1202](https://doi.org/10.1287/ijoc.2022.1202)

<a id="ref-CLV2020a"></a>Coey, C., Lubin, M. and Vielma, J. P. (2020). Outer Approximation with Conic Certificates for Mixed-Integer Convex Problems. *Mathematical Programming Computation* 12(2), 249–293. [doi:10.1007/s12532-020-00178-3](https://doi.org/10.1007/s12532-020-00178-3)

<a id="ref-GC2024a"></a>Goulart, P. J. and Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [arXiv:2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-HH2018a"></a>Huangfu, Q. and Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119–142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

## See Also
- [Factsheet](factsheet.md)
