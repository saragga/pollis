# Interpretation

## Solution Summary
The **Solution Summary** gives the minimiser, the minimum, the value at the start, the improvement, the iterations and the convergence flag. A converged Newton solution is usually accurate to near machine precision in x, provided the Hessian at the minimum is well conditioned.

## Local Curvature
**Local Curvature** decomposes the Hessian at the solution into its principal axes: each eigenvector is a direction, its eigenvalue the curvature along it. The **relative width** is how much wider the minimum is along that direction than along the steepest one, the square root of the ratio of curvatures. A wide direction is **poorly determined**: f changes little along it, so small changes in the data or the objective move the minimiser a lot along it. In maximum likelihood, the inverse Hessian of the negative log-likelihood is the asymptotic covariance of the estimates, and its widest axes are the least precise combinations of parameters.

## Quadratic Model
The **Quadratic Model** plots f along the flattest Hessian direction against the second-order Taylor model f* + t^2 lambda / 2. Where the two curves agree, the Newton step is reliable; where they part, the region in which Newton converges quadratically ends, and the trust region would shrink.

## Compare Methods
**Compare Methods** runs the four methods and BFGS, a quasi-Newton method that builds a Hessian approximation from gradients, from the same start, reporting the minimum, iterations, function calls and seconds. Newton usually needs the fewest iterations; BFGS more iterations but cheaper ones, and for moderate n it is often faster in seconds.

## Start Robustness
**Start Robustness** runs Newton and the trust region from 20 random starts around x0 and reports the success rate, a converged run with a gradient norm below 1e-6, and the median iterations. A higher success rate for the trust region is the measured value of its safeguard.

## Evaluate at New Point
**Evaluate at New Point** gives the increase in f at another point and its distance from the minimiser.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
