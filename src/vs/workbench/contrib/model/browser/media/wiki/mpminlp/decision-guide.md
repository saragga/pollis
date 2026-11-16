# Decision Guide

## Choosing Between SCIP, Juniper and Bonmin

| Situation | Solver |
|---|---|
| Nonconvex, and the optimum must be proven | **SCIP** |
| Convex MINLP, or a quick good solution to a large one | **Juniper** |
| Convex MINLP, and a second solver to check Juniper's answer | **Bonmin** |

## When Mixed-Integer Nonlinear Programming Is Not the Right Panel

| Situation | Panel |
|---|---|
| No integer variables, a local optimum is enough | **Local Nonlinear Programming** |
| No integer variables, the global optimum is needed | **Global Nonlinear Programming** |
| Linear or quadratic with integers | Linear or Quadratic Programming |

## Decision Flow for a Problem with Discrete Decisions
1. **Write each decision as a binary**, and tie the continuous variables to it with switches whose bounds are as tight as possible.
2. **Solve with SCIP**, and read the gap and the nodes.
3. **If it is slow**, tighten the bounds, check the **Price of Integrality**, or try Juniper for a good solution quickly.
4. **Check the answer** with the **Solver Comparison**, especially on a nonconvex problem.
5. **Report** the solver, the status and the gap with the result.

## Rules of Thumb for Branch and Bound
- **Tight big-M bounds** are the most effective way to speed up branch and bound.
- **Fewer binaries** beat clever branching: aggregate decisions that always go together.
- **Symmetric formulations**, where swapping variables gives the same solution, multiply the nodes; breaking the symmetry with an ordering constraint helps.
- **Do not trust Juniper's optimality** on nonconvex problems.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
