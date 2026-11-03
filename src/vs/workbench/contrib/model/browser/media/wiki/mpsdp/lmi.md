# Semidefinite Programming: LMI Constraints

A linear matrix inequality, or LMI, requires a symmetric matrix that depends affinely on the variables to be positive semidefinite. LMIs are the constraints of semidefinite programming in inequality form, and the language in which many problems of control are written.

## Definition

[Boyd, El Ghaoui, Feron and Balakrishnan (1994)](#ref-BGFB1994a) define a linear matrix inequality as

F(x) = F_0 + x_1 F_1 + ... + x_m F_m ≻ 0

for a variable x in R^m and given symmetric matrices F_0, ..., F_m, the inequality meaning that F(x) is positive definite. The nonstrict form F(x) ⪰ 0 asks for positive semidefiniteness. They note that the set of x satisfying an LMI is convex, although the LMI is equivalent to a set of polynomial inequalities in x, through the leading principal minors.

[Boyd and Vandenberghe (2004)](#ref-BV2004a) write the semidefinite program with an LMI constraint, minimising c'x subject to x_1 F_1 + ... + x_n F_n + G ⪯ 0 and linear equalities.

## What can an LMI express?

[Boyd, El Ghaoui, Feron and Balakrishnan (1994)](#ref-BGFB1994a) list what the form covers: linear inequalities, convex quadratic inequalities, matrix norm inequalities, and constraints from control theory such as Lyapunov and convex quadratic matrix inequalities.

| Construction | Effect |
|---|---|
| Diagonal F_i | The LMI is a set of linear inequalities |
| Several LMIs | One LMI with a block-diagonal matrix |
| Schur complement | Converts nonlinear convex inequalities into LMI form |

The constraint X ⪰ 0 of the panel is itself an LMI in the entries of X, with one matrix F_i for each entry.

## Lyapunov's inequality

The history of LMIs in control, as [Boyd, El Ghaoui, Feron and Balakrishnan (1994)](#ref-BGFB1994a) tell it, begins with Lyapunov around 1890. He showed that the differential equation dx/dt = A x is stable, all trajectories converging to zero, if and only if there is a positive definite matrix P with

A' P + P A ≺ 0

The pair of conditions P ≻ 0 and A'P + PA ≺ 0 is a Lyapunov inequality, a special form of LMI in the entries of P. The book shows that a wide range of problems of analysis and design, from quadratic Lyapunov functions for linear differential inclusions to state-feedback synthesis, reduce to LMIs. [Vandenberghe and Boyd (1996)](#ref-VB1996a) point out the close connection between the S-procedure, used in control theory to form semidefinite relaxations of hard control problems, and the semidefinite relaxations of combinatorial optimisation, such as the one in [SDP Relaxations](sdprelax.md).

## Writing an LMI in JuMP

The JuMP documentation constrains a matrix expression to be positive semidefinite with `PSDCone()`:

`@constraint(model, X >= Y, PSDCone())`

which requires X − Y to be positive semidefinite. A Lyapunov inequality for a given A is written the same way, with `P` a symmetric matrix of variables, and P and −(A'P + PA) each constrained to the cone in its nonstrict form.

The documentation recommends declaring a positive semidefinite matrix variable with `PSD` in `@variable` where possible, as the panel does for X, and wrapping a matrix expression in `LinearAlgebra.Symmetric` so that the solver receives it as symmetric. It also warns that the form `Y <= X` with `PSDCone()` gives primal and dual values that may be the negative of those expected.

## Strict and nonstrict inequalities

Solvers work with nonstrict inequalities, X ⪰ 0, while stability conditions such as Lyapunov's are strict. [Boyd, El Ghaoui, Feron and Balakrishnan (1994)](#ref-BGFB1994a) treat the relation between the two in a section of its own.

When the strict LMI F(x) ≻ 0 is feasible, they show, the feasible set of the nonstrict LMI is the closure of that of the strict one, and minimising a linear function over either gives the same infimum. They call such an LMI strictly feasible, and describe strict feasibility, in the language of optimisation theory, as a very strong constraint qualification, the same condition under which [Vandenberghe and Boyd (1996)](#ref-VB1996a) obtain a zero duality gap.

## References

<a id="ref-BGFB1994a"></a>Boyd, S., El Ghaoui, L., Feron, E., & Balakrishnan, V. (1994). *Linear Matrix Inequalities in System and Control Theory*. SIAM. [doi:10.1137/1.9781611970777](https://doi.org/10.1137/1.9781611970777)

<a id="ref-BV2004a"></a>Boyd, S., & Vandenberghe, L. (2004). *Convex Optimization*. Cambridge University Press.

<a id="ref-VB1996a"></a>Vandenberghe, L., & Boyd, S. (1996). Semidefinite Programming. *SIAM Review* 38(1), 49-95. [doi:10.1137/1038003](https://doi.org/10.1137/1038003)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [SDP](sdp.md) · [SDP Relaxations](sdprelax.md) · [Duality](duality.md)
