# Branch and Bound

A **mixed-integer nonlinear program** is an NLP in which some variables must take integer or binary values. All three solvers of the Mixed-Integer Nonlinear Programming panel search for its optimum by **branch and bound**, an idea that goes back to [Land and Doig (1960)](#ref-LD1960a).

## How Branch and Bound Searches the Tree
1. **Relax** the integrality: let each binary take any value in [0, 1] and solve the continuous problem. Its optimum bounds what any integer solution can achieve.
2. **Branch**: if a binary is fractional at the relaxation's optimum, split the problem into two, with that binary fixed at 0 and at 1.
3. **Bound and prune**: solve each branch's relaxation; a branch whose bound cannot beat the best integer solution found so far is discarded.
4. Repeat until no branch is left, or the gap between the best solution and the best bound is within tolerance.
The search forms a tree of nodes, and its size depends on how tight the relaxations are.

## SCIP: Branch and Cut with Spatial Branching
**SCIP** ([Achterberg (2009)](#ref-Ach2009a)) is a constraint integer programming framework. Besides branching on the integers, it adds **cutting planes** that tighten the relaxations, presolves the model, and handles nonconvex terms with **spatial branching**: it splits the range of a continuous variable as well and relaxes the nonconvex expression on each part. That makes its bounds valid on nonconvex problems, and its answer the global optimum.

## Juniper: NLP Branch and Bound with Ipopt
**Juniper** ([Kröger, Coffrin, Hijazi and Nagarajan (2018)](#ref-KCHN2018a)) is written in Julia and solves the relaxation at each node with a local NLP solver, Ipopt in the panel. On a convex MINLP a local optimum of each relaxation is global, so the bounds are valid and the search is exact. On a nonconvex one a node's relaxation solved locally may overstate what its branch can achieve, so branches can be pruned wrongly: Juniper then works as a **heuristic** for good solutions, which it finds quickly on large problems.

## Bonmin: Algorithms for Convex MINLP
**Bonmin** ([Bonami and 10 coauthors (2008)](#ref-BBCCG...2008a)) is an open-source solver of the COIN-OR project for convex MINLPs. It brings together NLP-based branch and bound, in which Ipopt solves the relaxation at each node, outer approximation, which replaces the nonlinear functions by linear cuts and solves mixed-integer linear programs, and hybrids of the two. Like Juniper's, its search is exact on a convex MINLP and a heuristic on a nonconvex one. The panel reaches it through **AmplNLWriter.jl**, which writes the model as an AMPL NL file, runs the Bonmin executable of Bonmin_jll and reads back the solution.

## References

<a id="ref-Ach2009a"></a>Achterberg, T. (2009). SCIP: Solving Constraint Integer Programs. *Mathematical Programming Computation* 1(1), 1–41. [doi:10.1007/s12532-008-0001-1](https://doi.org/10.1007/s12532-008-0001-1)

<a id="ref-BBCCG...2008a"></a>Bonami, P., Biegler, L. T., Conn, A. R., Cornuéjols, G., Grossmann, I. E., Laird, C. D., Lee, J., Lodi, A., Margot, F., Sawaya, N. and Wächter, A. (2008). An Algorithmic Framework for Convex Mixed Integer Nonlinear Programs. *Discrete Optimization* 5(2), 186–204. [doi:10.1016/j.disopt.2006.10.011](https://doi.org/10.1016/j.disopt.2006.10.011)

<a id="ref-KCHN2018a"></a>Kröger, O., Coffrin, C., Hijazi, H. and Nagarajan, H. (2018). Juniper: An Open-Source Nonlinear Branch-and-Bound Solver in Julia. In *Integration of Constraint Programming, Artificial Intelligence, and Operations Research (CPAIOR 2018)*, Lecture Notes in Computer Science 10848, 377–386. Springer. [doi:10.1007/978-3-319-93031-2_27](https://doi.org/10.1007/978-3-319-93031-2_27)

<a id="ref-LD1960a"></a>Land, A. H. and Doig, A. G. (1960). An Automatic Method for Solving Discrete Programming Problems. *Econometrica* 28(3), 497–520. [doi:10.2307/1910129](https://doi.org/10.2307/1910129)

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
