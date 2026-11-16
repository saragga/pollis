# General Convex Programming — Factsheet

The General Convex Programming panel solves a convex problem to global optimality: a convex objective of non-negative variables under one linear constraint, stated either in Convex.jl, which proves it convex before solving, or in JuMP.

| | |
|---|---|
| **Purpose** | Solve a convex problem to global optimality, stated in Convex.jl or in JuMP |
| **Input** | n, the Objective (minimised), the Constraint with its Relation and Right-Hand Side, the Solver |
| **Core packages** | [Convex.jl](https://github.com/jump-dev/Convex.jl), [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Clarabel.jl](https://github.com/oxfordcontrol/Clarabel.jl), [COSMO.jl](https://github.com/oxfordcontrol/COSMO.jl), [SCS.jl](https://github.com/jump-dev/SCS.jl) |
| **Tabs** | Convex.jl (DCP), JuMP |
| **Output** | The optimal x, the optimal value and the status; on the Convex.jl (DCP) tab, the curvature Convex.jl proves |
| **Key choice** | Convex.jl, which proves convexity and builds the conic form, or JuMP, which passes the model to the solver |

## When to Use General Convex Programming

- A convex objective under linear constraints, to be solved to a global optimum.
- When convexity must be proven before solving: Convex.jl checks every expression against the rules of disciplined convex programming.
- When the objective has a norm, an absolute value or a log-sum-exp: Convex.jl reduces them to cones, which the JuMP tab cannot pass to a conic solver.
- To see the conic programme a convex problem becomes, in the Conic Form step.

## What General Convex Programming Is Not

Not for non-convex problems: Convex.jl refuses a problem it cannot prove convex, and Clarabel, COSMO and SCS solve convex problems only. For a problem written directly with second-order, exponential or power cones, see the Second-Order, Exponential and Power Cones panel; with matrix variables, Semidefinite Programming; with integer variables, Mixed-Integer Convex Programming. For non-convex problems, see Global Nonlinear Programming for a certified global optimum, or Local Nonlinear Programming for a local one.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Disciplined Convex Programming](dcp.md)
