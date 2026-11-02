# Assumptions

The methods ask for only a few things: a box, a function that does not vary too wildly, and a small number of variables. Their guarantees depend on those assumptions and they hold only in the limit.

## What the Lipschitz Assumption Says

A Lipschitz objective cannot change faster than some constant times the distance. Its value at a point then says something about the neighbourhood, and this justifies sampling sparsely. A function with a very steep and narrow basin has a very large constant, and it can hide from a coarse search. No method can find such a spike at a given budget without luck. [Jones, Perttunen and Stuckman (1993)](#ref-JPS1993a) remove the need to know the constant, but they do not remove the underlying assumption of regularity.

## What Determinism Does and Does Not Give

Determinism means that the same inputs repeat the same run. **Box Perturbation Study** exists because of it: restarts add nothing. It does not mean accuracy, and it does not mean that the method always finds the right answer. A repeatable result can be a repeatable mistake. Small changes to the box alter the sample positions, and they can change the outcome. Treat variation under such changes as the analogue of variation across random seeds in a stochastic method.

## What the Box Assumes

The minimum is assumed to lie inside **Lower Bounds** and **Upper Bounds**, and the samples depend on the box. Wider boxes spend more evaluations on empty regions. All tabs need finite bounds on all variables. Variables on very different scales are rescaled to the unit cube by DIRECT, so that sizes are measured relative to the box. A minimum on the edge may mean that the true minimum lies outside, so use **Boundary Check**.

## What Low Dimension Assumes

Cost grows quickly with dimension: at a fixed resolution per axis, the number of boxes grows exponentially. The panel's table gives about 10 variables for DIRECT and 5 for AGS as rough limits. Many problems are only partly sensitive to many variables, and then a method may seem to work at higher dimension without covering the space. **Bounds Analysis** reports coverage per coordinate, which says little about joint coverage. A low share in a coordinate is a warning.

## What Noise-Free Evaluation Assumes

All the methods treat each value as exact, and they never re-evaluate a point. A noisy objective can hold a lucky low value forever, and it can direct a search to it. Quadratic models can also be thrown off by small noise. If noise exists, average the evaluations, and use a method designed for it. Function values must also be defined across the box, so an objective that returns `Inf` or fails on part of the box needs attention before any run.

## What the Default Problem Flatters

The six-hump camel is a low-dimensional, smooth polynomial, with broad basins and a symmetric shape. All the tabs should do well on it. A method's success here says little about its success on harder problems. Symmetry makes its two global minima equally valid, so a method that finds either one is correct. Test on a function with narrow basins, or in more variables, using **Budget Study**, before forming a view on how a method behaves in general.

## References

<a id="ref-JPS1993a"></a>Jones, D. R., Perttunen, C. D. and Stuckman, B. E. (1993). Lipschitzian optimization without the Lipschitz constant. *Journal of Optimization Theory and Applications* 79(1), 157–181. [doi:10.1007/BF00941892](https://doi.org/10.1007/BF00941892)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
