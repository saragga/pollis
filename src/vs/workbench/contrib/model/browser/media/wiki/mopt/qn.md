# Quasi-Newton

A quasi-Newton method builds up curvature information from the way the gradient changes along the path, and uses it to scale the next step. **Quasi-Newton** runs a limited-memory BFGS update on the manifold through `quasi_Newton`.

## What does the method learn from past steps?

A change in the gradient across a step says something about the curvature along that step. BFGS turns these pairs of step and gradient change into an approximation of the inverse Hessian, and the direction is that approximation applied to the negative gradient. [Nocedal and Wright (2006)](#ref-NW2006a) give the Euclidean method in full.

On a manifold, the pairs belong to different tangent spaces, one for each point visited. They have to be transported to the tangent space at the current point before they can be combined, and that is where vector transport enters.

| Ingredient | In a linear space | On a manifold |
|---|---|---|
| Step | Difference of points | Tangent vector at the previous point |
| Gradient change | Difference of gradients | Difference after transporting the old gradient |
| Stored pairs | Used as they are | Transported to the current tangent space |

## What does limited memory change?

Full BFGS stores a dense operator, while the limited-memory method of [Liu and Nocedal (1989)](#ref-LN1989a) keeps only the most recent pairs and rebuilds the direction from them. The solver's `memory_size` sets how many, and its default is the smaller of the manifold's dimension and 20.

Storage thus grows with the size of a point times `memory_size`, not with its square. More memory generally means a better picture of the curvature at a higher cost per iteration, and `solve(memory_size=50)` tries that directly.

## Which line search does it use?

`Manopt.jl`'s documentation names `WolfePowellLinesearch` as the solver's default. Besides a sufficient decrease of the cost, a Wolfe-type search asks for a condition on the slope at the new point, which helps to keep the curvature pairs useful.

Each trial needs a gradient as well as a cost, so a search can take more work than the Armijo rule of **Gradient Descent**. **Warm Start** begins a new solver call, so its run starts with an empty memory, and the stored pairs of the first run do not carry over.

## What does the theory say?

[Huang, Absil and Gallivan (2018)](#ref-HAG2018a) define a Riemannian BFGS method based on a cautious update and a weak line search condition. They prove global convergence to stationary points with no convexity assumption, and superlinear convergence to a nondegenerate minimiser. The weak condition removes the need for information from a differentiated retraction.

The solver's `cautious_update` keyword turns the cautious rule on, and `solve(cautious_update=true)` runs it. The rate on the problem in hand shows on **Iterate Path**, where a line that bends downwards marks fast convergence.

## What does a run look like?

**Gradient Norm** often steepens as the stored pairs accumulate. The norm need not decrease at every iteration, and the iterations to a given accuracy are usually fewer than on **Gradient Descent** or **Conjugate Gradient**.

Costs per iteration are higher, through the line search and the transports, so `seconds` in **Algorithm Comparison** is the fairer test, particularly on a manifold where the transport is costly. A very cheap gradient on a very large problem may favour the simpler methods.

## When is it the right choice?

Curvature from past gradients gives much of the benefit of a Hessian, at no cost beyond storing and transporting vectors.

| Situation | Reading |
|---|---|
| Smooth cost, moderate dimension | The usual first pick, as the panel's decision table says |
| No Hessian, but high accuracy wanted | Usually much better than plain gradient descent |
| Memory very tight | Lower `memory_size`, or use **Conjugate Gradient** |
| Run lingers near saddle points | **Trust Regions** can use negative curvature |

## References

<a id="ref-HAG2018a"></a>Huang, W., Absil, P.-A., & Gallivan, K. A. (2018). A Riemannian BFGS Method without Differentiated Retraction for Nonconvex Optimization Problems. *SIAM Journal on Optimization* 28(1), 470-495. [doi:10.1137/17M1127582](https://doi.org/10.1137/17M1127582)

<a id="ref-LN1989a"></a>Liu, D. C., & Nocedal, J. (1989). On the Limited Memory BFGS Method for Large Scale Optimization. *Mathematical Programming* 45(1-3), 503-528. [doi:10.1007/BF01589116](https://doi.org/10.1007/BF01589116)

<a id="ref-NW2006a"></a>Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gradient Descent](gd.md) · [Conjugate Gradient](cg.md) · [Trust Regions](tr.md)
