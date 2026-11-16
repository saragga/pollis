# Mixed-Integer Nonlinear Programming — Overview

The Mixed-Integer Nonlinear Programming panel builds a JuMP model with n continuous variables x[i], one binary switch z[i] for each, a nonlinear objective and one constraint, and solves it with the solver of the tab: **SCIP**, **Juniper** or **Bonmin**.

## The Switches of the Panel
Each continuous x[i] gets a **binary switch** z[i]:
- lb z[i] <= x[i] <= ub z[i]: when z[i] = 0, x[i] is forced to 0; when z[i] = 1, x[i] ranges over its bounds;
- sum(z) <= **Max Nonzeros**: at most that many variables may be nonzero.
The pair makes a **cardinality constraint**, the nonlinear analogue of best-subset selection. The bounds serve as the big-M constants of the switch, so the **Lower Bound** must be at most 0 and the **Upper Bound** at least 0.

## The Tabs: SCIP, Juniper and Bonmin
- **SCIP**: branch and cut with spatial branching on the nonconvex terms ([Achterberg (2009)](#ref-Ach2009a)).
- **Juniper**: branch and bound in Julia, with Ipopt solving the relaxation at each node ([Kröger, Coffrin, Hijazi and Nagarajan (2018)](#ref-KCHN2018a)).
- **Bonmin**: branch and bound of the COIN-OR project, with Ipopt solving the relaxation at each node, called through an AMPL NL file ([Bonami and 10 coauthors (2008)](#ref-BBCCG...2008a)).
How the three search the tree is in [Branch and Bound](minlp.md).

## Working Through the Panel
1. Set **n**, the **Sense**, the **Objective**, the **Constraint**, the bounds and **Max Nonzeros**, choose the tab, and run.
2. Check the **Status and Feasibility** and the **Solver Statistics**: the nodes, the bound and the gap.
3. Look at the **Solution Profile**, the switches that are on in colour, and the **Objective Contours**.
4. Run the **Cardinality Sweep**, and the **Price of Integrality**.
5. Read the **Constraint Activity** and the **Duals at the Chosen Switches**.
6. Run the **Solver Comparison** of the three solvers.

## References

<a id="ref-Ach2009a"></a>Achterberg, T. (2009). SCIP: Solving Constraint Integer Programs. *Mathematical Programming Computation* 1(1), 1–41. [doi:10.1007/s12532-008-0001-1](https://doi.org/10.1007/s12532-008-0001-1)

<a id="ref-BBCCG...2008a"></a>Bonami, P., Biegler, L. T., Conn, A. R., Cornuéjols, G., Grossmann, I. E., Laird, C. D., Lee, J., Lodi, A., Margot, F., Sawaya, N. and Wächter, A. (2008). An Algorithmic Framework for Convex Mixed Integer Nonlinear Programs. *Discrete Optimization* 5(2), 186–204. [doi:10.1016/j.disopt.2006.10.011](https://doi.org/10.1016/j.disopt.2006.10.011)

<a id="ref-KCHN2018a"></a>Kröger, O., Coffrin, C., Hijazi, H. and Nagarajan, H. (2018). Juniper: An Open-Source Nonlinear Branch-and-Bound Solver in Julia. In *Integration of Constraint Programming, Artificial Intelligence, and Operations Research (CPAIOR 2018)*, Lecture Notes in Computer Science 10848, 377–386. Springer. [doi:10.1007/978-3-319-93031-2_27](https://doi.org/10.1007/978-3-319-93031-2_27)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
