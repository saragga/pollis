# Semidefinite Programming: SDP

The **Semidefinite Programming** problem of the panel: its standard form, the default eigenvalue problem, and how JuMP writes it.

## Standard form

[Boyd and Vandenberghe (2004)](#ref-BV2004a) write a standard form semidefinite program, by analogy with linear programming, as

- minimise tr(C X)
- subject to tr(A_i X) = b_i, for i = 1, ..., p
- X ⪰ 0

over the symmetric n × n matrix X, with symmetric data C and A_i. The trace tr(C X), the sum of C_ij X_ij over all entries, is the general form of a linear function of a symmetric matrix. In linear programming the variable is a vector with non-negative entries; here it is a matrix with non-negative eigenvalues.

When all the matrices are diagonal, the problem reduces to a linear program in the diagonal entries.

## The panel's problem

The panel solves

- minimise or maximise tr(C X), as **Sense** says
- subject to **Constraint**, one scalar linear constraint in X
- X ⪰ 0

with X of size **n**. **Constraint** can be an equality, giving the standard form with p = 1, or an inequality, such as `X[1, 1] + X[2, 2] <= 2`. JuMP accepts both and passes them to the solver as scalar affine constraints.

The code keeps the constraint as `con`, so that `resolve` can change its right-hand side with `set_normalized_rhs` and solve again; **Parametric Sweep** uses it, and restores the original value afterwards.

## The default: an eigenvalue problem

With **Constraint** `tr(X) == 1`, the problem gives an extreme eigenvalue of C: the smallest when minimising, the largest when maximising.

[Vandenberghe and Boyd (1996)](#ref-VB1996a) recall Fan's result that the sum of the r largest eigenvalues of a symmetric matrix A is the optimal value of maximising tr(A Z) over the matrices with tr Z = r and 0 ⪯ Z ⪯ I, the formulation of Overton and Womersley. With r = 1, a positive semidefinite Z of unit trace already satisfies Z ⪯ I, which leaves the panel's problem with **Sense** set to maximise. Minimising tr(C X) is maximising tr(−C X), whose value is the largest eigenvalue of −C, minus the smallest of C.

**vs Baseline** prints the optimum beside both extreme eigenvalues of C, and **Eigenvector Extraction** recovers the eigenvector from X.

## How JuMP writes it

The code declares the matrix with

`@variable(model, X[1:n, 1:n], PSD)`

which makes X a symmetric matrix of variables constrained to the cone of positive semidefinite matrices. The JuMP documentation recommends declaring a matrix of semidefinite variables this way, rather than adding a constraint `X >= 0, PSDCone()`, since some solvers handle the constraint less efficiently.

The objective is `tr(C * X)`, an affine expression in the entries of X, and the solver chosen in **Solver** receives the model through MathOptInterface. JuMP is described by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a).

## Interior-point methods

[Vandenberghe and Boyd (1996)](#ref-VB1996a) state that most interior-point methods for linear programming have been generalised to semidefinite programs, with polynomial worst-case complexity, and they introduce primal-dual methods that keep a primal and a dual point and reduce the duality gap between them. [Nesterov and Nemirovskii (1994)](#ref-NN1994a) give the general theory of path-following and potential reduction methods for conic problems.

Clarabel and Hypatia are interior-point solvers. COSMO and SCS use operator splitting: [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) build COSMO on a linear system with a constant matrix and a projection onto convex sets at each step, and [O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a) combine operator splitting with a homogeneous self-dual embedding in SCS. All four return a primal and a dual solution, which **Duality Gap** compares.

## References

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-NN1994a"></a>Nesterov, Y., & Nemirovskii, A. (1994). *Interior-Point Polynomial Algorithms in Convex Programming*. SIAM. [doi:10.1137/1.9781611970791](https://doi.org/10.1137/1.9781611970791)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N., & Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042-1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP Relaxations](sdprelax.md) · [LMI Constraints](lmi.md) · [Duality](duality.md)
