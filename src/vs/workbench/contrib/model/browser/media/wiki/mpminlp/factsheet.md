# Mixed-Integer Nonlinear Programming — Factsheet

A **mixed-integer nonlinear program** (MINLP) adds integer or binary variables to a nonlinear program. The integers model discrete decisions, such as opening a plant, holding an asset or choosing a configuration, while the nonlinear objective and constraints describe what each decision costs.

| | |
|---|---|
| **Purpose** | Model a nonlinear problem with on/off decisions in JuMP and solve it by branch and bound |
| **Input** | The number of variables n, the sense, the objective and a constraint as JuMP expressions in x, the bounds, and the limit on the nonzeros |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [SCIP.jl](https://github.com/scipopt/SCIP.jl), [Juniper.jl](https://github.com/lanl-ansi/Juniper.jl), [Ipopt.jl](https://github.com/jump-dev/Ipopt.jl), [AmplNLWriter.jl](https://github.com/jump-dev/AmplNLWriter.jl), [Bonmin_jll.jl](https://github.com/JuliaBinaryWrappers/Bonmin_jll.jl) |
| **Solvers** | SCIP, Juniper and Bonmin (both with Ipopt at each node) |
| **Output** | The termination status, the objective, the solution, the switches that are on, and the bound and gap where reported |
| **Key choice** | A global solver (SCIP) or NLP branch and bound (Juniper, Bonmin), which is exact only on convex problems |

## When to Use Mixed-Integer Nonlinear Programming

- **Selection under a nonlinear cost**: at most k assets in a portfolio with a nonlinear risk, a sparse model with a nonlinear loss.
- **Design and planning**: which units to build or switch on, when their operation follows nonlinear physics or economics.
- **Logical conditions**: a variable allowed to be nonzero only when a decision is taken, written with a binary switch.

## What Mixed-Integer Nonlinear Programming Is Not

Branch and bound grows **exponentially** in the worst case with the number of binaries: dozens to a few hundred are routine, thousands may not be. A problem with no integer variables belongs in the **Local Nonlinear Programming** panel, or the **Global Nonlinear Programming** panel when its global optimum is needed. A linear or quadratic model with integers is faster in the Linear or Quadratic Programming panels.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Branch and Bound](minlp.md)
