# Assumptions

Evolution strategies ask little of the objective. They do assume a continuous box, enough budget for the dimension, and a landscape in which good points tend to lie near one another.

## What Black-Box Search Assumes

The objective only has to return a number. Discontinuities, kinks and many local minima are all allowed, except on **GCMAES**, which needs a gradient. Sampling does rely on some regularity: nearby points should have related values, at least on the scale of the search. A needle-in-a-haystack function gives ranks with no information, and nothing short of luck can solve it. [Eiben and Smith (2015)](#ref-ES2015a) describe the broad assumptions behind this kind of method.

## What Continuous Variables Assume

Candidates are real vectors, and so integer or categorical variables are not natively supported. Rounding inside the objective creates plateaus, on which ranks carry little information, and σ can shrink below a unit, after which the variable stops moving. Binary variables are better treated by a discrete method. All the variables should also have comparable effects at the start. **Lower Bounds** and **Upper Bounds** in very different scales make the search work harder, so rescale them if you can.

## What the Box Assumes

The solution should lie well inside the box, because bounds can affect how a method moves. Methods handle them differently, whether by repairing a point or by resampling, and that can bias a search near an edge. **Bounds Check** reports any contact. **Bounds Sensitivity** tests how much the box matters. An enlarged box should give a similar answer, and a shifted box tests whether a method is using the symmetry of the default function.

## What the Population Size Assumes

The code uses the standard rule λ = 4 + ⌊3 ln d⌋ on the tabs that set it. The rule is designed for smooth problems, and a multimodal function often needs far more. A small population converges quickly, and it does so often to a local minimum. **Budget** divided by λ gives the number of generations, so that a larger population at the same budget has fewer generations. The default 20000 evaluations with λ = 8 allow 2500 generations.

## What Noise Assumes

Ranking copes fairly well with small noise, as it does not trust exact values. Selection among noisy values does favour lucky draws, and the reported best value is then optimistic. A re-evaluation, as in **Evaluate at Minimum**, shows the size of that bias if the objective is really noisy. Under strong noise, consider averaging evaluations, or larger populations. All recorded points, and thus `trace`, rely on single evaluations.

## What the Comparison Assumes

**Compare Strategies** and **ES vs DE** treat each method at its default settings. A loss may reflect settings, not the method. Only a few seeds are used, and the differences can be within the noise. Default objectives also favour some designs: the Rastrigin minimum at the box centre flatters any method that begins there, and a separable function flatters coordinate-wise methods. Results from one test function do not extend to other functions.

## References

<a id="ref-ES2015a"></a>Eiben, A. E. and Smith, J. E. (2015). *Introduction to Evolutionary Computing*. Springer. [doi:10.1007/978-3-662-44874-8](https://doi.org/10.1007/978-3-662-44874-8)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
