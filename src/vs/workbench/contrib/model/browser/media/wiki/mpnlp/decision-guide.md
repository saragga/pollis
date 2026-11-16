# Decision Guide

## Choosing Between Ipopt, MadNLP and Uno

| Situation | Solver |
|---|---|
| A smooth NLP of any size, the default choice | **Ipopt** |
| A large NLP with a GPU available | **MadNLP** |
| A solver to read, change or extend from Julia | **MadNLP** |
| A small or medium NLP, or warm starts from a nearby solution | **Uno**, with its SQP preset |
| Another method on the same model, by changing one setting | **Uno**, with another preset |
| A second opinion on a difficult problem | All three, with the **Solver Comparison** |

## When Local Nonlinear Programming Is Not the Right Panel

| Situation | Panel |
|---|---|
| On/off decisions or integer variables | **Mixed-Integer Nonlinear Programming** |
| Nonconvex, and the best of all local optima is required | **Global Nonlinear Programming** |
| Linear, quadratic or conic | Linear, Quadratic, or Convex, Conic and Semidefinite Programming |
| Comparing interior-point, SQP and SLP methods on one problem | **Mathematical Programming Lab** |

## Decision Flow for a Nonlinear Problem
1. **Solve with Ipopt** first: it is fast and shows the shape of the problem.
2. **Run Multi-Start**: if every start reaches the same objective, a local optimum may be enough.
3. **If the starts disagree**, run the **Optimality Gap Check**, or move to Global Nonlinear Programming with tight bounds.
4. **Check the Status and Feasibility**, and the KKT conditions.
5. **Report** the result as a local optimum, unless the problem is convex or a global solver confirmed it.

## Rules of Thumb for Local Solvers
- **Give a good start**: JuMP's start values are the place, and a start from a simpler model often helps.
- **Scale the problem** so that variables and constraints are of order one.
- **Reformulate nonsmooth terms** with auxiliary variables and smooth constraints.
- **Avoid redundant constraints**, which make the multipliers non-unique and slow the solver near the solution.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
