# MMA

The **Method of Moving Asymptotes** (Svanberg, 1987; the globally convergent version, 2002) replaces, at each iteration, the objective and every constraint by a **convex, separable approximation**: a sum of functions of one variable each, of the form a / (U - x_j) + b / (x_j - L), with asymptotes L and U on either side of the current point. The approximate problem is convex and separable, so it is solved cheaply through its dual.

## The Moving Asymptotes
The asymptotes move from iteration to iteration: they are brought closer to the current point when the iterates oscillate, which makes the approximation more conservative and the steps shorter, and pushed further away when progress is steady, which allows longer steps.

## Conservative Approximations
The globally convergent version adds a penalty that makes each approximation an upper bound, a **conservative** model, of the true function at the new point. If a step is not acceptable the approximation is made more conservative and the subproblem resolved. Once the iterates are feasible, they **stay feasible**, which is valuable in engineering design, where an infeasible design is useless.

## When It Shines
MMA was designed for **structural optimisation and topology design**, with thousands or millions of variables and only a few constraints: its cost per iteration grows with the number of variables only linearly, and the dual problem has one variable per constraint.

## Limitations
It handles **inequality constraints only**, not equalities, and its final convergence is slower than SLSQP's.

## In This Panel
The panel uses NLopt's :LD_MMA, with gradients from ForwardDiff and the same tolerances as SLSQP. **Max Iterations** limits objective evaluations.

## See Also
- [SLSQP](slsqp.md) · [Interior Point](interior-point.md) · [Decision Guide](decision-guide.md)
