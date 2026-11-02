# xNES

The exponential natural evolution strategy treats the search distribution as an object to improve by gradient steps. The gradient is taken of expected fitness with respect to the distribution's own parameters.

## What the Natural Gradient Does

Write the distribution as π(x | θ). The expected fitness J(θ) has a gradient that can be estimated from samples alone, with no gradient of f. A plain gradient depends on how θ is parameterised. The natural gradient corrects this with the Fisher information, and so it follows steepest ascent in terms of change in the distribution, whatever the coordinates. Natural evolution strategies are based on this idea. Evaluations enter only through a ranking-based utility, so that scale of f does not matter.

## How xNES Represents the Distribution

The strategy holds a centre μ, a scale σ and a shape B, with A = σ B and determinant of B equal to 1. [Glasmachers, Schaul, Yi, Wierstra and Schmidhuber (2010)](#ref-GSYWS2010a) update in local coordinates, using a matrix exponential:

- A next = A exp(½ η G)

The exponential keeps the covariance positive definite with no special handling, and a separate rate lets the scale move at its own speed. Reported default rates are η for shape and scale of (9 + 3 ln d) / (5 d^1.5), which is about 0.25 at d = 5.

## How It Compares with CMA-ES

The two share a population, ranks and full covariance, and they can look much alike. **Algorithm Info** gives the same invariances for both. xNES has one clean derivation, while CMA-ES adds two cumulation paths, which give it a memory across generations. Published comparisons vary by function, so neither is the better one in general. On a given problem, **Compare Strategies** at three seeds is only a first look, so that more seeds are worthwhile before concluding.

## What the Code Does

The tab calls `bboptimize` from `BlackBoxOptim.jl`, with `Method=:xnes`, the box as `SearchRange`, and **Budget** as the limit of evaluations. **Initial Step Size** does not apply here, and no starting point is passed, so that the package chooses both. `stop_reason` provides the status. `RngSeed` sets the seed, so that a run can be repeated and **Multi-Start Analysis** can vary it. No gradient is ever requested.

## Where xNES Struggles

Small populations and fast shape learning can reduce the search radius too early on a rugged function: the search then collapses into a local basin. On Rastrigin, read **Search Radius History**: a radius that drops within the first few percent of the budget means little exploration. dxNES addresses that weakness directly. As with any full-matrix method, memory and internal cost rise with d², which limits it to moderate dimensions.

## References

<a id="ref-GSYWS2010a"></a>Glasmachers, T., Schaul, T., Yi, S., Wierstra, D. and Schmidhuber, J. (2010). Exponential natural evolution strategies. In *GECCO*, 393–400. [doi:10.1145/1830483.1830557](https://doi.org/10.1145/1830483.1830557)

## See Also

- [Factsheet](factsheet.md) · [CMA-ES](cmaes.md) · [dxNES](dxnes.md) · [Diagnostics](diagnostics.md)
