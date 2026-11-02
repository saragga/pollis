# Unconstrained Optimisation

Gradient-based optimisers work most simply when each parameter can take any real value. Reparameterising turns a constrained problem into an unconstrained one, at a small cost in interpretation.

## Why the Panel Works on Unconstrained Parameters

A standard deviation must be positive, but a line search may step below zero, where a density is undefined and the run fails. Writing sigma = exp(p) makes every real p valid, so the optimiser needs no bounds and no special handling. `nll` applies the transform at its first line, and the code back-transforms the answer into `d_hat` or `sigma_hat`. `pnames` carries names such as `log_sigma`, as a reminder of which scale a figure is on.

## What Maps Are Used for Constrained Parameters

| Constraint | Map | Example |
|---|---|---|
| Positive | exp(p) | sigma, alpha, theta, as in the panel |
| Between 0 and 1 | 1 / (1 + exp(−p)) | A probability, as with `sigmoid` |
| Between a and b | a + (b − a) / (1 + exp(−p)) | A bounded rate |
| Ordered pair | p1, then p1 + exp(p2) | Two ordered thresholds |

Maximum likelihood is invariant to such a change. A smooth one-to-one map moves the optimum without altering the fitted distribution. Only the path of the optimiser, and the shape of the surface it sees, change. A Bayesian sampler is different, as it needs the log of the map's derivative added to the density.

## How L-BFGS Uses the Gradient

`LBFGS()` from `Optim.jl`, the package of [Mogensen and Riseth (2018)](#ref-MR2018a), takes a step along a direction built from the gradient and a few recent gradient changes, which stand in for curvature. It then uses a line search to pick the step length. A full Hessian is not formed or stored, so memory stays small, and a gradient is all it requires. [Liu and Nocedal (1989)](#ref-LN1989a) studied the method for large problems. Smooth, moderately sized likelihoods are its natural use, which suits the panel's three tabs.

## How to Check That L-BFGS Finished

**Convergence** reports whether the run converged, the iterations and gradient calls, the largest absolute gradient entry as `gradient_norm`, and the minimum. A converged flag with a small gradient is the expected outcome. A large gradient means that the run stopped early, or that it was halted by a limit. Note that `converged` is about stopping rules and not about reaching the global optimum, so a second start remains useful. Many iterations can reflect poor scaling, and rescaling covariates in the regression tabs usually helps.

## How to Judge Identification from the Likelihood Surface

**Likelihood Slices** plots the negative log-likelihood along each parameter over a window of ±1, with others held at the optimum. A clear curved valley suggests a well-identified parameter, and a flat line suggests a poor one. Slices can miss a ridge running across two parameters, so correlated parameters may look fine one at a time. On the log scale, ±1 is a factor of about 2.7, and a parameter on a very different scale may need another window.

## How to Get Standard Errors from the Optimum

**Estimates With Standard Errors** uses the inverse Hessian of the negative log-likelihood at the optimum, a measure of curvature treated in general by [Nocedal and Wright (2006)](#ref-NW2006a). Standard errors apply on the optimiser's scale. Log-scale parameters show no z, because z = 0 would test a scale of 1, which is rarely of interest. Those errors assume a correct model and a sample large enough for a quadratic valley. A Hessian that is singular or nearly so signals weak identification, which gives very large or undefined values.

## References

<a id="ref-LN1989a"></a>Liu, D. C. and Nocedal, J. (1989). On the limited memory BFGS method for large scale optimization. *Mathematical Programming* 45(1–3), 503–528. [doi:10.1007/BF01589116](https://doi.org/10.1007/BF01589116)

<a id="ref-MR2018a"></a>Mogensen, P. K. and Riseth, A. N. (2018). Optim: a mathematical optimization package for Julia. *Journal of Open Source Software* 3(24), 615. [doi:10.21105/joss.00615](https://doi.org/10.21105/joss.00615)

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*, 2nd ed. Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

## See Also

- [Factsheet](factsheet.md) · [Distribution Estimation](distribution-estimation.md) · [Automatic Differentiation](autodiff.md) · [Enzyme Backend](enzyme.md)
