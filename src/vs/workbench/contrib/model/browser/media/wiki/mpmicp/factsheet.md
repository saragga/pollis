# Mixed-Integer Conic Programming — Factsheet

A **mixed-integer conic program** minimises a linear objective over variables that must lie in convex cones, where some of the variables must also be integers. In Julia it is written in `JuMP.jl` and solved with `Pajarito.jl`, which combines a mixed-integer linear solver with a continuous conic solver.

| | |
|---|---|
| **Problem** | min c'x subject to Ax - b in K, some x integer |
| **Modelling** | `JuMP.jl` |
| **Solver** | `Pajarito.jl` (outer approximation) |
| **MILP solver** | `HiGHS.jl` (the `oa_solver`) |
| **Conic solver** | `Clarabel.jl` or `Hypatia.jl` (the `conic_solver`) |
| **Cones with Pajarito cuts** | Second-order, exponential, power, positive semidefinite |

## Setting Up the Solver

```julia
using JuMP, Pajarito, HiGHS, Clarabel

model = Model(optimizer_with_attributes(Pajarito.Optimizer,
    "oa_solver" => optimizer_with_attributes(HiGHS.Optimizer, MOI.Silent() => true),
    "conic_solver" => optimizer_with_attributes(Clarabel.Optimizer, MOI.Silent() => true)))
```

## Main Options

| Option | Default | Meaning |
|---|---|---|
| `time_limit` | `1e6` | Seconds before stopping with `TIME_LIMIT` |
| `iteration_limit` | `1000` | Outer-approximation iterations before stopping |
| `tol_rel_gap`, `tol_abs_gap` | `1e-5`, `1e-4` | Stop when the bound and the best solution are this close |
| `use_iterative_method` | `nothing` | `nothing` uses one tree if the MILP solver has lazy-constraint callbacks and the iterative method otherwise; HiGHS has none |
| `solve_relaxation` | `true` | Solve the continuous relaxation first to get initial cuts |
| `solve_subproblems` | `true` | Solve the conic subproblem with the integers fixed after each MILP solution |
| `use_extended_form` | `true` | Use extended formulations for the cones, which give tighter cuts |

## Cone Constraints in JuMP

| Constraint | JuMP |
|---|---|
| norm(y) <= t | `[t; y] in SecondOrderCone()` |
| y exp(x / y) <= z | `[x, y, z] in MOI.ExponentialCone()` |
| Matrix X positive semidefinite | `X in PSDCone()` |
| Binary or integer variable | `@variable(model, z, Bin)` or `Int` |

## Common Patterns

- **Cardinality**: binaries `z` with `-M z <= x <= M z` (big-M) or `0 <= x <= z`, and `sum(z) <= k`.
- **Norm objective or constraint**: a second-order cone.
- **Log-loss, entropy, log-sum-exp**: exponential cones.
- **Relaxation**: `undo = relax_integrality(model)` drops integrality; give the model a plain conic optimizer before solving, and Pajarito back before calling `undo()`.

## Statuses

| Status | Meaning |
|---|---|
| `OPTIMAL` | Integer-feasible solution with the gap within tolerance |
| `INFEASIBLE` | No integer point satisfies the constraints |
| `TIME_LIMIT`, `ITERATION_LIMIT` | Stopped early; `has_values(model)` says if a solution was found |
| `OTHER_ERROR` | A subsolver failed; trying the other conic solver often helps |

## See Also
- [Overview](overview.md)
