# Assumptions

Differential evolution assumes little about the objective, and it promises little. The main assumptions concern the box, the budget and the role of the random seed.

## What the Objective Must Provide

The objective must return a real value for any point in the box. It need not be smooth or convex, or have a gradient. Each evaluation should be cheap, as a run uses many thousands. Stochastic objectives are risky, as greedy selection can keep a lucky value forever, and its measured value then overstates the point's quality. Averaging repeated evaluations helps, at a higher cost. Mixed or integer variables can be handled by rounding inside the objective, with care about the flat regions that result.

## What the Search Box Assumes

The optimum is assumed to lie inside **Lower Bounds** and **Upper Bounds**, and the box is taken to be a fair description of where to search. The first population spreads uniformly over it. A very large box wastes effort, and a small one may exclude the optimum. Bounds are enforced by `clamp`, which can pile points on a face, and an optimum on a bound can look easier to find than one inside. Use **Bounds Check** and **Bounds Sensitivity** to test that assumption.

## What Self-Scaling Assumes

Step sizes come from the differences in the current population. That assumes enough diversity is left to generate useful moves. Once the population has collapsed, differences are tiny, and no recovery is possible, even in a poor region. Sizes of variables should be comparable too, or the differences in one variable can dominate. Crossover with low CR also treats axes unequally, so that a low CR is not rotation invariant, as discussed by [Price, Storn and Lampinen (2005)](#ref-PSL2005a).

## What Benchmark Results Assume

The default Rastrigin function is separable and symmetric, with its optimum in the centre of the box. All those features can flatter a method. Published comparisons often shift and rotate test functions for that reason. A method that does well here may not do well on a rotated version. Changing **Objective f(x)** to a rotated or shifted form is a simple test. No method wins across all problems, as the review by [Das and Suganthan (2011)](#ref-DS2011a) makes clear from its range of strategies.

## What the Random Seed Assumes

A run gives one sample of a random process, under seed 1 by default. Results between seeds can differ, and a single run cannot show how much. Comparisons with fewer seeds, such as the three in **Population Size Study** or the five in **Compare with Library DE**, are illustrations. Real claims need many runs. Seeds also fix the path only for a given Julia version and package set, so that exact reproduction across versions is not assured.

## What the Constraint Handling Assumes

**epsilonDE** assumes constraints in the form g(x) ≤ 0, computable at any point. A sum of positive parts mixes units, so that scale matters. The schedule assumes that the search can reach feasibility once epsilon gets small, which fails if the feasible region is tiny. Equality constraints are not offered directly. **Evaluate at Minimum** also assumes an interior, unconstrained minimum, so that a large gradient norm on this tab is expected when a constraint is active.

## References

<a id="ref-DS2011a"></a>Das, S. and Suganthan, P. N. (2011). Differential evolution: a survey of the state-of-the-art. *IEEE Transactions on Evolutionary Computation* 15(1), 4–31. [doi:10.1109/TEVC.2010.2059031](https://doi.org/10.1109/TEVC.2010.2059031)

<a id="ref-PSL2005a"></a>Price, K. V., Storn, R. M. and Lampinen, J. A. (2005). *Differential Evolution: A Practical Approach to Global Optimization*. Springer. [doi:10.1007/3-540-31306-0](https://doi.org/10.1007/3-540-31306-0)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
