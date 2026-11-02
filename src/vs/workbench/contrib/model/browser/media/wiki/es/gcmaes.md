# GCMAES

GCMAES is CMA-ES with help from a gradient. The sampled population gets an extra gradient step, which can speed up progress a lot where the objective is smooth.

## Why Add a Gradient

A pure evolution strategy has to learn its direction from samples, which costs many evaluations, and more as the dimension rises. Automatic differentiation can give a gradient cheaply, above all in reverse mode. Mixing the two aims to bring the speed of descent on smooth parts, and the adaptation of [Hansen and Ostermeier (2001)](#ref-HO2001a) on rough parts. The panel's table recommends the tab for high-dimensional problems with a cheap gradient, which is where sampling alone falls behind the most.

## How the Code Calls It

`GCMAES.minimize` takes a pair of functions: the recorded objective and the gradient.

- `grad(x) = ForwardDiff.gradient(f, x)`
- `GCMAES.minimize((fc, grad), x0, sigma, lb, ub; maxiter)`

The start is a random point in the box, the first step size comes from **Initial Step Size**, and `maxiter` is **Budget** over the population size. As `grad` calls `f` rather than `fc`, gradient calls are not in the record, and so `evaluations` understates the work done compared with the other tabs.

## What Objective the Gradient Needs

`ForwardDiff` needs an objective written in generic Julia that accepts dual numbers, so it fails on code with fixed Float64 types and calls to external programs. It needs a useful derivative too. Kinks and flat steps give gradients that say little. Forward mode costs grow with d, so that many variables make it slower, and a reverse-mode tool could then take its place in the code. A black-box objective with no derivative belongs on another tab.

## What a Gradient Does on Rastrigin

The gradient of a coordinate term is 2x + 20π sin(2π x). The second term is much larger than the first, and so the gradient points to the nearest ripple's minimum, and not towards the origin. A gradient step therefore sharpens local convergence without helping to find the right basin. Rastrigin is a poor showcase for this tab. A smooth problem with a large number of variables, such as a Rosenbrock function, shows the method's real strength.

## Where GCMAES Is Strong and Weak

The method fits smooth objectives, in dozens or hundreds of variables, in which precise convergence matters. It is weak on rugged or discontinuous objectives, in which the gradient misleads, and on problems without differentiable code. Its comparison in **Compare Strategies** is absent, as that action leaves out this tab. To include it, add a line calling `GCMAES.minimize`, and keep the different evaluation count in mind when reading the result. A pure gradient method with restarts is another natural baseline.

## References

<a id="ref-HO2001a"></a>Hansen, N. and Ostermeier, A. (2001). Completely derandomized self-adaptation in evolution strategies. *Evolutionary Computation* 9(2), 159–195. [doi:10.1162/106365601750190398](https://doi.org/10.1162/106365601750190398)

## See Also

- [Factsheet](factsheet.md) · [CMA-ES](cmaes.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
