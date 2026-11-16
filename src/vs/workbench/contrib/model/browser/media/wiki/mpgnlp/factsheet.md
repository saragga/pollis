# Global Nonlinear Programming — Factsheet

**Global nonlinear programming** finds the best of all the local optima of a nonconvex problem and **proves** that it is the best, within a tolerance. Where a local solver stops at the first point satisfying the KKT conditions, a global solver keeps a lower bound on the optimum and searches until no region can hold a better point.

| | |
|---|---|
| **Purpose** | Find and certify the global optimum of a nonconvex nonlinear problem modelled in JuMP |
| **Input** | The number of variables n, the sense, the objective and a constraint as JuMP expressions in x, and finite bounds |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [EAGO.jl](https://github.com/PSORLab/EAGO.jl), [SCIP.jl](https://github.com/scipopt/SCIP.jl), [Alpine.jl](https://github.com/lanl-ansi/Alpine.jl) |
| **Solvers** | EAGO, SCIP, Alpine |
| **Output** | The termination status, the global optimum and its point, the best bound and the relative gap |
| **Key choice** | The bounds, which decide how tight the relaxations are and how long the search takes |

## When to Use Global Nonlinear Programming

- **Nonconvex problems where a local optimum is not enough**: design problems, pooling and blending, parameter estimation with several local fits.
- **Checking a local solver**: confirming that the solution of Ipopt is the global one, or finding a better one.
- **Proofs of infeasibility**: a global solver's INFEASIBLE status is a proof, where a local solver's is not.

## What Global Nonlinear Programming Is Not

Spatial branch and bound grows **exponentially** in the worst case with the number of variables that appear nonlinearly: a few to a few dozen are routine, hundreds may not be. Large smooth problems where a local optimum serves belong in the **Nonlinear Programming** panel; problems with integer decisions in the **Mixed-Integer Nonlinear Programming** panel, although SCIP handles both.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Spatial Branch and Bound](gnlp.md)
