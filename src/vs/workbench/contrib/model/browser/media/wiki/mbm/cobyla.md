# COBYLA

Constrained Optimisation BY Linear Approximations, from [Powell (1994)](#ref-Pow1994a), handles inequality constraints that are as much a black box as the objective. It is the only method in the panel that takes nonlinear constraints.

## What problem does COBYLA solve?

**COBYLA** minimises f(x) subject to c_i(x) ≤ 0 for each row of **Constraints c(x) <= 0**, and to the box given by **Lower Bounds** and **Upper Bounds**. Neither f nor c needs derivatives, and each constraint can be the output of a simulation.

The panel calls `cobyla(fr, x0; nonlinear_ineq=c, xl=lb, xu=ub, maxfun, rhobeg, rhoend=1e-8)`, from the package of [Zhang (2023)](#ref-Zha2023a). The default ball sum(x²) ≤ 2 excludes the unconstrained minimiser of Rosenbrock once n reaches 3, so the default run shows a solution pressed against a constraint.

## How one iteration works

The method keeps n + 1 points that form a simplex. Those values determine a unique linear model of f, and of each c_i.

1. Minimise the linear model of f, subject to the linear models of the constraints, within a ball of the current radius.
2. If the models of the constraints cannot all be met inside the ball, reduce the largest predicted violation instead.
3. Evaluate f and c at the trial point, and judge it by a merit function: f(x) + mu · max(0, largest c_i(x)).
4. Replace one vertex with the new point, or take a step that restores the shape of the simplex.

The penalty weight mu rises when the predicted merit would otherwise fail to improve, which ties together the two goals of lowering f and staying feasible.

## Why it may visit infeasible points

The constraints are only ever known through models, so a step that looks feasible can turn out not to be. **COBYLA** works with a merit function that accepts this, and it evaluates f and c on either side of the boundary during the search.

That has three practical results. f and c must both be computable outside the feasible set. **Convergence Curve** can end lower than the reported `minimum`, since it counts every point visited. The final point can carry a small breach, so read `violation` and `value` in **Constraint Check** in the units of c. A breach of the order of the final radius is normal, and a larger one usually means that the budget ran out.

## Strengths and limits of a linear model

A linear model has no curvature, so a step is always pushed out to the edge of the ball or to a constraint. Near a constrained solution with enough active constraints, that is fine, as the constraints themselves fix the point. In the interior or along a curved boundary, it progresses slowly, and a smooth objective can use many times the evaluations **BOBYQA** would need for the same accuracy.

In return, n + 1 points are the cheapest possible model, and a slope is less affected by small irregularities than a curvature estimate fitted from the same few values. Raise **Max Evaluations** well beyond the levels that suit the quadratic methods, and use **Budget Sweep** to see the effect. `COBYLA (box)` in **Method Comparison** sets the cost beside the quadratic methods, with the general constraints left out.

## Comparing the two implementations

**NLopt vs PRIMA** runs the same problem through `:LN_COBYLA` from [Johnson (2007)](#ref-Joh2007b) and through `PRIMA`. The first descends from Powell's original code, and the second is the modernised rewrite. Results can differ, as can the number of evaluations, since their stopping rules differ. The two rows have `max_constraint` beside `minimum` so that a lower value can be weighed against any larger breach.

On **LINCOA**, the same action passes A x − b to COBYLA as if those were nonlinear constraints, which gives a useful comparison with the linear-constraint method. The general setting and its theory are in [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a).

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Joh2007b"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimisation Package.

<a id="ref-Pow1994a"></a>Powell, M. J. D. (1994). A Direct Search Optimisation Method That Models the Objective and Constraint Functions by Linear Interpolation. In *Advances in Optimization and Numerical Analysis*, 51-67. Springer. [doi:10.1007/978-94-015-8330-5_4](https://doi.org/10.1007/978-94-015-8330-5_4)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
