# Diagnostics

## Status and Feasibility of a Global Solve
**Status and Feasibility** reports the termination status, the primal status, and the constraints violated by more than 1e-6 at the reported solution; an empty Dict means feasible. The statuses a global solver returns:
- **OPTIMAL**: the gap between the best solution and the bound is within the solver's tolerance;
- **INFEASIBLE**: a proof that no point in the box satisfies the constraints;
- **TIME_LIMIT** or **ITERATION_LIMIT**: stopped early, with the best solution and bound so far, which together still bracket the optimum.

## Solver Statistics: Nodes, Bound and Gap
**Solver Statistics** reports the solve time, the number of nodes, the best bound and the relative gap, where the solver provides them. The **bound** is the lowest value any point in the box could reach, from the relaxations; the **relative gap** is the distance between it and the best solution, relative to the solution. A gap of 0 means the optimum is proven. Many nodes for a small problem usually mean weak relaxations, often from loose bounds.

## Wider Bounds and the Run Time
**Wider Bounds** solves the same problem with the box widened two, four and eight times and plots the seconds against the widening. When the constraints keep the optimum inside the original box, the optimum stays the same while the time grows, as the relaxations over the larger boxes are weaker. A steep curve says that tightening the bounds is worth more than any solver option. The bounds are restored afterwards.

## Solver Comparison of EAGO, SCIP and Alpine
The **Solver Comparison** solves the same model with the three global solvers and reports the status, the objective and the seconds. All three should agree on the optimum within their tolerances; a disagreement points to a tolerance, a numerical difficulty or a bug, and is worth reporting with the model.

## Quick Checklist for a Global Solve

| Check | Good sign | Warning sign |
|---|---|---|
| Termination | OPTIMAL | A limit reached |
| Feasibility report | Empty | Violated constraints |
| Relative gap | 0 | Large |
| Wider Bounds | Flat curve | Steep curve |
| Solver Comparison | Same objective | Different objectives |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
