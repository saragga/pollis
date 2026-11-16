# Diagnostics

## Status and Feasibility of a Mixed-Integer Solve
**Status and Feasibility** reports the termination status, the primal status, and the constraints violated by more than 1e-6 at the reported solution, the integrality of the switches included; an empty Dict means feasible. The statuses a MINLP solver returns:
- **OPTIMAL**: the gap between the best solution and the bound is within the solver's tolerance (SCIP);
- **LOCALLY_SOLVED**: Juniper or Bonmin finished its tree, optimal only if the problem is convex;
- **INFEASIBLE**: from SCIP, a proof that no point satisfies the constraints and the switches;
- **TIME_LIMIT** or **NODE_LIMIT**: stopped early, with the best solution and bound so far.

## Solver Statistics: Nodes, Bound and Gap
**Solver Statistics** reports the solve time, the number of branch-and-bound nodes, the best bound and the relative gap, where the solver provides them. The **relative gap** between the best solution and the bound measures how far the answer is from proven: 0 means optimality is proven. Many nodes for a small problem usually mean weak relaxations, often from loose big-M bounds.

## Price of Integrality
The **Price of Integrality** solves a copy of the model with the switches relaxed to [0, 1], with the same solver, and sets its optimum beside the integer one. Solved by SCIP, the relaxation's optimum is a bound on the integer optimum; solved locally by Juniper or Bonmin, it is one only on a convex problem. The difference between the two optima is what the on/off decisions cost. A small difference means the relaxation is tight and branch and bound has little to do; a large one means many nodes, or a formulation worth tightening.

## Solution Profile
The **Solution Profile** draws each variable at the optimum against its bounds, the variables switched on in colour. A switched-on variable at zero is a sign that the limit on the nonzeros does not bind; a switched-off variable that the continuous problem would want large shows where the limit costs most.

## Quick Checklist for a Mixed-Integer Solve

| Check | Good sign | Warning sign |
|---|---|---|
| Termination | OPTIMAL | A limit reached, LOCALLY_SOLVED on a nonconvex problem |
| Feasibility report | Empty | Violated constraints |
| Relative gap | 0 | Large |
| Nodes | Few | Many, for a small problem |
| Solver Comparison | Same objective | Juniper or Bonmin worse than SCIP |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
