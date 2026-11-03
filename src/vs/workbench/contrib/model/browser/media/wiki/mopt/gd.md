# Gradient Descent

Riemannian gradient descent moves against the gradient in the tangent space, then returns to the manifold by a retraction. **Gradient Descent** runs it through `gradient_descent` with an Armijo line search, and it serves as the panel's baseline.

## How does one iteration work?

From the current point p the method computes the Riemannian gradient, chooses a step size a, and sets the next point to the retraction of −a grad f(p) at p. The search direction lies in the tangent space at p, and the retraction carries the step back on to the manifold.

| Stage | Operation | Cost |
|---|---|---|
| Direction | Riemannian gradient at p | One gradient |
| Step size | Line search along the retraction curve | A few costs and retractions |
| Move | Retraction at p | Already done by the last trial |

The history of the method on manifolds is traced in Chapter 4 of [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a).

## How is the step size chosen?

A backtracking line search starts from a trial step and shrinks it by a fixed factor until the cost falls by enough, in proportion to the step and to the squared gradient norm. Such a rule needs only comparisons of the cost, so it asks for no knowledge of the curvature.

The panel's code calls `gradient_descent` without naming a step rule, and the comment in the code records that the solver's default is an Armijo line search. The rule can be changed by passing `stepsize` as a keyword to `solve`. A long line search at each iteration means that the step starts too large, which often happens where the cost changes steeply.

## What does the theory promise from any start?

With a retraction and a backtracking line search, under a Lipschitz-type condition on f composed with the retraction and a cost bounded from below, [Boumal (2023)](#ref-Bou2023b) shows that the gradient norm tends to zero. Within the first K iterations, the smallest gradient norm is at most a constant divided by the square root of K.

That is a guarantee about the size of the gradient, in the worst case. It does not say that the iterates settle on a single point, since a sequence could in principle have more than one accumulation point. It also does not rule out arrival at a saddle.

## How fast is it near a minimiser?

Close to a point with zero gradient and positive definite Hessian, convergence is at least linear. [Boumal (2023)](#ref-Bou2023b) gives this for a constant step of 1 / L: with L equal to the largest Hessian eigenvalue, the linear factor is at most 1 − 1 / k, where k is the condition number of the Hessian at the minimiser.

That bound worsens as the condition number grows, so a Hessian whose eigenvalues differ widely allows slow progress. The same source adds that the gradient norm and the cost also converge at least linearly, which is why **Gradient Norm** and **Iterate Path** both tend to a straight line near the end of a run.

## What does a run look like?

**Gradient Norm** shows a roughly straight fall on its log scale once the run is close, and the slope is the linear rate. **Convergence Trace** drops quickly at first and then flattens.

Iterations are cheap, so `iterations` is usually the largest of the four in **Algorithm Comparison**, though `seconds` may not be. A run ending on the limit with a slowly falling gradient calls for another algorithm, and more iterations are seldom the better remedy.

## When is it the right choice?

Its strengths are simplicity and low memory, and its weakness is the slow final approach to a minimiser.

| Situation | Reading |
|---|---|
| Testing a new cost and manifold | The plainest behaviour, so faults are easier to see |
| Very large problem, cheap gradient | No memory beyond the gradient |
| Low accuracy is enough | Early progress is often good |
| Ill-conditioned Hessian, high accuracy | Better to change to **Quasi-Newton** or **Trust Regions** |

## References

<a id="ref-AMS2008a"></a>Absil, P.-A., Mahony, R., & Sepulchre, R. (2008). *Optimization Algorithms on Matrix Manifolds*. Princeton University Press.

<a id="ref-Bou2023b"></a>Boumal, N. (2023). *An Introduction to Optimization on Smooth Manifolds*. Cambridge University Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Conjugate Gradient](cg.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
