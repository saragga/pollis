# Model-Based Methods: Diagnostics

A derivative-free solver returns a point and a reason for stopping, and neither proves the point is a minimum. The checks ask whether the run finished, whether the point meets the conditions of a minimum, and whether another start or a further restart would change the answer.

## Did the run finish, or did the budget end it?

**Convergence Check** reports `status`, `evaluations`, `budget` and `budget_exhausted`, and those come first in any reading. A `budget_exhausted` of `true` means the method was stopped from outside, so `minimum` is only the best value found so far.

A run that stopped by itself, on a final radius or a small change in x, has satisfied the method's own test. That test concerns the size of steps, not the slope of f, so a stall on a kink or in a noisy region can stop in the same way. A self-declared finish therefore makes the other checks worth running, and does not replace them.

## Which gradient norm should be near zero?

**Convergence Check** estimates the gradient at `x_best` by central differences with h = 1e-6, using 2n extra evaluations that are not counted in `evaluations`.

| Output | Meaning | Should be near zero when |
|---|---|---|
| `gradient_norm` | Size of the full gradient | The minimiser is in the interior |
| `active_constraints` | Number of constraints within 1e-6 of binding | Not applicable |
| `projected_gradient_norm` | Gradient left after removing the active normals | Always, at a minimum |

On a constrained minimum a large `gradient_norm` is normal. Rounding limits what can be seen, at about 1e-10 times the size of f, so a value at that level is as good as zero. The projection ignores the signs of the multipliers, and **Scaling Check** supplies those.

## Reading the Convergence Curve

**Convergence Curve** plots the lowest value seen so far on a log scale, after subtracting a small shift that keeps negative values on the chart.

Long plateaus followed by sharp drops are typical of curved valleys, and a final steep fall shows the quadratic model taking hold near the minimum. A curve still falling at the last evaluation calls for more **Max Evaluations**. A curve with a flat tail over many evaluations suggests that the run could have stopped sooner, or that the solver is spending its budget below the noise level.

The curve includes every evaluated point. **COBYLA** and **LINCOA** can visit points that break a constraint, so the curve may end below the reported `minimum`. When f goes negative, the shift places the lowest value at the bottom of the axis, which makes the last drop look more dramatic than it is.

## Where did the solver actually look?

**Query Scatter** shows every evaluated point in the first two variables, coloured by order, and **Objective Surface** adds the contours and the path of improving points. The two charts need at least two variables.

The early pattern shows the first model: a star of points at **Initial Radius** along each axis for the quadratic methods, and a small simplex for **COBYLA**. A healthy run then drifts towards the minimiser and tightens into a dense cluster. Points scattered widely to the very end suggest a radius that is too large or a jagged objective.

With more than two variables, the surface is a slice through the minimiser, whereas the path is a projection of points whose other coordinates differ. A path crossing a contour uphill is therefore not an error.

## Does another start reach the same minimum?

**Multi-Start** runs the current method from ten points drawn uniformly in the box, with seed 1.

| Output | Reading |
|---|---|
| `minima` | The ten final values |
| `share_at_best` | Share within 1e-6 of the best of the ten |
| `max_distance_between_minimisers` | Widest gap between final points |
| `mean_evaluations` | Typical cost of one run |

A low `share_at_best` indicates several local minima, or runs that ended early, and the two can be told apart by raising **Max Evaluations**. A large distance alongside a high share points to a flat region or to equivalent solutions. The starts ignore any constraint other than the box, and the output does not report `violation`, so a surprisingly low value on **COBYLA** or **LINCOA** needs checking from that start.

## Does a restart improve the result?

**Warm Start** runs the method again from `x_best` with `rhobeg / 10`, which rebuilds the model from fresh points around the solution.

An `improvement` near zero with a small `moved` supports the first answer, at the cost of `extra_evaluations`. A real `improvement` means the first run stopped short, and a common reason is a model whose points had drifted into a poor shape. A large `moved` with no gain marks a flat direction, in which many points are about equally good.

Restarting is cheap evidence and also a practical remedy, since an improved `minimum` is a usable answer. Repeated restarts that keep improving suggest noise or a very ill-conditioned problem, and **Scaling Check** then helps.

## Is the budget large enough?

**Budget Sweep** reruns the method from **Starting Point** at budgets of 50, 100, 200, 500, 1000 and **Max Evaluations**.

Look for the budget at which `minimum` settles and `status` stops reporting exhaustion. A curve that keeps improving up to the last row means the largest budget was still too small. A method needing more than the smallest budget just to build its first model returns little at that row. This is the same comparison that [Moré and Wild (2009)](#ref-MW2009a) make across a test set with data profiles, which measure how many problems a solver settles within each budget.

## Is the solution inside the box?

**Bounds Feasibility** reports `inside_box`, `min_slack`, `at_lower` and `at_upper`, using a tolerance of 1e-6 for the last two.

On **BOBYQA**, **LINCOA**, **COBYLA** and **Sbplx**, the box is part of the problem, and variables listed in `at_lower` or `at_upper` are simply pressing against it. Such a variable may mean that the box is too tight, and a wider box is worth a try if the bound was arbitrary. On **NEWUOA**, **UOBYQA** and **PRAXIS**, the box is not enforced and a negative `min_slack` is no failure, though it does mean the answer lies outside the box used for sampling and plots. The printed `violation` is 0.0 on those three whatever happens, so `inside_box` is the check to use.

## Common symptoms and their usual causes

| Symptom | Usual cause | What to try |
|---|---|---|
| `budget_exhausted` is `true` | Hard valley or too many variables | Raise **Max Evaluations**, or try **Warm Start** |
| Self-stopped with a large `projected_gradient_norm` | Kink or noise | Try **Sbplx**, or loosen the final radius |
| Large value with an active constraint missed | Stopped just short of the boundary | Inspect `value` in **Constraint Check** |
| `minima` split into two groups | Two local minima | Report both, keep the lower |
| Long stall, then a sudden drop | Curved valley | Rescale the variables, or just allow more evaluations |
| Error from f during a run | f undefined off the feasible set | Guard f, or choose **BOBYQA** |

## References

<a id="ref-MW2009a"></a>Moré, J. J., & Wild, S. M. (2009). Benchmarking Derivative-Free Optimization Algorithms. *SIAM Journal on Optimization* 20(1), 172-191. [doi:10.1137/080724083](https://doi.org/10.1137/080724083)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
