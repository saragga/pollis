# Variational Inequalities: Overview

The **Variational Inequalities** panel solves two problems of the same kind: a variational inequality (VI) on a fixed box K = [lb, ub], and a quasi-variational inequality (QVI), whose box K(x) moves with the solution. Both are solved in Julia with JuMP and the PATH solver, and the default is a Cournot duopoly.

## The problem

The panel's decision table states the VI as: find x* in K with F(x*)ᵀ(y − x*) ≥ 0 for every y in K. The first bullet describes the same condition as a point x* in a convex set K where the operator F points inward, so that no feasible direction improves the objective, and adds that the VI unifies fixed-point problems, optimality conditions, complementarity and equilibrium in a single framework.

The QVI asks for x* in K(x*) that solves the VI on K(x*): the set is evaluated at the solution itself.

## Complementarity on a box

On a box, the decision table notes, the VI is exactly the mixed complementarity problem. The JuMP documentation defines a mixed complementarity constraint F(x) ⟂ x as finding x in [lb, ub] such that

- F(x) = 0 if lb < x < ub,
- F(x) ≥ 0 if x = lb,
- F(x) ≤ 0 if x = ub.

JuMP takes the interval from the bounds of the variables, and the panel's code writes the constraint as `complements(F(x), x)`, which PATH solves.

## The PATH solver

[Dirkse and Ferris (1995)](#ref-DF1995a) describe PATH as an implementation of a stabilised Newton method for the mixed complementarity problem. A path-generation procedure builds a piecewise linear path from the current point to the Newton point, and a step length criterion with a non-monotone pathsearch chooses the next iterate. They show the algorithm to be globally convergent under assumptions that generalise those needed for similar results in the smooth case.

PATHSolver.jl wraps PATH for Julia, through its C interface and through MathOptInterface, so that JuMP models can use it. [Kwon (2023)](#ref-Kwo2023a) provides Complementarity.jl, a modelling interface for mixed complementarity problems and for mathematical programs with equilibrium constraints, built on JuMP and PATHSolver.jl.

## Where VIs arise

The panel's second bullet names traffic assignment, spatial price equilibrium, contact mechanics, game theory and economics, wherever the equilibrium condition cannot be written as a simple minimisation.

[Dafermos and Sparrow (1969)](#ref-DS1969a) describe two criteria for traffic: a network can be run by a central authority that minimises the total cost, or be user optimised, with each user choosing the cheapest route in the light of the other users' decisions. The two criteria lead in general to different traffic patterns, as Pigou first observed and Wardrop later calculated for simple networks.

## Textbooks and the original paper

The panel lists two textbooks: [Facchinei and Pang (2003)](#ref-FP2003a), on finite-dimensional variational inequalities and complementarity problems, and [Kinderlehrer and Stampacchia (1980)](#ref-KS1980a), an introduction to variational inequalities and their applications. Among the original papers it lists [Hartman and Stampacchia (1966)](#ref-HS1966a), on some non-linear elliptic differential-functional equations, published in *Acta Mathematica*, together with [Dafermos and Sparrow (1969)](#ref-DS1969a), on the traffic assignment problem for a general network, published in the *Journal of Research of the National Bureau of Standards*.

## Wikis and notebooks

The Factsheet lists the inputs and the output of the panel. Assumptions covers the box, the operator and what the code expects of them, Diagnostics the residual, gap and convergence checks, and Interpretation how to read a solution component by component. The Decision Guide compares the two problems and the actions. The pages on the VI and the QVI describe each problem and its code.

The notebooks are Variational Inequality, which solves the VI through its complementarity reformulation with PATHSolver, and Quasi-Variational Inequality, which handles a state-dependent constraint set by fixed-point iteration.

## References

<a id="ref-DS1969a"></a>Dafermos, S. C., & Sparrow, F. T. (1969). The Traffic Assignment Problem for a General Network. *Journal of Research of the National Bureau of Standards, Section B* 73B(2), 91-118. [doi:10.6028/jres.073B.010](https://doi.org/10.6028/jres.073B.010)

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-FP2003a"></a>Facchinei, F., & Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems* (Vols. I and II). Springer. [doi:10.1007/b97543](https://doi.org/10.1007/b97543), [doi:10.1007/b97544](https://doi.org/10.1007/b97544)

<a id="ref-HS1966a"></a>Hartman, P., & Stampacchia, G. (1966). On Some Non-Linear Elliptic Differential-Functional Equations. *Acta Mathematica* 115, 271-310. [doi:10.1007/BF02392210](https://doi.org/10.1007/BF02392210)

<a id="ref-KS1980a"></a>Kinderlehrer, D., & Stampacchia, G. (1980). *An Introduction to Variational Inequalities and Their Applications*. Academic Press; SIAM reprint, 2000. [doi:10.1137/1.9780898719451](https://doi.org/10.1137/1.9780898719451)

<a id="ref-Kwo2023a"></a>Kwon, C. (2023). Complementarity.jl: Modeling and Solving Complementarity Problems in Julia. [github.com](https://github.com/chkwon/Complementarity.jl)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
