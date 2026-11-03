# Optimization on Riemannian Manifolds: Diagnostics

A run returns a point and a reason for stopping, and the checks ask whether that reason can be trusted: whether the gradient was right, whether the limit or the tolerance ended the run, and whether another start or a tighter tolerance changes the answer.

## Is the gradient right?

Run **Gradient Check** first on any new cost or manifold. It picks five random unit tangent vectors at **Initial Point**, and compares the slope of f along the geodesic in each direction, by central differences with t = 1e-6, with the inner product of the gradient and that direction.

| Output | Reading |
|---|---|
| `finite_difference` | Slope measured from the cost |
| `gradient` | Slope predicted by `grad_f` |
| `relative_error` | Should be small on all five rows |

The gradient here is automatic, so the check mainly tests the expression and the conversion to the manifold. [Boumal (2023)](#ref-Bou2023b) describes a fuller test in the same spirit, which plots the error of a first-order expansion against the step on log-log axes and looks for a slope of two.

## Why did the run stop?

**Stopping Criterion** reports `reason`, `iterations`, `max_iterations`, `final_gradient_norm`, `tolerance` and `converged`, and `converged` is `true` when the last gradient norm is under `tolerance`.

The rule has only the two tests, so a run that does not reach the tolerance ends on the iteration limit, and `reason` says so in the package's words. The remedy is to raise **Max Iterations** or to change algorithm. A stalled run ends in the same way, with a gradient norm that has stopped falling, and more iterations will not help it.

**Debug Output** prints iteration, cost and gradient norm every 10 iterations while solving, which helps to see where a long run spends its time.

## Reading the Gradient Norm chart

**Gradient Norm** is the sharpest of the three charts, as it is the quantity the stopping rule tests. The dashed line marks **Gradient Tolerance**, and values are floored at 1e-16 for the log scale.

| Shape | Reading |
|---|---|
| Steady straight fall | Linear convergence |
| Fall that steepens | Superlinear convergence |
| Saw-tooth with a downward trend | Ordinary for **Conjugate Gradient** and **Quasi-Newton**, whose gradient norm need not fall at each step |
| Flat at a high level | A stalled run, or a slow valley |
| Flat at a very low level | Rounding in the cost or the gradient |

A plateau followed by a fall can mark a pass close to a saddle, which **Gradient Descent** approaches slowly and leaves slowly.

## Reading the Iterate Path chart

**Iterate Path** plots the geodesic distance from each iterate to the final point on a log scale, so its slope reads as the rate of convergence, and its description names the three cases to look for.

A straight line means linear convergence, a line that bends downwards superlinear, and a line that flattens sublinear. The reference point is the last iterate and not the true minimiser, so the final few points always fall towards zero, and the slope is best read before them.

**Convergence Trace** shows the cost itself, on a linear scale. It flattens early in most runs, and the two log charts carry on showing progress long after that.

## Do other starts reach the same cost?

**Multiple Restarts** solves from 10 random points, drawn with `rand(M)` and seed 3.

| Output | Reading |
|---|---|
| `costs` | The ten final values |
| `gradient_norms` | Their final gradient norms |
| `best`, `worst` | The range |
| `share_at_best` | Share within 1e-8 of `best` |
| `selected_run_cost` | The main run, from **Initial Point** |
| `smallest_eigenvalue_of_A` | The global minimum, for the default cost on the sphere |

A high cost paired with a small gradient norm marks a saddle or another local minimum, and a high cost with a large norm marks a run that stalled or ran out of iterations.

## Does a tighter tolerance change the answer?

**Warm Start** resumes from the solution with a tolerance a hundred times smaller, and reports `cost_before`, `cost_after`, `gradient_before`, `gradient_after`, `moved` and `extra_iterations`.

A negligible cost change with a small `moved` supports the first answer. A large `moved` with no change in cost marks a flat direction, as happens where minimisers are not isolated. A `gradient_after` that stays far from the new tolerance, after many `extra_iterations`, may show where rounding sets the limit, and then a tighter tolerance has nothing left to gain.

## Common failures and their usual causes

| Failure | Usual cause | What to try |
|---|---|---|
| Error at the start of a run | **Initial Point** does not fit **Manifold** | Use `rand(M)` |
| Error from `ForwardDiff` | Cost not written in generic Julia | Rewrite the expression |
| Size mismatch in the cost | `A` and p differ in shape | Set **Ambient Dimension (n)** and **Manifold** together |
| Large `relative_error` | Mistake in the cost, or a cost that is not smooth at the start | Check the expression, test another point |
| `share_at_best` is low | Several local minima, or too few iterations | Raise **Max Iterations**, then compare the groups |
| `converged` is `false` at a low cost | **Gradient Tolerance** near the rounding floor | Relax it, as **Tolerance Sensitivity** suggests |

## References

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
