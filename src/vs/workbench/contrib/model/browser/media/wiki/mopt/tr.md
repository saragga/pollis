# Trust Regions

A trust-region method fits a quadratic model of f in the tangent space and minimises that model within a ball around the current point, whose size follows how well the model has predicted the cost. **Trust Regions** runs it through `trust_regions`, which follows [Absil, Baker and Gallivan (2007)](#ref-ABG2007a).

## What is solved at each iteration?

At the current point p, the model of a tangent vector s is m(s) = f(p) + inner(grad f(p), s) + 0.5 inner(H s, s), where H is the Hessian or an approximation. The subproblem is to minimise m(s) subject to the norm of s being at most the radius.

| Stage | Operation |
|---|---|
| Inner solve | Approximately minimise m(s) in the tangent space at p |
| Trial point | Retract s at p |
| Test | Compare the actual drop in f with the drop the model predicted |
| Update | Accept or reject the trial, then change the radius |

Unlike a line search, the method settles the length and the direction together. The trust-region framework on manifolds is covered in Chapter 7 of [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a), and in Chapter 6 of [Boumal (2023)](#ref-Bou2023b).

## How is the subproblem solved?

The default inner solver is truncated conjugate gradient (tCG). It runs conjugate gradient on the model in the tangent space, and it needs H only through products with tangent vectors, never as a matrix.

The solve ends when the residual is small enough, when the iterates reach the boundary of the ball, or when it meets a direction of negative curvature, along which it moves out to the boundary. As [Boumal (2023)](#ref-Bou2023b) notes, tCG need not find the global minimum of the subproblem when H has negative eigenvalues. It also ends at once if the gradient is exactly zero. The solver's keyword `randomize`, `false` by default, starts the inner solve from a random tangent vector.

## How does the radius change?

The test compares the actual reduction with the reduction the model predicted, as a ratio r. In the form given by [Boumal (2023)](#ref-Bou2023b), the trial is accepted when r exceeds a threshold. The radius shrinks to a quarter when r is under 1/4, and doubles up to a maximum when r exceeds 3/4 and the step reached the boundary.

| Keyword in `Manopt.jl` | Default | Meaning |
|---|---|---|
| `max_trust_region_radius` | `sqrt(manifold_dimension(M))` | Largest radius allowed |
| `trust_region_radius` | The maximum divided by 8 | First radius |
| `acceptance_rate` | 0.1 | Threshold for r, documented as between 0 and 1/4 |

Near the solution the actual and predicted drops both become tiny, so the ratio is affected by rounding, and the solver has a `rho_regularization` keyword for that purpose.

## Where does the Hessian come from?

The panel's code supplies no Hessian, so the solver approximates each Hessian-vector product by finite differences of the gradient, as its documentation says. In the construction described by [Boumal (2023)](#ref-Bou2023b), each product costs one retraction, one gradient and one transport.

That explains the wording of the panel's description: a superlinear local rate with the approximation, and a quadratic rate only with an exact Hessian. `trust_regions` accepts a Hessian function, `Hess_f`, as an optional argument, and supplying one takes an edit to the call in the code.

## How fast is it, and where does it stop?

Once iterates are close to a critical point where the Hessian is positive definite, the method with tCG converges superlinearly, given subproblems solved with enough accuracy, as [Boumal (2023)](#ref-Bou2023b) sets out with results adapted from [Absil, Baker and Gallivan (2007)](#ref-ABG2007a). Standard references for the Euclidean method, such as [Conn, Gould and Toint (2000)](#ref-CGT2000a), cover the framework in more depth.

The model sees curvature, so the method has a way to use a direction of negative curvature near a saddle, which a first-order method lacks. This is why the panel's decision table names it when robustness near saddle points matters.

## What does a run look like?

`iterations` counts outer iterations and is usually the smallest of the four in **Algorithm Comparison**, while `seconds` includes all the inner products. **Gradient Norm** tends to show a slow start and then a sharp fall, and **Iterate Path** bends downwards close to the end.

Flat stretches of `costs` can occur when trials are rejected and the radius is shrinking. They are a part of how the method searches, and a long run of them points to a model that fits poorly.

## When is it the right choice?

Each iteration is the most expensive of the four, so the method earns its place when accuracy or curvature matters.

| Situation | Reading |
|---|---|
| High accuracy wanted | The fast local rate pays off |
| Saddles or indefinite Hessians are expected | Curvature is used directly |
| An exact Hessian is available | Full use of the method |
| Very cheap gradient and low accuracy | The first-order solvers may be quicker |

## References

<a id="ref-ABG2007a"></a>Absil, P.-A., Baker, C. G., & Gallivan, K. A. (2007). Trust-Region Methods on Riemannian Manifolds. *Foundations of Computational Mathematics* 7(3), 303-330. [doi:10.1007/s10208-005-0179-9](https://doi.org/10.1007/s10208-005-0179-9)

<a id="ref-AMS2008a"></a>Absil, P.-A., Mahony, R., & Sepulchre, R. (2008). *Optimization Algorithms on Matrix Manifolds*. Princeton University Press.

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

<a id="ref-CGT2000a"></a>Conn, A. R., Gould, N. I. M., & Toint, P. L. (2000). *Trust Region Methods*. SIAM. [doi:10.1137/1.9780898719857](https://doi.org/10.1137/1.9780898719857)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md)
