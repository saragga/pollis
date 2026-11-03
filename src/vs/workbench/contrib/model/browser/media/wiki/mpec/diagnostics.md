# Mathematical Programming with Equilibrium Constraints: Diagnostics

A solution of an MPEC has to pass two tests: the equilibrium must hold at it, and no small change of the decision should improve the objective. The checks examine both, then follow the methods' paths and set them against each other.

## Did the equilibrium hold?

**Complementarity Check** evaluates the equilibrium at the solution.

| Output | Reading |
|---|---|
| `min_y` | Smallest component of y, which should be at least zero |
| `min_f` | Smallest component of f, which should be at least zero |
| `max_complementarity` | Largest absolute y_i f_i, which should be close to zero |
| `y_dot_f` | The sum of y_i f_i |
| `outer_feasible` | `true` when every outer constraint holds within 1e-6 |

**Regularisation** ends with y_i f_i ≤ 1e-8, so `max_complementarity` at that level or smaller shows the last relaxation solved. **Penalty** keeps y ≥ 0 and f ≥ 0 as constraints, and the complementarity falls as mu grows. **Implicit (PATH)** solves the equilibrium to PATH's tolerance at each grid point.

## Reading the Solution Path

**Solution Path** shows how the sequence of subproblems approached the answer.

| Method | Left chart | Right chart |
|---|---|---|
| **Regularisation** | Objective against t, with t decreasing to the right | Largest y_i f_i against t |
| **Penalty** | Objective against mu | Largest y_i f_i against mu |
| **Implicit (PATH)** | F(x, y*(x)) at each grid point | None |

For the first two, an objective that settles while the complementarity falls on the logarithmic scale shows a sequence closing in on an MPEC point. [Hu and Ralph (2004)](#ref-HR2004a) note that the feasible set of each penalty subproblem is larger than that of a regularised one, and they give conditions under which the limit of a penalty method is feasible for the MPEC. The right chart reads that feasibility off directly.

## Is the point stationary?

**Stationarity Check** looks at the implicit objective F(x, y*(x)) on each side of the solution, with a step of 1e-4 scaled by the size of x.

| Output | Reading at a local minimum |
|---|---|
| `right_slope` | At least zero, unless x is at the upper bound |
| `left_slope` | At most zero, unless x is at the lower bound |
| `at_lower_bound`, `at_upper_bound` | Whether x sits on the range set by the constraints |
| `equilibrium_matches` | `true` when PATH's y at the solution matches the method's y |

The check uses one-sided slopes because y*(x) can bend where a component changes between producing and being shut out, and F(x, y*(x)) bends with it. A `false` for `equilibrium_matches` means the method's y differs from the equilibrium PATH finds at the same x, and **Complementarity Check** then shows how far the method's pair is from complementarity.

## Which kind of stationary point?

The stationarity concepts of [Scheel and Scholtes (2000)](#ref-SS2000a) differ only on the degenerate pairs, those with y_i = 0 and f_i = 0 together. [Hu and Ralph (2004)](#ref-HR2004a) state them through the multipliers of y_i ≥ 0 and f_i ≥ 0 on those pairs.

| Concept | Multipliers on each degenerate pair |
|---|---|
| C-stationary | Their product is at least zero |
| M-stationary | Both positive, or their product zero |
| B-stationary, as stated by Hu and Ralph | Both at least zero |

**Active Constraints** lists the degenerate pairs with the status "degenerate (both zero)". With none, the three concepts coincide, and a point that satisfies one satisfies all. A degenerate pair calls for a closer look, as the regularisation is known to reach C-stationary points under MPCC-LICQ.

## Do the methods agree?

**Method Comparison** runs all three methods on the same problem and prints the decision, the objective, the complementarity and the time of each.

Agreement on x and the objective, with small complementarity for all three, is strong evidence for the answer, since the methods reach it by different routes. A different x from **Implicit (PATH)** and the two nonlinear programming methods points to a local solution: the grid compares every one of its points across the range, while Ipopt follows one path from its starting point. A different x between **Regularisation** and **Penalty** points the same way.

The run times reflect the problem size and the machine, and the implicit method's time grows with **Grid Points**.

## Reading the Implicit Objective

**Implicit Objective** plots F(x, y*(x)) over the feasible range of x, with the equilibrium solved by PATH at 200 points, and marks the computed solution.

| Feature | Reading |
|---|---|
| A single valley, with the solution at its foot | A global minimum within the range |
| Several valleys | Local minima, which the grid of **Implicit (PATH)** separates |
| A kink | A change in the set of active components |
| Gaps in the curve | Values of x at which PATH did not report a solution, or the constraints failed |
| The solution on an end of the range | A bound on x is active |

The chart is the clearest picture of an MPEC with one outer decision, since it shows the whole problem the methods solve.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| `solved` is `false` | A subproblem without a feasible point, or PATH failing everywhere | Check the signs of **Equilibrium Map f(x, y)** and the constraints |
| Large `complementarity_violation` | The last subproblem leaves some y_i f_i away from zero | Read **Solution Path** |
| Methods disagree on x | A local solution | Compare with **Implicit Objective** |
| Error on building | **Equilibrium Dimension** not matching f | Set it to the length of f |
| `x_range` fails | x unbounded by the constraints | Add bounds on x |

## References

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-SS2000a"></a>Scheel, H., & Scholtes, S. (2000). Mathematical Programs with Complementarity Constraints: Stationarity, Optimality, and Sensitivity. *Mathematics of Operations Research* 25(1), 1-22. [doi:10.1287/moor.25.1.1.15213](https://doi.org/10.1287/moor.25.1.1.15213)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MPEC](mpec.md)
