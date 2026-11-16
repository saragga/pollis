# Diagnostics

## Status and Feasibility of a Local Solve
**Status and Feasibility** reports the termination status, the primal and dual status, and the constraints violated by more than 1e-6 at the reported solution; an empty Dict means feasible. The statuses a local solver returns:
- **LOCALLY_SOLVED**: a KKT point was found;
- **LOCALLY_INFEASIBLE**: no feasible point was found from that start, which does not prove the problem infeasible;
- **ITERATION_LIMIT** or **TIME_LIMIT**: stopped early, often on a badly scaled or degenerate problem;
- **NUMERICAL_ERROR**: the Newton systems could not be solved accurately.

## Solver Statistics
**Solver Statistics** reports the solve time and the number of interior-point iterations, where the solver provides them. A well-posed problem of moderate size usually needs tens of iterations; hundreds suggest poor scaling, a degenerate constraint, or a start far from the solution.

## Multi-Start and Several Local Optima
**Multi-Start** re-solves from 20 random starting points in the box and draws the histogram of the objective values reached. A single value suggests one optimum, or one dominant basin; several values reveal a nonconvex problem with several local optima, as the panel's default problem has. The original start is restored afterwards.

## Optimality Gap Check Against a Global Solver
The **Optimality Gap Check** solves the same model with EAGO, a deterministic global solver ([Wilhelm and Stuber (2022)](#ref-WS2022a)), and sets its certified optimum beside the local one. Equal values mean the local optimum is global; a worse local value means the solver stopped in another basin. On large models the global solve may take long, as its cost grows quickly with the number of nonlinear variables.

## Quick Checklist for a Local Solve

| Check | Good sign | Warning sign |
|---|---|---|
| Termination | LOCALLY_SOLVED | LOCALLY_INFEASIBLE, a limit reached |
| Feasibility report | Empty | Violated constraints |
| Iterations | Tens | Hundreds |
| Multi-Start | One objective value | Several |
| Optimality Gap Check | Equal values | Local worse |

## References

<a id="ref-WS2022a"></a>Wilhelm, M. E. and Stuber, M. D. (2022). EAGO.jl: easy advanced global optimization in Julia. *Optimization Methods and Software* 37(2), 425–450. [doi:10.1080/10556788.2020.1786566](https://doi.org/10.1080/10556788.2020.1786566)

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
