# Decision Guide

## Choosing Between EAGO, SCIP and Alpine

| Situation | Solver |
|---|---|
| Pure Julia, or functions defined in Julia | **EAGO** |
| Integer variables, or many constraints | **SCIP** |
| Products of variables, as in pooling and blending | **Alpine** |
| A long run on a hard problem | Two of them, with the **Solver Comparison** |

## When Global Nonlinear Programming Is Not the Right Panel

| Situation | Panel or menu |
|---|---|
| A local optimum is enough, or the problem is convex | **Nonlinear Programming** |
| Integer decisions in the model | **Mixed-Integer Nonlinear Programming** |
| A black-box objective with no formula | Optimise > Global Optimisation |

## Decision Flow for a Nonconvex Problem
1. **Solve locally first**, in the Nonlinear Programming panel, to learn the shape of the problem and a good value.
2. **Bound every variable** as tightly as the problem allows, using what the constraints imply.
3. **Solve with EAGO or SCIP**, and read the gap and the nodes.
4. **If it is slow**, tighten the bounds, add constraints that cut off parts of the box no solution can use, or reduce the number of nonlinear variables.
5. **Report** the optimum with the solver, the status, the gap and the bounds.

## Rules of Thumb for Spatial Branch and Bound
- **Tight bounds** matter more than any solver option.
- **Reformulate** so that fewer variables appear in nonconvex terms: the cost grows with them, not with the linear ones.
- **Redundant constraints** that a local solver dislikes can help a global one, by tightening its relaxations.
- **Check a binding added bound**: the true optimum may lie outside the box.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
