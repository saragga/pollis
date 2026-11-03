# Optimization on Riemannian Manifolds: Overview

Some unknowns have to stay on a curved set: a unit vector, a matrix with orthonormal columns, a subspace, a positive definite matrix. **Optimization on Riemannian Manifolds** takes that set as the whole search space, so every iterate meets the constraint by construction and the problem can be solved as an unconstrained one on the manifold.

## What kind of problem does the panel solve?

The problem is to minimise a smooth function f(p) over the points p of a smooth manifold M. The panel offers four algorithms for it, and each works from the value and the gradient of f.

| Task | Unknown | Manifold |
|---|---|---|
| Smallest eigenvalue of a matrix | A unit vector | `Sphere(n - 1)` |
| Principal component analysis | Orthonormal columns, or the subspace they span | `Stiefel(n, 2)`, `Grassmann(n, 2)` |
| Fitting a Gaussian mixture | Covariance matrices | `SymmetricPositiveDefinite(n)` |

These tasks are among the opening examples of [Boumal (2023)](#ref-Bou2023b). Theory and algorithms for matrix manifolds are also set out by [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a).

## Why can't a step simply add a vector to the point?

A point of a curved set plus a vector generally lies off the set. The Euclidean recipe therefore needs a counterpart for each of its parts.

| Tool | What it does | In a linear space |
|---|---|---|
| Tangent space at p | Holds the directions in which p can move | The whole space |
| Riemannian gradient | The tangent direction of steepest increase of f | The gradient |
| Retraction | Turns a tangent vector at p into a point of M | p + v |
| Vector transport | Carries a tangent vector to the tangent space at another point | Not needed |

A retraction R at p is defined by what it does to first order: the curve R(t v) starts at p with velocity v. [Boumal (2023)](#ref-Bou2023b) develops these tools in turn, and vector transport is defined in Section 8.1 of [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a).

## What does the default problem compute?

The default minimises `dot(p, A * p)` over unit vectors, for a symmetric matrix `A`. The minimum value is the smallest eigenvalue of `A`, and the minimisers are the unit eigenvectors that go with it. [Boumal (2023)](#ref-Bou2023b) calls the same problem perhaps the simplest non-trivial instance of optimisation on a manifold, and uses it as a running example.

The answer can be had independently from `eigmin(A)`, which makes the default a good test of the machinery. **Solution Summary** and **Multiple Restarts** print that figure next to the result.

## How do the four algorithms differ?

| Algorithm | Uses | Keeps between iterations |
|---|---|---|
| **Gradient Descent** | Gradient and cost | Nothing beyond the current point |
| **Conjugate Gradient** | Gradient, cost, one transport | The previous direction |
| **Quasi-Newton** | Gradient, cost, transports | Recent pairs of steps and gradient changes |
| **Trust Regions** | Gradient, cost, Hessian-vector products | The radius |

Moving down the table, each iteration does more work and uses more information about curvature. The panel's own **Algorithm Guide** sets out these trade-offs, and the [Decision Guide](decision-guide.md) wiki applies them.

## How does a run get its gradient?

Only the cost has to be written. `ForwardDiff` differentiates f in the surrounding space, and `ManifoldDiff.riemannian_gradient` converts that into a Riemannian gradient at p.

On a Riemannian submanifold of a Euclidean space, the Riemannian gradient is the orthogonal projection of the Euclidean gradient of any smooth extension of f onto the tangent space, as [Boumal (2023)](#ref-Bou2023b) shows. A manifold with a metric of its own needs more than a projection, and the code calls the same function for it. The [Assumptions](assumptions.md) wiki covers what this asks of the expression in **Objective f(M, p)**.

## What do the action groups answer?

| Group | Question |
|---|---|
| Visualise | How did the cost, the gradient and the distance to the solution change? |
| Diagnose | Is the gradient right, and why did the run stop? |
| Predict | What is the answer, and do other starts or a tighter tolerance change it? |
| Compare | How do the solvers, limits and tolerances trade off? |
| Interpret | What does the solution mean, and how far did the run travel? |

The solvers come from `Manopt.jl`, described by [Bergmann (2022)](#ref-Ber2022a), and the manifolds from `Manifolds.jl`, described by [Axen, Baran, Bergmann and Rzecki (2023)](#ref-ABBR2023a).

## References

<a id="ref-AMS2008a"></a>Absil, P.-A., Mahony, R., & Sepulchre, R. (2008). *Optimization Algorithms on Matrix Manifolds*. Princeton University Press.

<a id="ref-ABBR2023a"></a>Axen, S. D., Baran, M., Bergmann, R., & Rzecki, K. (2023). Manifolds.jl: An Extensible Julia Framework for Data Analysis on Manifolds. *ACM Transactions on Mathematical Software* 49(4), 1-23. [doi:10.1145/3618296](https://doi.org/10.1145/3618296)

<a id="ref-Ber2022a"></a>Bergmann, R. (2022). Manopt.jl: Optimization on Manifolds in Julia. *Journal of Open Source Software* 7(70), 3866. [doi:10.21105/joss.03866](https://doi.org/10.21105/joss.03866)

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
