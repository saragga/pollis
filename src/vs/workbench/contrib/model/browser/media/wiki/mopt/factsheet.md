# Optimization on Riemannian Manifolds: Factsheet

A quick reference for **Optimization on Riemannian Manifolds**: the four algorithms, their inputs, what stops a run and what each action computes. All four run through `Manopt.jl` on a manifold from `Manifolds.jl`, and the gradient comes from `ForwardDiff` and `ManifoldDiff`.

## The four algorithms side by side

| Algorithm | Call | Search direction | Step control |
|---|---|---|---|
| **Gradient Descent** | `gradient_descent` | Negative Riemannian gradient | Armijo line search |
| **Conjugate Gradient** | `conjugate_gradient_descent` | Negative gradient plus a multiple of the transported previous direction | Armijo line search |
| **Quasi-Newton** | `quasi_Newton` | Limited-memory BFGS, with stored vectors transported | `WolfePowellLinesearch` |
| **Trust Regions** | `trust_regions` | Truncated conjugate gradient on a quadratic model | A radius, updated from actual against predicted decrease |

Each one starts from **Initial Point** and returns a point on the manifold.

## Inputs and their defaults

| Input | Default | Meaning |
|---|---|---|
| **Ambient Dimension (n)** | 5 | Size of `A`, and of the default manifold's embedding |
| **Manifold** | `Sphere(n - 1)` | The search space |
| **Objective f(M, p)** | `dot(p, A * p)` | Cost at a point p, the Rayleigh quotient by default |
| **Initial Point** | `normalize(ones(n))` | Starting point, which must lie on the manifold |
| **Max Iterations** | 200 | Iteration limit |
| **Gradient Tolerance** | 1e-8 | Limit on the norm of the Riemannian gradient |

`A` is `(B + transpose(B)) / 2`, where `B` is `randn(n, n)` with seed 1.

## Manifolds named in the tooltip

| Input | Points | An application in [Boumal (2023)](#ref-Bou2023b) |
|---|---|---|
| `Sphere(n - 1)` | Unit vectors in n dimensions | Extreme eigenvalue or singular value |
| `Stiefel(n, 2)` | n × 2 matrices with orthonormal columns | Principal component analysis |
| `Grassmann(n, 2)` | Two-dimensional subspaces of n dimensions | Principal component analysis |
| `SymmetricPositiveDefinite(n)` | Symmetric positive definite n × n matrices | Gaussian mixture models |

On anything but the sphere, **Initial Point** needs a new value, and `rand(M)` draws a valid one.

## What a run builds and prints

`solve` runs the chosen algorithm and records the cost, gradient norm and iterate at each iteration, for the charts and actions to use. Its result `res` holds `p`, `costs`, `gnorms`, `iterates` and `reason`, and `p_opt` repeats `res.p`.

The printed result has `solution`, `cost`, `gradient_norm`, `iterations` and `on_manifold`, the last from `is_point`. Extra keywords given to `solve` go straight to the solver, as `solve(memory_size=50)` would on **Quasi-Newton**.

## What stops a run

Every algorithm uses the same rule, `StopAfterIteration(maxiters) | StopWhenGradientNormLess(tol)`, and the first test to be met ends the run. `res.reason` names the one that did. The two inputs replace the limits that each solver would otherwise use, which differ from one solver to another.

The gradient norm is measured in the metric of the manifold, through `norm(M, p, X)`. The plain Euclidean length of the same vector can differ when the manifold has a metric of its own.

## Settings without an input of their own

`Manopt.jl`'s documentation gives these defaults, which the code leaves in place. Any of them can be changed by a keyword to `solve`, or in the solver's call in the code for the actions that call it directly.

| Solver | Keyword | Default |
|---|---|---|
| All | `retraction_method` | `default_retraction_method(M, typeof(p))` |
| **Conjugate Gradient** | `coefficient` | `ConjugateDescentCoefficient()` |
| **Conjugate Gradient** | `restart_condition` | `RestartOnNonDescent()` |
| **Quasi-Newton** | `direction_update` | `InverseBFGS()` |
| **Quasi-Newton** | `memory_size` | `min(manifold_dimension(M), 20)` |
| **Trust Regions** | `max_trust_region_radius` | `sqrt(manifold_dimension(M))` |
| **Trust Regions** | `trust_region_radius` | `max_trust_region_radius / 8` |
| **Trust Regions** | `acceptance_rate` | 0.1 |

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Convergence Trace** | Cost at each iteration |
| Visualise | **Gradient Norm** | Gradient norm per iteration, log scale, with `tol` marked |
| Visualise | **Iterate Path** | Geodesic distance to the solution per iteration, log scale |
| Diagnose | **Gradient Check** | `finite_difference`, `gradient`, `relative_error` along five geodesics |
| Diagnose | **Debug Output** | Iteration, cost and gradient norm every 10 iterations |
| Diagnose | **Stopping Criterion** | `reason`, `final_gradient_norm`, `converged` |
| Predict | **Solution** | `solution`, `cost`, `on_manifold`, `gradient_norm`, `start_cost` |
| Predict | **Multiple Restarts** | 10 random starts: `costs`, `gradient_norms`, `share_at_best` |
| Predict | **Warm Start** | `moved`, `extra_iterations`, cost and gradient before and after |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Algorithm Comparison** | `cost`, `gradient_norm`, `iterations`, `seconds` for all four solvers |
| Compare | **Iteration Budget** | `cost`, `gradient_norm` at limits from 1 up to **Max Iterations** |
| Compare | **Tolerance Sensitivity** | `iterations`, `cost`, `seconds` at tolerances from 1e-2 to 1e-10 |
| Interpret | **Solution Summary** | The run's totals, `stopped_because`, `smallest_eigenvalue_of_A` |
| Interpret | **Geodesic Distance** | `start_to_solution`, `path_length`, `euclidean_chord` |
| Interpret | **Algorithm Guide** | A fixed table of cost, convergence and use for each solver |

## Packages and textbooks

`Manopt.jl` is described by [Bergmann (2022)](#ref-Ber2022a), and `Manifolds.jl` by [Axen, Baran, Bergmann and Rzecki (2023)](#ref-ABBR2023a). `ForwardDiff` and `ManifoldDiff` supply the gradient, and `Plots` draws the three charts.

[Boumal (2023)](#ref-Bou2023b) is an introduction to the field, with a free pre-publication version on its author's website. [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a) treat line-search and trust-region algorithms on matrix manifolds.

## References

<a id="ref-AMS2008a"></a>Absil, P.-A., Mahony, R., & Sepulchre, R. (2008). *Optimization Algorithms on Matrix Manifolds*. Princeton University Press.

<a id="ref-ABBR2023a"></a>Axen, S. D., Baran, M., Bergmann, R., & Rzecki, K. (2023). Manifolds.jl: An Extensible Julia Framework for Data Analysis on Manifolds. *ACM Transactions on Mathematical Software* 49(4), 1-23. [doi:10.1145/3618296](https://doi.org/10.1145/3618296)

<a id="ref-Ber2022a"></a>Bergmann, R. (2022). Manopt.jl: Optimization on Manifolds in Julia. *Journal of Open Source Software* 7(70), 3866. [doi:10.21105/joss.03866](https://doi.org/10.21105/joss.03866)

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
