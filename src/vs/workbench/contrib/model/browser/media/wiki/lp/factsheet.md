# Linear Programming — Factsheet

A **linear programme** optimises a linear function over a set defined by linear inequalities. It is the most widely used optimisation model: its solvers are fast and reliable on problems with millions of variables, the optimum they find is global, and the dual solution says what each constraint is worth. Adding integer variables (MILP) makes the model far more expressive and far harder to solve.

| | |
|---|---|
| **Purpose** | Find the best allocation of limited resources when the objective and the constraints are linear |
| **Input** | Objective coefficients c, constraint matrix A, right-hand side b, the sense (maximise or minimise), the solver |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [HiGHS.jl](https://github.com/jump-dev/HiGHS.jl), [Clp.jl](https://github.com/jump-dev/Clp.jl), [GLPK.jl](https://github.com/jump-dev/GLPK.jl) |
| **Methods** | LP (simplex, interior point), MILP (branch-and-bound with cutting planes) |
| **Output** | Termination status, optimal objective, optimal x, constraint slacks, shadow prices, reduced costs, sensitivity ranges |
| **Key choice** | Continuous (LP) or integer (MILP) variables; the solver |

## When to Use

- The objective and every constraint are **linear** in the decision variables: costs per unit, capacities, balances.
- You want the **provably best** solution, not just a good one.
- You want to know **what a constraint costs**: how much the optimum improves per extra unit of a resource.
- Decisions are **indivisible or logical** (open a plant or not): use MILP.

## What It Is Not

Linear programming cannot represent economies of scale, products of variables or other non-linear relations without approximation (see Quadratic Programming and the non-linear solvers). It assumes the data are known: with uncertain coefficients, see stochastic or robust optimisation. A MILP may take exponentially long; for large ones the solver may stop with a good solution and a gap rather than a proven optimum.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
