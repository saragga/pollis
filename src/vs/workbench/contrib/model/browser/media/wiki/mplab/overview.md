# Mathematical Programming Lab — Overview

The Mathematical Programming Lab solves one small nonlinear program with several methods of the same solver, **Uno** ([Vanaret and Leyffer (2026)](#ref-VL2026a)), and sets their work side by side. Uno builds each method from interchangeable ingredients, so the Lab can change one ingredient at a time and show what it does to the number of iterations, the evaluations of the functions, and the point reached. The problem is a JuMP model ([Dunning, Huchette and Lubin (2017)](#ref-DHL2017a)), passed to Uno as an NLPModel through NLPModelsJuMP.jl, for which UnoSolver.jl ([Vanaret and Montoison (2026)](#ref-VM2026a)) reports the counts.

## The Tabs: Four Presets of Uno
- **Interior Point**: the ipopt preset, a barrier on the inequalities with a line search and Wächter's filter.
- **Filter SQP**: the filtersqp preset, quadratic subproblems in a trust region with Fletcher's filter.
- **Funnel SQP**: the funnelsqp preset, the same subproblems with a funnel in place of the filter.
- **Filter SLP**: the filterslp preset, linear subproblems, with no Hessian, in a trust region with Fletcher's filter.
What each preset sets is in [The Ingredients of a Solver](ingredients.md).

## The Test Problems of the Lab
- **HS071**, from the collection of [Hock and Schittkowski (1981)](#ref-HS1981a): four bounded variables, a product constraint and a sphere constraint, a standard first test of nonlinear solvers.
- **HS015**, from the same collection: the Rosenbrock function under two nonlinear constraints and a bound, started far from its solution.
- **Degenerate Complementarity**: two nonnegative variables whose product must be 0, a constraint at whose solutions no constraint qualification holds, so that the multipliers are not unique and methods that rely on them are tested.
The generated code builds the chosen problem in JuMP; replacing it with another JuMP model runs the Lab on that model.

## The Ingredient Inputs
**Inequality Handling**, **Hessian Model**, **Globalization Mechanism** and **Globalization Strategy** override one ingredient of the tab's preset each; **As in the Preset** keeps the preset's choice. Uno does not accept every combination, and the code checks the ingredients before it calls Uno.

## Working Through the Lab
1. Choose the **Problem**, run each tab, and compare the status, the objective and the iterations.
2. Run **Compare the Methods** for the four presets and Ipopt in one table, and **Counts by Method** for the chart.
3. Read the **Iteration Log** of a tab, and the **Optimality Measures** at its solution.
4. Change one ingredient, or run **Hessian Models** and **Globalization Strategies** to change each in turn.
5. Try **Random Starts** to see how robust a method is away from the standard start.
6. Read the **Active Constraints** and **Active Bounds** at the solution.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-HS1981a"></a>Hock, W. and Schittkowski, K. (1981). *Test Examples for Nonlinear Programming Codes*. Springer. [doi:10.1007/978-3-642-48320-2](https://doi.org/10.1007/978-3-642-48320-2)

<a id="ref-VL2026a"></a>Vanaret, C. and Leyffer, S. (2026). Implementing a Unified Solver for Nonlinearly Constrained Optimization. *Mathematical Programming Computation*. [doi:10.1007/s12532-026-00310-9](https://doi.org/10.1007/s12532-026-00310-9)

<a id="ref-VM2026a"></a>Vanaret, C. and Montoison, A. (2026). Uno: A Composable Framework for Nonlinearly Constrained Optimization. *Journal of Open Source Software* 11(123), 10229. [doi:10.21105/joss.10229](https://doi.org/10.21105/joss.10229)

## See Also
- [Factsheet](factsheet.md) · [The Ingredients of a Solver](ingredients.md) · [Reading the Comparison](comparison.md)
