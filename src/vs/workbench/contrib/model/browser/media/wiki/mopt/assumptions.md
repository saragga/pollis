# Optimisation on Riemannian Manifolds: Assumptions

The four algorithms ask for a smooth cost on a smooth manifold, a start on that manifold and a gradient that can be computed. What they return is a point meeting local conditions, so the guarantee is weaker than it may look.

## Is the constraint really a smooth manifold?

The whole approach rests on the feasible set having a tangent space at every point. Unit vectors, orthonormal matrices, subspaces and positive definite matrices all qualify, and each comes as a ready-made type in `Manifolds.jl`.

Inequalities generally do not fit, because a set such as a box has corners and edges. Any further limit is built into the cost or the geometry. Note that `SymmetricPositiveDefinite(n)` is open: its points stay positive definite, though a minimiser can lie out at the edge of the set, as a sequence of iterates heading towards a singular matrix. [Boumal (2023)](#ref-Bou2023b) warns that optimising over an open set has its challenges.

## What must the cost expression allow?

`ForwardDiff` differentiates **Objective f(M, p)** at p with respect to every entry of the ambient array. The expression is therefore evaluated on arguments that are not exactly on the manifold, and on numbers that carry derivatives. Three things follow.

| Requirement | Consequence |
|---|---|
| Defined near the manifold, not only on it | An expression that fails just off the manifold breaks the gradient |
| Written in generic Julia | A routine that accepts only `Float64` fails under `ForwardDiff` |
| Smooth | Absolute values and maxima give kinks that gradient methods do not model |

The choice of extension off the manifold does not change the Riemannian gradient, which is why `dot(p, A * p)` may be used without dividing by `dot(p, p)`.

## Does the starting point lie on the manifold?

**Initial Point** must be a valid point of **Manifold**, in the array shape that manifold expects. The default `normalize(ones(n))` is a unit vector, which fits the sphere and nothing else on the list in the tooltip.

Changing **Manifold** therefore calls for changing **Initial Point** as well, and `rand(M)` gives a valid start on any of them. `is_point(M, p0)` tests a value before a run, and the printed `on_manifold` applies the same test to the final point.

## What does the answer guarantee?

A local minimiser must be a critical point, one where the Riemannian gradient vanishes, and a small `gradient_norm` is evidence of being close to such a point. It says nothing about minimum against saddle.

[Boumal (2023)](#ref-Bou2023b) sets out the further condition. A point with zero gradient and a positive semidefinite Hessian is second-order critical, and one with a positive definite Hessian is a strict local minimiser. The panel's runs do not test the Hessian, so **Multiple Restarts** is the practical check, with no promise of finding the global minimum on a general cost.
## What must hold for the convergence results?

The results quoted in the method wikis all come with conditions.

| Result | Condition | Source |
|---|---|---|
| Gradient norm tends to zero | Cost bounded from below, and a Lipschitz-type condition on f composed with the retraction | [Boumal (2023)](#ref-Bou2023b) |
| Local linear rate | Zero gradient and positive definite Hessian at the limit | [Boumal (2023)](#ref-Bou2023b) |
| Global and superlinear BFGS | Cautious update, weak line search, nondegenerate minimiser | [Huang, Absil and Gallivan (2018)](#ref-HAG2018a) |
| Superlinear trust regions | Positive definite Hessian at the limit, with subproblems solved accurately enough | [Boumal (2023)](#ref-Bou2023b) |

A cost whose minimisers are not isolated fails the positive definite conditions. `dot(p, A * p)` on `Stiefel(n, 2)` is such a case, since mixing the two columns by an orthogonal matrix leaves the cost unchanged. Such a problem may converge more slowly than the rates suggest, and `Grassmann(n, 2)` removes that freedom by working on the subspaces themselves.

## Which geometry is the run using?

Each solver picks a retraction through `default_retraction_method(M, typeof(p))`, and **Conjugate Gradient** and **Quasi-Newton** also pick a vector transport. Both can be passed to `solve` as keywords.

The metric is a further choice built into the manifold type. It sets how gradient norms and distances are measured, so **Gradient Tolerance** and **Geodesic Distance** are expressed in that metric, and two metrics on the same set give different figures for the same point. A stopping tolerance that suits one manifold or metric need not suit another.

## How far do the checks extend?

The default matrix `A` comes from a fixed seed, so repeated runs give the same problem. Any statement based on it describes one random matrix of size **Ambient Dimension (n)**, and another seed or size gives a different problem.

**Gradient Check** tests the gradient along five random directions at **Initial Point**. Setting **Initial Point** to another value and running it again extends the test to that point. As [Boumal (2023)](#ref-Bou2023b) notes, a failed check may trace to the cost, the gradient, the retraction or the inner product.

## References

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

<a id="ref-HAG2018a"></a>Huang, W., Absil, P.-A., & Gallivan, K. A. (2018). A Riemannian BFGS Method without Differentiated Retraction for Nonconvex Optimization Problems. *SIAM Journal on Optimization* 28(1), 470-495. [doi:10.1137/17M1127582](https://doi.org/10.1137/17M1127582)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
