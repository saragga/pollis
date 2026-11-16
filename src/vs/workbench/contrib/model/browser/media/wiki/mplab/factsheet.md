# Mathematical Programming Lab — Factsheet

The **Mathematical Programming Lab** compares methods for nonlinearly constrained optimization on the same problem, by running the methods of one unified solver, **Uno**, and changing their ingredients one at a time. Where the Nonlinear Programming panel solves a model, the Lab studies how a method gets to the solution.

| | |
|---|---|
| **Purpose** | Compare interior-point, SQP and SLP methods, and their ingredients, on one nonlinear program |
| **Input** | A test problem (HS071, HS015 or a degenerate complementarity problem) and overrides of four ingredients |
| **Core packages** | [UnoSolver.jl](https://github.com/cvanaret/Uno), [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [NLPModelsJuMP.jl](https://github.com/JuliaSmoothOptimizers/NLPModelsJuMP.jl) |
| **Methods** | Uno's presets ipopt, filtersqp, funnelsqp and filterslp, and Ipopt for reference |
| **Output** | The status, the objective, the solution, the iterations, the subproblems solved, the evaluations of the functions and their derivatives, and the seconds |
| **Key choice** | The ingredient to change, with the others held fixed |

## When to Use the Mathematical Programming Lab

- **Learning how nonlinear solvers work**: what a barrier, a quadratic subproblem, a filter or a trust region changes in practice.
- **Choosing a method for a class of problems**: the counts of each method on a small model of the same kind.
- **Studying a difficult problem**: a degenerate or badly started problem on which some methods struggle.

## What the Mathematical Programming Lab Is Not

The Lab is built for small problems and for comparison, not for production solves. A model to solve belongs in the **Nonlinear Programming** panel, which also has Uno as a tab; integer decisions belong in **Mixed-Integer Nonlinear Programming**, and a certified global optimum in **Global Nonlinear Programming**. All the methods of the Lab are local: on a nonconvex problem each returns a KKT point, which can differ from one method to another.

## References

<a id="ref-VL2026a"></a>Vanaret, C. and Leyffer, S. (2026). Implementing a Unified Solver for Nonlinearly Constrained Optimization. *Mathematical Programming Computation*. [doi:10.1007/s12532-026-00310-9](https://doi.org/10.1007/s12532-026-00310-9)

## See Also
- [Overview](overview.md) · [The Ingredients of a Solver](ingredients.md) · [Reading the Comparison](comparison.md)
