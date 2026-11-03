# Optimisation on Riemannian Manifolds: Decision Guide

The first choice is the manifold, which follows from what the unknown is. The algorithm comes next, set by the size of the problem, the accuracy wanted and what a gradient costs.

## Which manifold fits the unknown?

| The unknown is | Manifold | Note |
|---|---|---|
| A direction, with length fixed at one | `Sphere(n - 1)` | Fits a cost unchanged by scaling |
| k orthonormal vectors, in order | `Stiefel(n, k)` | The basis itself matters |
| A k-dimensional subspace | `Grassmann(n, k)` | The cost depends only on the span |
| A covariance or other positive definite matrix | `SymmetricPositiveDefinite(n)` | Stays positive definite without constraints |

Take the smallest manifold that holds the answer. If the cost cannot tell two bases of one subspace apart, `Grassmann(n, k)` drops a freedom that would otherwise leave a flat direction at every minimiser. [Boumal (2023)](#ref-Bou2023b) treats the principal component problem on both, and covers many other manifolds besides.

## Which algorithm should come first?

| Situation | Start with | Alternative |
|---|---|---|
| Moderate dimension, smooth cost | **Quasi-Newton** | **Trust Regions** |
| Very large, memory is tight | **Conjugate Gradient** | **Gradient Descent** |
| High accuracy wanted | **Trust Regions** | **Quasi-Newton** |
| Run seems to linger near saddles | **Trust Regions** | Restarts on any solver |
| A new cost, to test the set-up | **Gradient Descent** | Then one of the others |
| An exact Hessian is available | **Trust Regions** with it | **Quasi-Newton** |

**Gradient Descent** is the baseline, with the fewest settings and the plainest behaviour. Starting there separates a problem with the set-up from a problem with a solver, and the other three can then be judged against it.

## How does problem size change the choice?

What each solver stores decides how far it scales.

| Solver | Stored besides the point | Grows with |
|---|---|---|
| **Gradient Descent** | The gradient | Size of the point |
| **Conjugate Gradient** | Gradient and previous direction | Size of the point |
| **Quasi-Newton** | `memory_size` pairs of tangent vectors | Size of the point × `memory_size` |
| **Trust Regions** | Vectors of the inner solve | Size of the point, with a cost per Hessian-vector product |

`memory_size` defaults to the smaller of the manifold's dimension and 20, so it stays bounded as the problem grows. A costly cost or gradient favours the solvers that make fewer calls per unit of progress, and that can only be read from `seconds` in **Algorithm Comparison**.

## When is a Euclidean panel the better place?

A manifold is worthwhile when the feasible set is exactly a manifold and its geometry is inexpensive. Otherwise another panel may fit better.

| Situation | Better place |
|---|---|
| No constraint on the variables | **Quasi-Newton Methods** |
| General equalities and inequalities | **Constrained Optimisation** |
| Gradients unavailable or unreliable | **Model-Based Methods** |
| A linear cost on a positive semidefinite matrix, with linear constraints | **Semidefinite Programming** |

[Boumal (2023)](#ref-Bou2023b) includes smooth semidefinite programs among its opening examples, so a problem of that kind can go either way. Trying both is sensible at small sizes, as the panels answer the same question by different routes.

## How should the inputs be set?

**Gradient Tolerance** sets how accurate the point is, and the default 1e-8 is tight. A cost that is itself only known roughly cannot support such a figure, and **Tolerance Sensitivity** shows what a looser one saves.

**Max Iterations** defaults to 200, which suits the small default problem. Larger or harder problems, or **Gradient Descent** on an ill-conditioned one, need more, and **Iteration Budget** shows how fast the cost is improving at the limit. The trust-region solver usually needs fewer outer iterations than the first-order ones, each one costing more.

**Ambient Dimension (n)** sizes `A` and the default manifold's embedding. A cost that does not use `A` leaves it as an unused definition, and then **Manifold**, **Objective f(M, p)** and **Initial Point** are the entries that have to agree.

## A sensible order of work

1. Choose **Manifold**, set **Initial Point** to a valid value, and write **Objective f(M, p)**.
2. Run **Gradient Check** before trusting anything else.
3. Solve with **Gradient Descent**, and read **Gradient Norm** and **Stopping Criterion**.
4. Try **Quasi-Newton** or **Trust Regions**, and compare in **Algorithm Comparison**.
5. Test the answer with **Multiple Restarts** and **Warm Start**.
6. Set the working tolerance from **Tolerance Sensitivity**.

Reordering steps 2 and 3 can waste a long run, since a mistake in the cost can look like slow convergence, and no comparison of solvers can reveal it.

## References

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
