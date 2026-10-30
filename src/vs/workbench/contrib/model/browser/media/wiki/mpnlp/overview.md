# Nonlinear Programming — Overview

The Nonlinear Programming panel builds a JuMP model with n variables, lb <= x[i] <= ub, a nonlinear objective and one constraint, and solves it with the solver of the chosen problem class. JuMP parses the nonlinear expressions directly, computes exact derivatives, and passes them to the solver.

## The Default Example
The default objective, sum((x .- 1) .^ 2) + 3 x[1] x[2] + x[1], with n = 5 and the ball sum(x .^ 2) <= 4, is **nonconvex** because of the bilinear term 3 x[1] x[2]. It has two local minima, with objective values of about -0.54 and 1.69: a local solver may return either, depending on where it starts, which is the point of the comparison between the three classes.

## The Three Classes
- **NLP**: Ipopt or MadNLP, interior-point methods that find a local optimum satisfying the KKT conditions. See [NLP](nlp.md).
- **MINLP**: each x[i] gets a binary switch z[i], x[i] can be nonzero only when z[i] = 1, and at most **Max Nonzeros** switches are on; SCIP or Juniper solve it by branch and bound. See [MINLP](minlp.md).
- **Global NLP**: EAGO or SCIP, spatial branch and bound with convex relaxations, which certify the global optimum. See [Global NLP](gnlp.md).
The optimality conditions shared by all three are in [KKT Conditions](kkt.md).

## Common Workflow

1. Set **n**, the **Sense**, the **Objective**, the **Constraint**, the **Lower Bound** and **Upper Bound**, choose the class and its **Solver**, and run.
2. Check the **Status and Feasibility** and the **Solver Statistics**.
3. Look at the **Objective Contours** and the **Solution Profile**.
4. Run **Multi-Start** for local solutions, and the **Optimality Gap Check**.
5. Read the **KKT Conditions**, the **Constraint Activity** and the **Constraint Sensitivity**.
6. Explore with the **Parametric Sweep** and the **Solver Comparison**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
