# Multi-Objective Optimisation Performance Metrics: Spacing

The spacing metric measures how evenly the points of a front are spread, through the variation of the distance from each point to its nearest neighbour. Smaller is better, a value of zero means all those distances are equal, and it needs no reference front.

## Definition

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) attribute the indicator to [Schott (1995)](#ref-Sch1995a). For each point a_j of a front A, let d_j be its Manhattan distance, the sum of the absolute differences in each objective, to the nearest other point of A, and let d̄ be the mean of the d_j. Then

SP(A) = √( (1 / (|A| − 1)) × sum over j of ( d̄ − d_j )² )

the sample standard deviation of the nearest-neighbour distances.

## How the panel computes it

`spacing(F)` calls `PerformanceIndicators.spacing(F)` of `Metaheuristics.jl`, which the documentation describes as the Schott spacing indicator, with a value of zero meaning that the vectors of the front are uniformly distributed.

**Front vs Reference** joins each point to its nearest neighbour in the Manhattan distance with a red line. Lines of equal length mean a spacing near zero. **Point Contributions** gives each point's absolute deviation from the mean nearest-neighbour distance, computed with `nn_l1`, and prints the five largest: the points in the most crowded or the most isolated places.

## What does it reward?

The review lists spacing among distribution and spread indicators, and within that family, uniformity is the aspect it captures: how equally the points are spaced. It says nothing about how close the front is to the true one, nor about how far it extends.

The review also points out that spacing cannot account for holes in the front, since each point looks only at its closest neighbour. A front split into separate groups, each evenly spaced within itself, can have a low spacing, and the review notes that the information it gives is limited in that case.

## When is it useful?

**Spacing** answers the question that matters when a set of trade-offs is handed to a decision-maker: are the options evenly distributed, or are some regions crowded and others sparse? It needs no reference front, so it applies to any front, including fronts of real problems whose true front is unknown.

Read with **Generational Distance**, it separates the two aspects that **Inverted Generational Distance** and **Hypervolume** combine: how close the points are, and how evenly they are spread. The extent of the front, which spacing does not measure, shows in `front_range` from **Front Statistics**.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-Sch1995a"></a>Schott, J. R. (1995). *Fault Tolerant Design Using Single and Multicriteria Genetic Algorithm Optimization*. Air Force Institute of Technology.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md)
