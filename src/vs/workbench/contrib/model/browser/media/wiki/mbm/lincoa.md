# LINCOA

The LINearly Constrained Optimisation Algorithm extends Powell's quadratic models to general linear inequalities. Budgets, weights that sum to a limit and orderings between variables are the kind of rule it was made for.

## What problem does LINCOA solve?

**LINCOA** minimises f(x) subject to A x ≤ b, from **Constraint Matrix (A)** and **Right-Hand Side (b)**, along with the box. The panel calls `lincoa(fr, x0; linear_ineq=(A, b), xl=lb, xu=ub, maxfun, rhobeg, rhoend=1e-8)`, from the package of [Zhang (2023)](#ref-Zha2023a).

Each row of A is one constraint, so A needs n columns and b needs as many entries as A has rows. The default single row of ones, with b = 2, requires the variables to sum to at most 2, which excludes the Rosenbrock minimiser once n reaches 3. Bounds could be written as rows of A too, but the separate inputs are clearer.

## How the trust-region step keeps the constraints

The defining part of the method is its step. [Powell (2015)](#ref-Pow2015a) considers a quadratic model minimised under a trust-region bound together with linear constraints that have to hold at the current point and at the next.

The constraints are treated by active sets: those near binding are held as equalities for the moment, which removes some freedom from the step, and the set can be updated during an iteration. A truncated conjugate gradient search in the remaining directions gives a step at a cost of order n² operations on a typical iteration when n is large. A linear constraint is known exactly, so the method needs no model and no merit function for it, unlike **COBYLA**.

## What stays the same as in NEWUOA

The model itself follows the pattern of [Powell (2006)](#ref-Pow2006a): 2n + 1 points by default, least-change updates of the second-derivative matrix and the two radii delta and rho.

Linear constraints bring one added difficulty, which is keeping the interpolation points well spread when the feasible region is narrow. A set of points squeezed against a constraint gives little information across it. The method therefore has to balance a well-shaped set against staying within the limits, and this is why **Query Scatter** on a tight problem can show evaluations right up to a boundary.

## Should the problem use LINCOA or COBYLA?

| Question | **LINCOA** | **COBYLA** |
|---|---|---|
| Form of constraints | A x ≤ b only | Any c(x) ≤ 0 |
| Model of f | Quadratic | Linear |
| Model of constraints | None needed, known exactly | Linear interpolation |
| Typical evaluations on smooth f | Fewer | More |
| Infeasible visits during the search | Limited | Part of the method |

Whenever the constraints are linear, **LINCOA** has more to work with. **NLopt vs PRIMA** on **LINCOA** passes the same linear constraints to both versions of COBYLA, so its rows can be compared directly with the main run.

## Which inputs cause trouble?

A **Starting Point** that breaks A x ≤ b gives the method less to start from, so choose one that is feasible. **Multi-Start** samples only from the box, so some of its starts may break the linear constraints, and those runs are worth checking separately.

Constraints that are redundant or nearly parallel leave active sets badly conditioned, and removing or merging the rows usually helps. A row scaled very differently from the others distorts the distance to its boundary, so divide each row by the size of its coefficients when they vary widely. An empty feasible region cannot be solved by any choice of settings, and `value` in **Constraint Check** shows which row stays above zero.

## Reading a LINCOA run

`violation` combines A x − b with the box, and **Constraint Check** gives `value`, `satisfied` and `active` per row. For an active row, the matching entry in `multipliers` from **Scaling Check** is the price of that row, in units of f per unit of b. The entries for active bounds come first, then those for the linear rows.

Since linear constraints have no curvature, the reduced Hessian here is just the Hessian of f restricted to the free directions. Those directions may be few. If they run out, `advice` reports a vertex, and the constraints alone fix the solution. A broader treatment of methods with constraints is in [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a).

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Pow2006a"></a>Powell, M. J. D. (2006). The NEWUOA Software for Unconstrained Optimisation Without Derivatives. In *Large-Scale Nonlinear Optimization*, 255-297. Springer. [doi:10.1007/0-387-30065-1_16](https://doi.org/10.1007/0-387-30065-1_16)

<a id="ref-Pow2015a"></a>Powell, M. J. D. (2015). On Fast Trust Region Methods for Quadratic Models with Linear Constraints. *Mathematical Programming Computation* 7(3), 237-267. [doi:10.1007/s12532-015-0084-4](https://doi.org/10.1007/s12532-015-0084-4)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
