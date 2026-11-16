# Mixed-Integer Convex Programming — Decision Guide

The choice of tab follows from the decision to be made and the convex model behind it, and the choice of conic solver from the cones the model needs. A problem with no integer variables, or with no cones, belongs in another panel.

## Which tab of Mixed-Integer Convex Programming?

| Situation | Choose | Reason |
|---|---|---|
| A portfolio of least risk that may hold only a few assets | **Cardinality Portfolio** | A second-order cone for the risk, a binary variable for each asset held |
| A linear regression with few non-zero coefficients | **Best Subset Regression** | A second-order cone for the residual norm, big-M binaries for the support |
| A classifier with few predictors | **Sparse Logistic Regression** | Exponential cones for the logistic loss, big-M binaries for the support |
| A selection of items whose uncertain total weight must fit | **Chance-Constrained Knapsack** | A second-order cone for the spread of the weight, a binary variable for each item |

[Bertsimas, King and Mazumder (2016)](#ref-BKM2016a) formulate best subset selection as a mixed-integer optimisation problem, the formulation behind the two regression tabs.

## Which conic solver for Pajarito?

| Situation | Choose | Reason |
|---|---|---|
| Second-order, exponential, power or positive semidefinite cones | Clarabel | An interior-point solver for these cones and quadratic objectives ([Goulart and Chen (2024)](#ref-GC2024a)) |
| Cones beyond those, such as log-determinant cones | Hypatia | A generic interior-point solver with many more cones ([Coey, Kapelevich and Vielma (2022)](#ref-CKV2022a)) |
| A solve that ends without `OPTIMAL` | The other one | A different subproblem solver often avoids the numerical difficulty |

The **Conic Solver** input sets the solver of Pajarito's continuous subproblems; the mixed-integer linear master problem is always solved by HiGHS ([Huangfu and Hall (2018)](#ref-HH2018a)).

## When is another panel better than Mixed-Integer Convex Programming?

| Situation | Better place |
|---|---|
| A convex model with no integer variables | **General Convex Programming**, or **Second-Order, Exponential and Power Cones** |
| A matrix variable that must be positive semidefinite, with no integer variables | **Semidefinite Programming** |
| Integer variables in a model that is linear throughout | **Linear Programming**, on its Mixed-Integer LP (MILP) tab |
| Integer variables in a model written with smooth nonlinear functions rather than cones | **Mixed-Integer Nonlinear Programming** |

The method of Pajarito, outer approximation with conic certificates ([Coey, Lubin and Vielma (2020)](#ref-CLV2020a)), applies to mixed-integer convex problems stated in conic form; a model outside that class needs another method.

## A sensible order of work in Mixed-Integer Convex Programming

1. Choose the tab, set the **Cardinality k**, the **Target Return** or the **Capacity C**, and the **Conic Solver**.
2. Check the **Feasibility Check** before reading any value.
3. Look at the **Solution**, the **Problem Picture** and the **Selected Variables**.
4. Measure what the integer constraints cost with the **Relaxation Gap** and **vs Rounding Heuristic**.
5. Run the **Parametric Sweep**, and for the two regressions the **Holdout Error**, to see how the optimum depends on k or C.
6. Read the **Price of the Integer Constraint**, and confirm the result with the **Conic Solver Comparison**.

## References

<a id="ref-BKM2016a"></a>Bertsimas, D., King, A. and Mazumder, R. (2016). Best Subset Selection via a Modern Optimization Lens. *The Annals of Statistics* 44(2), 813–852. [doi:10.1214/15-AOS1388](https://doi.org/10.1214/15-AOS1388)

<a id="ref-CKV2022a"></a>Coey, C., Kapelevich, L. and Vielma, J. P. (2022). Solving Natural Conic Formulations with Hypatia.jl. *INFORMS Journal on Computing* 34(5), 2686–2699. [doi:10.1287/ijoc.2022.1202](https://doi.org/10.1287/ijoc.2022.1202)

<a id="ref-CLV2020a"></a>Coey, C., Lubin, M. and Vielma, J. P. (2020). Outer Approximation with Conic Certificates for Mixed-Integer Convex Problems. *Mathematical Programming Computation* 12(2), 249–293. [doi:10.1007/s12532-020-00178-3](https://doi.org/10.1007/s12532-020-00178-3)

<a id="ref-GC2024a"></a>Goulart, P. J. and Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [arXiv:2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-HH2018a"></a>Huangfu, Q. and Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119–142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
