# Constrained Optimisation — Factsheet

**Constrained optimisation** minimises an objective f(x) over the points that satisfy a set of constraints: here inequality constraints g(x) <= 0 and bounds lb <= x <= ub. The solution is usually on the boundary of the feasible set, where some constraints are **active**, and each active constraint has a **multiplier**, its shadow price.

| | |
|---|---|
| **Purpose** | Minimise a smooth function subject to nonlinear inequality constraints and bounds |
| **Input** | The dimension n, a Julia expression for f(x), a Julia vector of constraints g(x) <= 0, the bounds and the iteration limit |
| **Core packages** | [NLopt.jl](https://github.com/jump-dev/NLopt.jl), [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Ipopt.jl](https://github.com/jump-dev/Ipopt.jl), [FrankWolfe.jl](https://github.com/ZIB-IOL/FrankWolfe.jl), [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl) |
| **Models** | SLSQP, MMA, Interior Point, Frank-Wolfe, Gradient Projection |
| **Output** | The solution, the objective, the constraint values, the active constraints, the multipliers and the solver status |
| **Key choice** | The method, matched to the size of the problem and the shape of the feasible set |

## When to Use

- **Physical, economic or design limits**: budgets, capacities, resource constraints, non-negativity, a maximum norm.
- **Smooth nonlinear constraints**, such as the unit disk of the default example, where linear or quadratic programming does not apply.
- **When the shadow prices matter**: the multipliers say how much the optimum would improve per unit of relaxation of each constraint.

## What It Is Not

Not a global solver: on non-convex problems every method returns a local solution, which **Multi-Start** probes. Not for integer variables (mixed-integer programming), and not the best tool for linear or quadratic problems, which dedicated LP, QP and conic solvers handle faster and more reliably.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
