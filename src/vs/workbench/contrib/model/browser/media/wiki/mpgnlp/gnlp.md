# Spatial Branch and Bound

**Spatial branch and bound** is the method behind EAGO and SCIP, two of the solvers of the Global Nonlinear Programming panel; Alpine, the third, partitions the variable domains instead. It finds the global optimum of a nonconvex problem by splitting the box of variable bounds into smaller boxes and bounding the objective on each ([Floudas (2000)](#ref-Flo2000a)). The panel's default problem, with its bilinear term 3 x[1] x[2], has two local minima, with objective values of about -0.54 and 1.69: a local solver may return either, and a global solver returns the one at about -0.54.

## How Spatial Branch and Bound Works
1. Over the current box, build a **convex relaxation** of the problem: a convex problem whose optimum is a lower bound on the true optimum in that box.
2. Find a feasible point, often with a local solver, which gives an upper bound.
3. If the two bounds are not close enough, **split the box** along a variable and repeat on both halves.
4. Discard the boxes whose lower bound exceeds the best feasible value.
The relaxations tighten as the boxes shrink, so the gap closes, and the search ends when it is within tolerance.

## McCormick Relaxations
A **McCormick relaxation** ([McCormick (1976)](#ref-Mcc1976a)) bounds a product of two bounded variables between linear functions built from their bounds: for x in [xl, xu] and y in [yl, yu], the product x y lies above max(xl y + x yl - xl yl, xu y + x yu - xu yu). Composing such bounds through every term of an expression gives convex underestimators and concave overestimators of the whole, which tighten as the box shrinks.

## EAGO
**EAGO** ([Wilhelm and Stuber (2022)](#ref-WS2022a)) is written in Julia and computes McCormick relaxations by running the expressions through a McCormick arithmetic, so functions defined in Julia can be relaxed too. It tightens the bounds of the variables at each node and uses a local solver for the upper bounds.

## SCIP
**SCIP** ([Achterberg (2009)](#ref-Ach2009a)) handles nonconvex terms by spatial branching on the expression graph, together with the cuts, presolve and integer branching of its mixed-integer machinery.

## Alpine: Adaptive Multivariate Partitioning
**Alpine** ([Nagarajan, Lu, Wang, Bent and Sundar (2019)](#ref-NLWBS2019a)) is written in Julia and takes another route to the global optimum. In place of a tree of boxes, it partitions the domains of the variables that appear in nonconvex terms and builds **piecewise polyhedral relaxations** over the partition, solved as mixed-integer programs. After each solve it refines the partition around the best solution found, adaptively, so that the relaxations stay small; a local solver gives the upper bounds, and a bound-tightening step before the main loop narrows the domains. In the panel the mixed-integer programs go to SCIP and the local problems to Ipopt.

## References

<a id="ref-Ach2009a"></a>Achterberg, T. (2009). SCIP: Solving Constraint Integer Programs. *Mathematical Programming Computation* 1(1), 1–41. [doi:10.1007/s12532-008-0001-1](https://doi.org/10.1007/s12532-008-0001-1)

<a id="ref-Flo2000a"></a>Floudas, C. A. (2000). *Deterministic Global Optimization*. Springer. [doi:10.1007/978-1-4757-4949-6](https://doi.org/10.1007/978-1-4757-4949-6)

<a id="ref-Mcc1976a"></a>McCormick, G. P. (1976). Computability of Global Solutions to Factorable Nonconvex Programs: Part I — Convex Underestimating Problems. *Mathematical Programming* 10(1), 147–175. [doi:10.1007/BF01580665](https://doi.org/10.1007/BF01580665)

<a id="ref-NLWBS2019a"></a>Nagarajan, H., Lu, M., Wang, S., Bent, R. and Sundar, K. (2019). An Adaptive, Multivariate Partitioning Algorithm for Global Optimization of Nonconvex Programs. *Journal of Global Optimization* 74(4), 639–675. [doi:10.1007/s10898-018-00734-1](https://doi.org/10.1007/s10898-018-00734-1)

<a id="ref-WS2022a"></a>Wilhelm, M. E. and Stuber, M. D. (2022). EAGO.jl: easy advanced global optimization in Julia. *Optimization Methods and Software* 37(2), 425–450. [doi:10.1080/10556788.2020.1786566](https://doi.org/10.1080/10556788.2020.1786566)

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
