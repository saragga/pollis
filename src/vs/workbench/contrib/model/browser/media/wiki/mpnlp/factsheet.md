# Nonlinear Programming — Factsheet

A **nonlinear program** (NLP) optimises a smooth nonlinear objective subject to nonlinear constraints and bounds on continuous variables. The Nonlinear Programming panel solves it **locally**, with interior-point solvers that stop at a point satisfying the KKT conditions.

| | |
|---|---|
| **Purpose** | Model a smooth nonlinear problem in JuMP and find a locally optimal solution, with its multipliers |
| **Input** | The number of variables n, the sense, the objective and a constraint as JuMP expressions in x, and the bounds |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Ipopt.jl](https://github.com/jump-dev/Ipopt.jl), [MadNLP.jl](https://github.com/MadNLP/MadNLP.jl) |
| **Solvers** | Ipopt, MadNLP |
| **Output** | The termination status, the objective, the solution, and the multipliers of the constraints and bounds |
| **Key choice** | The solver, and the starting point, which decides which local optimum is found |

## When to Use Nonlinear Programming

- **Engineering and economic models** with smooth nonlinear relations: chemical processes, power flow, production functions, portfolios with a nonlinear risk measure.
- **Estimation** written as an optimisation problem, such as maximum likelihood with constraints on the parameters.
- **Large problems**: interior-point solvers with sparse linear algebra handle hundreds of thousands of variables and constraints.

## What Nonlinear Programming Is Not

A local solver gives no guarantee that a better point does not exist elsewhere when the problem is nonconvex: the **Global Nonlinear Programming** panel certifies the global optimum, and the **Mixed-Integer Nonlinear Programming** panel adds integer variables. Linear, quadratic and conic problems are better served by their own panels, whose solvers are faster and give stronger guarantees.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interior-Point Methods](nlp.md)
