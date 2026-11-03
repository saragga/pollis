# Optimisation on Riemannian Manifolds: Interpretation

The printed result names a point and a cost, and the Interpret and Compare actions add what they mean: whether the answer matches a known value, how far the run travelled, and what a solver's lower iteration count really says.

## Reading the printed result

| Output | Meaning | Caution |
|---|---|---|
| `solution` | Final point, as an array | Only its meaning on the manifold matters, see the next section |
| `cost` | f at that point | A local value, unless the problem says otherwise |
| `gradient_norm` | Norm of the Riemannian gradient there | Measured in the manifold's metric |
| `iterations` | Recorded iterations | One iteration costs a different amount in each solver |
| `on_manifold` | Result of `is_point` | Tests the final point |

**Solution** adds `start_cost`, and the drop from there to `cost` measures what the run achieved. Its `solution` is rounded to six significant digits for display, and the `p_opt` kept in memory is not.

## What does the solution array represent?

The same answer can appear as different arrays, so compare answers by what they mean and not entry by entry.

| Manifold | Same answer when | Compare with |
|---|---|---|
| `Sphere(n - 1)`, default cost | The sign of p flips | `cost` |
| `Stiefel(n, 2)`, default cost | The columns are mixed by an orthogonal matrix | `cost`, or the span of the columns |
| `Grassmann(n, 2)` | Any basis of the same subspace is used | `distance(M, p, q)` |

The sign of a unit eigenvector therefore carries no information, and **Multiple Restarts** may reach either of the two.

## Does the answer match the eigenvalue?

**Solution Summary** gives `manifold`, `solution`, `cost`, `gradient_norm`, `on_manifold`, `iterations` and `stopped_because`, and adds `smallest_eigenvalue_of_A`.

On the default problem `cost` should equal that eigenvalue up to the accuracy of the run, since the two come by unrelated routes. A `cost` clearly higher, with a small gradient norm, marks another critical point: a different eigenvector of `A`, where the Rayleigh quotient equals that eigenvector's own eigenvalue.
## What does the Geodesic Distance action show?

**Geodesic Distance** compares three lengths.

| Output | Meaning |
|---|---|
| `start_to_solution` | Length of the shortest path on the manifold, from start to answer |
| `path_length` | Sum of geodesic distances between successive iterates |
| `euclidean_chord` | Straight-line distance in the ambient array |

A `path_length` close to `start_to_solution` shows a direct route, and a much longer one shows zigzags or long detours. On the sphere the chord is shorter than the geodesic, since it cuts through the interior, and the gap grows as the two points move apart. On `SymmetricPositiveDefinite(n)` the two can differ widely, because the metric measures distance in its own way.

## Comparing the solvers fairly

**Algorithm Comparison** runs all four from **Initial Point** under the same stopping rule, after a short warm-up so that `seconds` leaves out compilation.

`iterations` is not a common currency. An iteration of **Trust Regions** includes an inner solve with several Hessian-vector products, and one of **Gradient Descent** a line search with a few cost evaluations. `seconds` is the fairer figure, but it reflects the sizes in use, and the ranking on a small `n` may not hold on a large one.

Compare `cost` and `gradient_norm` together, since a solver that stopped on the iteration limit has not done the same job as one that met the tolerance. A harder cost can order the solvers differently.

## How does accuracy trade against effort?

**Tolerance Sensitivity** solves at tolerances from 1e-2 to 1e-10, with an iteration limit ten times **Max Iterations**. A linearly convergent solver adds roughly the same number of iterations for each step down the table, and a superlinear one adds few once it is close.

`cost` usually settles long before the gradient does, so a loose tolerance is often enough when only the value matters, and a tight one matters when the point itself is the result.

**Iteration Budget** looks at the same trade-off from the other side. It sets `tol` to 0.0 and caps the iterations at 1, 5, 10, 20, 50 and **Max Iterations**, which shows how much of the cost a short run already delivers.

## How to use the Algorithm Guide

**Algorithm Guide** prints a table of `solver`, `per_iteration`, `convergence` and `use_when` for the four solvers. Its entries are rules of thumb that hold across problems, and **Algorithm Comparison** tests them on the problem in hand.

The solvers' convergence results have their conditions, listed in the [Assumptions](assumptions.md) wiki, and they describe behaviour near a minimiser. Far from one, the guarantees in [Boumal (2023)](#ref-Bou2023b) are worst-case bounds on the gradient norm, so the iteration count there depends largely on the shape of the cost.

## References

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
