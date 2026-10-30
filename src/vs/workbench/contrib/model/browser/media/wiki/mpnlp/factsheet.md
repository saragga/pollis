# Nonlinear Programming — Factsheet

A **nonlinear program** (NLP) optimises a nonlinear objective subject to nonlinear constraints and bounds. When some variables must be integer it is a **mixed-integer nonlinear program** (MINLP); when the problem is nonconvex and the best of all local optima is required, it is a **global** NLP.

| | |
|---|---|
| **Purpose** | Model and solve nonlinear optimisation problems in JuMP, locally, with discrete decisions, or to certified global optimality |
| **Input** | The number of variables n, the sense, the objective and a constraint as JuMP expressions in x, the bounds, the cardinality limit for MINLP, and the solver |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Ipopt.jl](https://github.com/jump-dev/Ipopt.jl), [MadNLP.jl](https://github.com/MadNLP/MadNLP.jl), [SCIP.jl](https://github.com/scipopt/SCIP.jl), [Juniper.jl](https://github.com/lanl-ansi/Juniper.jl), [EAGO.jl](https://github.com/PSORLab/EAGO.jl), [AmplNLWriter.jl](https://github.com/jump-dev/AmplNLWriter.jl) |
| **Models** | Nonlinear Programming (NLP), Mixed-Integer NLP (MINLP), Global NLP |
| **Output** | The termination status, the objective, the solution, and where available the duals, the bound and the gap |
| **Key choice** | Local or global, continuous or mixed-integer: each changes the solver and what its answer guarantees |

## When to Use

- **Engineering and economic models** with nonlinear relations: chemical processes, power flow, portfolio models with nonlinear risk, production functions.
- **Discrete choices in a nonlinear model**: which units to switch on, at most k assets, on/off decisions (MINLP).
- **When a local optimum is not enough**: nonconvex problems where the best solution must be proved (Global NLP).

## What It Is Not

Not the right tool for linear, quadratic or conic problems, which LP, QP and conic solvers handle with stronger guarantees and speed (Mathematical Programming: Conic). Global and MINLP solvers scale **exponentially** in the worst case: dozens to a few hundred variables are routine, thousands may not be.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [KKT Conditions](kkt.md)
