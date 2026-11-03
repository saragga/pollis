# Model-Based Methods: Interpretation

The printed result gives a point and a value, and the Interpret actions add what the point means: which limits shape it, how much those limits cost and how sharply f rises around it. Each reading applies to the run in hand, at the settings it used.

## Reading the printed result

| Output | Meaning | Caution |
|---|---|---|
| `minimiser` | Best point returned | A local answer, near **Starting Point** |
| `minimum` | f at that point | Accurate only if f is free of noise |
| `evaluations` | Calls to f by the solver | The main cost when f is expensive |
| `status` | Reason for stopping | Concerns the method's test, not the quality of the point |
| `violation` | Largest breach of enforced constraints | Always 0.0 on **NEWUOA**, **UOBYQA**, **PRAXIS** |

A small positive `violation` on **COBYLA** is ordinary, because that method works with models of the constraints and can end slightly outside them. Decide what size matters in the units of c(x).

## What the status names mean

`status` is printed exactly as the package returns it, so its wording differs between the two packages.

| Package | `status` | Reading |
|---|---|---|
| `PRIMA` | `SMALL_TR_RADIUS` | Radius reached `rhoend`, the normal finish |
| `PRIMA` | `MAXFUN_REACHED` | **Max Evaluations** used up |
| `NLopt` | `XTOL_REACHED` | Change in x fell below `xtol_rel` |
| `NLopt` | `SUCCESS` | A general report of a normal finish |
| `NLopt` | `MAXEVAL_REACHED` | **Max Evaluations** used up |
| `NLopt` | `ROUNDOFF_LIMITED` | Rounding stopped progress, though the point may still be useful |

Other names usually mark a difficulty, such as a `NaN` from f, and call for a look at the objective first. The direct test of exhaustion in either package is `budget_exhausted` in **Convergence Check**.

## What the Solution Summary adds

**Solution Summary** lays each variable beside its `start`, `lower` and `upper` values, and adds `minimum`, `start_value`, `evaluations` and `status`.

A variable that hardly moved may be either already right or poorly scaled, and a large **Initial Radius** relative to its size would point to the second. A variable sitting on `lower` or `upper` is limited by the box. The drop from `start_value` to `minimum` measures what the search achieved, and it is the figure to quote when the true minimum is unknown. The **Starting Point** in the table is the one requested, and **BOBYQA** may first shift a start lying very close to a bound.

## Which constraints bind?

**Constraint Check** lists each constraint with `value`, `satisfied` and `active`, for **COBYLA** and **LINCOA**.

`value` is c(x) on **COBYLA** and A x − b on **LINCOA**, so a negative figure is slack. `satisfied` allows 1e-8 of breach, and `active` marks an absolute value under 1e-6. An active constraint is shaping the answer, and an inactive one could be dropped without changing it locally.

`box_violation` and `total_violation` complete the picture. On the other methods, `general_constraints` holds a sentence saying that none exist. Near the 1e-6 limit a constraint can be practically binding but not flagged, so read `value` as well as the flag.

## What a multiplier says about a constraint

**Scaling Check** reports `multipliers`, one for each active constraint, from the condition grad f + transpose(J) λ = 0. The order is active lower bounds, active upper bounds, then the general constraints.

A multiplier is a price. It approximates how far `minimum` would fall per unit of relaxation of that constraint, so relaxing c(x) ≤ 0 to c(x) ≤ e gains about λ e. That reading is the standard sensitivity result in [Nocedal and Wright (2006)](#ref-NW2006a), and it holds for small changes.

All multipliers should be at least zero at a minimum. A clearly negative one means that moving off that constraint would lower f, so the point is not a minimum and the run should continue. A multiplier near zero on an active constraint means it binds with almost no cost.

## How well conditioned is the minimum?

`reduced_hessian_eigenvalues` measure the curvature of the Lagrangian in the directions the active constraints leave free, and `condition_number` is the ratio of the largest to the smallest in absolute size. Differences use h = 1e-4, so eigenvalues close to zero carry rounding error.

| `advice` | Meaning | Response |
|---|---|---|
| `reasonably scaled` | Curvatures are comparable, at 1e4 or below | Nothing needed |
| `ill-conditioned: rescale the variables so curvatures are similar` | Some directions are far flatter than others | Rescale, and trust flat directions less |
| `a negative eigenvalue: not a local minimum on the free directions` | f falls along a free direction | Restart, unless the value is rounding-sized |
| `vertex: the active constraints pin down the solution` | No free directions remain | Multipliers tell the whole story |

A large figure under the limit of 1e4 can still mean slow progress, as the narrow valley of Rosenbrock shows.

## How sensitive is the value to each variable?

**Sensitivity** evaluates f after a move of 1% of `ub[i] − lb[i]` in each variable alone, and gives the change in `down` and `up`.

At an interior minimum both should be at or above zero, and their size ranks the variables by how tightly the problem fixes them. A small pair marks a variable that could change noticeably at little cost. A negative entry at an interior point shows that the run has not converged.

At a constrained minimum a negative entry is expected in the direction that crosses the constraint. The moves ignore every constraint, so such a point is not available in practice. Moves along single axes also miss the curved directions along a valley, and **Scaling Check** covers those.

## Comparing methods and implementations fairly

**Method Comparison** runs all seven methods and plain Nelder-Mead on f with the same start and budget, leaving out general constraints. Rows marked `(box)` keep to the box, while **NEWUOA**, **UOBYQA** and **PRAXIS** ignore it and can reach lower values outside it. On a constrained problem, values can also lie below the constrained `minimum`, since they answer a different question. `seconds` comes from a second, compiled run, and it matters only when f is cheap enough for the solver's arithmetic to count. For an expensive f, read `evaluations`.

**NLopt vs PRIMA** runs COBYLA in both implementations. Their stopping rules differ, `rhoend` in one and `xtol_rel` in the other, so `evaluations` is not a pure measure of efficiency. Compare `minimum` and `max_constraint` together, since a lower value bought with a larger breach is no gain. On methods without general constraints, the action uses a constant inactive constraint and tests only the box.

## References

<a id="ref-NW2006a"></a>Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
