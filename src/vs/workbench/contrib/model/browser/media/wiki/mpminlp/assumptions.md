# Assumptions

## Bounds as the Big-M of the Switch
The switch lb z[i] <= x[i] <= ub z[i] uses the bounds as its **big-M** constants. It requires lb <= 0 <= ub, so that x[i] = 0 is allowed when the switch is off. Its continuous relaxation, with z[i] anywhere in [0, 1], is tight only when the bounds are: loose bounds let a fractional switch carry a large x[i], the relaxation's bound weakens, and branch and bound needs many more nodes.

## Expressions the Solvers Can Handle
SCIP relaxes the nonlinear terms over boxes, so the objective and constraints must be built from operations it knows: sums, products, powers, exp, log and trigonometric functions. Juniper and Bonmin only need what Ipopt needs, twice-differentiable expressions, as they solve each node's relaxation locally. Bonmin receives the model as an AMPL NL file, which holds the expressions of the JuMP model but no function defined in Julia.

## Convexity and What Each Solver Guarantees
- **SCIP**: the global optimum of the mixed-integer problem, within its gap, convex or not.
- **Juniper** and **Bonmin**: the optimum when the continuous relaxation is **convex**; on a nonconvex problem, a good feasible solution without a guarantee, because a relaxation solved locally may not bound its branch.
The panel's default objective is nonconvex, so the three tabs can give different answers.

## Finite Bounds for Spatial Branching
SCIP branches on continuous variables that appear in nonconvex terms, and needs finite bounds on them to build its relaxations. The panel puts finite bounds on every x[i], which the switch requires anyway.

## One Constraint in the Panel
The panel generates one constraint from **Constraint**, besides the switches and the cardinality limit; further ones are added as @constraint lines in the generated code.

## References

<a id="ref-KCHN2018a"></a>Kröger, O., Coffrin, C., Hijazi, H. and Nagarajan, H. (2018). Juniper: An Open-Source Nonlinear Branch-and-Bound Solver in Julia. In *Integration of Constraint Programming, Artificial Intelligence, and Operations Research (CPAIOR 2018)*, Lecture Notes in Computer Science 10848, 377–386. Springer. [doi:10.1007/978-3-319-93031-2_27](https://doi.org/10.1007/978-3-319-93031-2_27)

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Branch and Bound](minlp.md)
