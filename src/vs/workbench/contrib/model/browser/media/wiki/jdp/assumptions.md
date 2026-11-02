# Assumptions

Each jump-diffusion tab fixes a law for when jumps arrive and how large they are. The conditions concern those two laws, the continuous part between jumps, and the accuracy of the numerical solution.

## What the Jump Arrival Assumption Requires

**Compound Poisson** and **Gaussian Jumps** assume a Poisson process with a constant **Jump rate lambda**. Waiting times are then independent and exponential, and one jump does not make another more or less likely. Clusters of jumps, jumps tied to the level of X, and rates that change with the time of day all break the assumption. A real series that shows calm and turbulent periods will not be reproduced by a constant rate. **Custom Rate** relaxes this only to a rate proportional to abs(X), and a rate with a different form needs an edit to `rate`.

## What the Jump Size Assumption Requires

Jump sizes are drawn independently of each other, of the arrival times, of W and of the current state, and only the multiplier is applied to X. Each tab hard-codes its law, Uniform(-a, a), Normal(muJ, sigmaJ) or 1 + 0.1 Z. Heavier tails or an asymmetry need an edit to `affect!`. In **Compound Poisson** and **Gaussian Jumps**, changing the jump law also means updating `kappa` and `kappa2`, as **Ensemble Moments** uses them, and the overlay of **Jump Size Distribution** is coded separately.

## What the Equation Between Jumps Must Satisfy

Between jumps X follows an Itô diffusion, and all four entries of **SDE solver** apply the Itô form. The well-posedness conditions of a diffusion carry over: f and g should be Lipschitz with linear growth, and with faster growth paths may blow up. Theory for numerical schemes on nonlinear equations with jumps is treated by [Higham and Kloeden (2005)](#ref-HK2005a), and the Euler scheme for Lévy-driven equations by [Protter and Talay (1997)](#ref-PT1997a). Neither result is checked by the panel for the coefficients you type.

## When a Jump-Diffusion State Can Reach Zero

The factor exp(J) cannot change the sign of X, and with g = s X an exact solution stays positive. A constant **Diffusion g(X,t)**, as in `0.1`, allows X to cross zero, and multiplicative jumps then act on a negative state. **With vs Without Jumps** takes the logarithm of X(T) / X0, so it raises a `DomainError` as soon as one path ends under zero when X0 is positive. In **Custom Rate**, 1 + 0.1 Z is negative only when Z is under -10, which has negligible probability.

## What Solver Accuracy the Jump-Diffusion Panel Assumes

Constant-rate jump times are exact, because the solver is forced to stop on them. The law between those times carries the usual discretisation error, which depends on **SDE solver**, **Step size dt** and the default tolerances of 0.01. In **Custom Rate**, jump times are found by integrating the rate along the numerical path, so they carry a discretisation error of their own. Accuracy can be tested by repeating a run with a smaller step or tighter tolerances, and by comparing statistics against their Monte Carlo error.

## References

<a id="ref-HK2005a"></a>Higham, D. J. and Kloeden, P. E. (2005). Numerical methods for nonlinear stochastic differential equations with jumps. *Numerische Mathematik* 101(1), 101–119. [doi:10.1007/s00211-005-0611-8](https://doi.org/10.1007/s00211-005-0611-8)

<a id="ref-PT1997a"></a>Protter, P. and Talay, D. (1997). The Euler scheme for Lévy driven stochastic differential equations. *The Annals of Probability* 25(1), 393–423. [doi:10.1214/aop/1024404293](https://doi.org/10.1214/aop/1024404293)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
