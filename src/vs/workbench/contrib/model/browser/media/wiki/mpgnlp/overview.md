# Global Nonlinear Programming — Overview

The Global Nonlinear Programming panel builds a JuMP model with n variables, finite bounds lb <= x[i] <= ub, a nonlinear objective and one constraint, and solves it to global optimality with the solver of the tab: **EAGO**, **SCIP** or **Alpine**.

## The Default Problem of the Panel
The default objective, sum((x .- 1) .^ 2) + 3 x[1] x[2] + x[1], with n = 5 and the ball sum(x .^ 2) <= 4, is **nonconvex** because of the bilinear term 3 x[1] x[2]. A local solver may stop at either of its two local minima; a global solver returns the better one and proves it. The bounds -2 and 2 follow from the ball, so they cost nothing and keep the relaxations tight.

## The Tabs: EAGO, SCIP and Alpine
- **EAGO**: a deterministic global optimiser written in Julia, built on McCormick relaxations ([Wilhelm and Stuber (2022)](#ref-WS2022a)).
- **SCIP**: spatial branching inside a branch-and-cut framework ([Achterberg (2009)](#ref-Ach2009a)).
- **Alpine**: adaptive partitioning of the variable domains, written in Julia, with SCIP solving its relaxations and Ipopt its local problems ([Nagarajan, Lu, Wang, Bent and Sundar (2019)](#ref-NLWBS2019a)).
How the three search is in [Spatial Branch and Bound](gnlp.md).

## Working Through the Panel
1. Set **n**, the **Sense**, the **Objective**, the **Constraint**, and finite **Lower Bound** and **Upper Bound**, choose the tab, and run.
2. Check the **Status and Feasibility** and the **Solver Statistics**: the nodes, the bound and the gap.
3. Look at the **Objective Contours** and the **Solution Profile**.
4. Run **Local Against Global** and the **Solver Comparison**.
5. Try **Wider Bounds** to see what loose bounds cost.
6. Read the **Constraint Activity** and the **KKT at the Global Optimum**.

## References

<a id="ref-Ach2009a"></a>Achterberg, T. (2009). SCIP: Solving Constraint Integer Programs. *Mathematical Programming Computation* 1(1), 1–41. [doi:10.1007/s12532-008-0001-1](https://doi.org/10.1007/s12532-008-0001-1)

<a id="ref-NLWBS2019a"></a>Nagarajan, H., Lu, M., Wang, S., Bent, R. and Sundar, K. (2019). An Adaptive, Multivariate Partitioning Algorithm for Global Optimization of Nonconvex Programs. *Journal of Global Optimization* 74(4), 639–675. [doi:10.1007/s10898-018-00734-1](https://doi.org/10.1007/s10898-018-00734-1)

<a id="ref-WS2022a"></a>Wilhelm, M. E. and Stuber, M. D. (2022). EAGO.jl: easy advanced global optimization in Julia. *Optimization Methods and Software* 37(2), 425–450. [doi:10.1080/10556788.2020.1786566](https://doi.org/10.1080/10556788.2020.1786566)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
