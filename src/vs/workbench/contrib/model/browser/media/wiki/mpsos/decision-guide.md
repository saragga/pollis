# Polynomial Programming: Decision Guide

The choice between the two problems follows from the question asked, the relaxation degree from the accuracy wanted and the size affordable, and the solver from the size of the semidefinite program.

## Which problem?

| Situation | Choose | Reason |
|---|---|---|
| Proving that p ≥ 0 everywhere | **Sum of Squares Certification** | A Gram matrix certificate |
| A Lyapunov function, a safety or stability certificate | **Sum of Squares Certification** | The certificate is the proof |
| The global minimum of p on a set given by polynomial inequalities | **Polynomial Optimisation** | A certified lower bound, and minimisers when the relaxation is tight |
| The global minimum of p on R^n | **Polynomial Optimisation**, with a large ball as **Domain** | A compact description keeps the convergence guarantee |

The decision table on the panel gives the same choices.

## Which relaxation degree?

Start with **Relaxation Degree** equal to the degree of p, the smallest value the tooltip allows, and raise it in steps of two. [Laurent (2009)](#ref-Lau2009a) shows that each step can only raise the bound, at the price of a larger semidefinite program. **Tighten Relaxation** shows the trade-off at four degrees at once.

Stop when **Extract Minimiser** returns points whose values equal the bound, since the bound is then the minimum. [Lasserre (2001)](#ref-Las2001a) observes that the sequence of problems is often finite, and Laurent proves finite convergence when the equations in the description of K have finitely many common complex roots.

## Which solver?

| Situation | Choose | Reason |
|---|---|---|
| Small and medium problems | Clarabel | Interior point, the panel's default |
| Large or sparse problems | COSMO | Operator splitting, with chordal decomposition |
| Very large problems | SCS | Operator splitting, with a homogeneous self-dual embedding |

[Goulart and Chen (2024)](#ref-GC2024a), [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) and [O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a) describe the three methods. For **Extract Minimiser**, [Laurent (2009)](#ref-Lau2009a) points out that primal-dual interior-point methods following the central path return, under certain conditions, an optimal solution of maximum rank, from which all the global minimisers can be read when the rank condition holds. **Solver Comparison** runs the three on the problem at hand.

## How large can n and the degree be?

The Gram matrix of a dense polynomial of degree 2d in n variables has C(n + d, d) rows, and [Parrilo (2003)](#ref-Par2003a) shows that the semidefinite program grows polynomially when either n or d is fixed. The size is not polynomial when both grow together.

The SumOfSquares.jl documentation, by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a), describes ways to reduce the size: the Newton polytope, sparsity and symmetry.

## When is another panel the better place?

| Situation | Better place |
|---|---|
| A matrix variable with linear constraints, without polynomials | **Semidefinite Programming** |
| A local minimum of a smooth nonlinear problem | **Nonlinear Programming** |
| A global minimum of a function that is not a polynomial | **Deterministic Global Methods** |
| A convex problem with second-order or exponential cones | **Convex and Conic Programming** |

## A sensible order of work

1. Write **Polynomial p(x)**, and for **Polynomial Optimisation** **Domain**.
2. Solve with Clarabel, and read **Feasibility Check** and **Gram PSD Check**.
3. Look at **Polynomial Contours** and **Gram Matrix Heatmap**.
4. Raise the degree with **Tighten Relaxation**.
5. Compare the bound with **SOS vs Sampling**, and look for minimisers with **Extract Minimiser**.
6. Read the certificate with **Gram Decomposition** and **Dual Certificate**.

The status and the Gram matrix come first, because a bound from an unfinished solve certifies nothing.

## References

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-Las2001a"></a>Lasserre, J. B. (2001). Global Optimization with Polynomials and the Problem of Moments. *SIAM Journal on Optimization* 11(3), 796-817. [doi:10.1137/S1052623400366802](https://doi.org/10.1137/S1052623400366802)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N., & Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042-1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
