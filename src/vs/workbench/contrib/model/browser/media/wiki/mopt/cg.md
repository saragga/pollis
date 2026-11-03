# Conjugate Gradient

Riemannian conjugate gradient combines the new gradient with the previous search direction, at little more than the cost of gradient descent. **Conjugate Gradient** runs it through `conjugate_gradient_descent`.

## How does the search direction form?

Each new direction is the negative gradient at the current point plus a multiple b of the previous direction. In a linear space those two vectors live in the same space, while on a manifold the previous direction belongs to the tangent space at the previous point, so it must first be moved across.

A vector transport does the moving, and it is defined in Section 8.1 of [Absil, Mahony and Sepulchre (2008)](#ref-AMS2008a). [Sato (2022)](#ref-Sat2022a) sets out a general framework that covers methods using a vector transport or an inverse retraction, and it extends to methods that earlier studies did not reach.

| Step | Operation |
|---|---|
| Gradient | At the current point |
| Transport | Previous direction to the current tangent space |
| Coefficient | Compute b from the rule in use |
| Line search | Along the retraction of the new direction |

## Which rule sets the coefficient?

The solver takes its rule through the `coefficient` keyword, and `Manopt.jl`'s documentation lists several, of which these appear in the Euclidean literature cited there.

| Keyword value | Source |
|---|---|
| `ConjugateDescentCoefficient()`, the default | [Fletcher (2000)](#ref-Fle2000a) |
| `FletcherReevesCoefficient()` | [Fletcher and Reeves (1964)](#ref-FR1964a) |
| `PolakRibiereCoefficient()` | [Polak and Ribiere (1969)](#ref-PR1969a) |
| `SteepestDescentCoefficient()` | Sets b to zero, which gives gradient descent |

Passing one to `solve`, as in `solve(coefficient=PolakRibiereCoefficient())`, changes the rule for that run. To change it for every action that uses `solve`, add the keyword to the `conjugate_gradient_descent` call in the code. The last row offers a quick contrast with **Gradient Descent** inside one model.

## When does the method restart?

A direction built from the old one may stop pointing downhill. The solver's default `restart_condition`, `RestartOnNonDescent()`, deals with that case by restarting from the gradient when the new direction is no longer a descent direction.

Restarts are normal, and they forget what the direction had built up. A run that restarts at most iterations behaves much like **Gradient Descent**, at a slightly higher cost, which suggests a poor match between the rule and the problem, or a line search too coarse for the rule to do well.

## What does the theory cover?

[Sato (2022)](#ref-Sat2022a) analyses the global convergence of several specific algorithms within that framework, and gives the conditions under which a class of them converges. Results of this kind depend on the rule for the coefficient and on the line search, so a statement about one pairing does not transfer directly to another.

The panel's **Algorithm Guide** puts the rate as a faster linear one than that of gradient descent. The chart on which to check this for the problem in hand is **Iterate Path**.

## How does a run differ from Gradient Descent?

| Feature | **Gradient Descent** | **Conjugate Gradient** |
|---|---|---|
| Stored | Gradient | Gradient and previous direction |
| Extra work per iteration | None | One transport and one coefficient |
| Gradient norm per iteration | Tends to fall | May rise for a while |
| Reaction to poor conditioning | Slows sharply | Slows less |

A gradient norm that bounces is ordinary, as long as the trend is downward. A bounce with no trend suggests a line search too rough for the rule, which can be tested by changing `coefficient` or `stepsize`.

## When is it the right choice?

**Conjugate Gradient** suits problems too large for **Quasi-Newton** to store its pairs, when the gradient is affordable and the transport is cheap. Where memory is not a concern and the dimension is moderate, the panel's decision table prefers **Quasi-Newton**, with **Algorithm Comparison** as the test. For very rough accuracy, the simpler **Gradient Descent** may reach the goal in comparable time.

## References

<a id="ref-AMS2008a"></a>Absil, P.-A., Mahony, R., & Sepulchre, R. (2008). *Optimization Algorithms on Matrix Manifolds*. Princeton University Press.

<a id="ref-Fle2000a"></a>Fletcher, R. (2000). *Practical Methods of Optimization* (2nd ed.). Wiley. [doi:10.1002/9781118723203](https://doi.org/10.1002/9781118723203)

<a id="ref-FR1964a"></a>Fletcher, R., & Reeves, C. M. (1964). Function Minimization by Conjugate Gradients. *The Computer Journal* 7(2), 149-154. [doi:10.1093/comjnl/7.2.149](https://doi.org/10.1093/comjnl/7.2.149)

<a id="ref-PR1969a"></a>Polak, E., & Ribiere, G. (1969). Note sur la convergence de methodes de directions conjuguees. *Revue Francaise Informatique Recherche Operationnelle*.

<a id="ref-Sat2022a"></a>Sato, H. (2022). Riemannian Conjugate Gradient Methods: General Framework and Specific Algorithms with Convergence Analyses. *SIAM Journal on Optimization* 32(4), 2690-2717. [doi:10.1137/21M1464178](https://doi.org/10.1137/21M1464178)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Quasi-Newton](qn.md) · [Trust Regions](tr.md)
