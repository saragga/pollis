# Nonlinear Programming — Overview

The Nonlinear Programming panel builds a JuMP model with n variables, the bounds lb <= x[i] <= ub, a nonlinear objective and one constraint, and solves it with the solver of the tab: **Ipopt**, **MadNLP** or **Uno**. JuMP parses the nonlinear expressions directly, computes exact first and second derivatives, and passes them to the solver ([Dunning, Huchette and Lubin (2017)](#ref-DHL2017a)).

## The Default Problem of the Panel
The default objective, sum((x .- 1) .^ 2) + 3 x[1] x[2] + x[1], with n = 5 and the ball sum(x .^ 2) <= 4, is **nonconvex** because of the bilinear term 3 x[1] x[2]. It has two local minima, with objective values of about -0.54 and 1.69, and a local solver returns one or the other depending on where it starts. The panel starts every variable at (lb + ub) / 2.

## The Tabs: Ipopt, MadNLP and Uno
- **Ipopt**: the standard open-source interior-point solver, with a filter line search.
- **MadNLP**: an interior-point solver written in Julia, with the same interface, which can run its linear algebra on a GPU.
- **Uno**: a solver that assembles SQP, interior-point and other methods from interchangeable parts, a filter SQP method by default.
All three find a point satisfying the KKT conditions; how Ipopt and MadNLP do so is in [Interior-Point Methods](nlp.md), how Uno does in [Uno: A Unified Solver](uno.md), and the conditions themselves in [KKT Conditions](kkt.md).

## Working Through the Panel
1. Set **n**, the **Sense**, the **Objective**, the **Constraint**, the **Lower Bound** and **Upper Bound**, choose the tab, and run.
2. Check the **Status and Feasibility** and the **Solver Statistics**.
3. Look at the **Objective Contours** and the **Solution Profile**.
4. Run **Multi-Start**, and the **Optimality Gap Check** against a global solver.
5. Read the **KKT Conditions**, the **Constraint Activity** and the **Constraint Sensitivity**.
6. Explore with the **Parametric Sweep** and the **Solver Comparison**.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
