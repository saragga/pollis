# Multi-Objective Optimisation Performance Metrics: Generational Distance

The generational distance measures how far the points of a front lie from the true front, on average. Smaller is better, and a value of zero means every obtained point lies on the reference front.

## Definition

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) attribute the indicator to [Van Veldhuizen (1999)](#ref-Vel1999a) and describe it as the average distance between each element of a front A and its closest neighbour in a discrete representation R of the true front:

GD(A; R) = (1 / |A|) × ( sum over a in A of ( min over r in R of ‖a − r‖ )^p )^(1/p)

with the Euclidean norm. The review notes that p = 2 is the usual choice, and that a lower value is better for all indicators of this form.

## How the panel computes it

`gd(F)` calls `PerformanceIndicators.gd(F, ref)` of `Metaheuristics.jl`, whose exponent `p` defaults to 1. With p = 1 the formula becomes the mean, over the obtained points, of the distance from each point to the nearest reference point, the description in the panel's decision table.

**Front vs Reference** joins each obtained point to its nearest reference point with a red line, and the generational distance is the mean length of those lines. **Point Contributions** gives each point's distance and prints the five largest, which are the points farthest from the front.

## What does it reward?

The generational distance rewards convergence and nothing else. The review points out that it is very sensitive to the number of points an algorithm finds: a single point on the true front gives a generational distance of zero, so an algorithm can miss whole regions of the front without being penalised. It favours algorithms that return a few points close to the front over those that give a more widely spread representation.

**Generational Distance** therefore answers one question well, how close the points are to the front, and leaves coverage to the other metrics. Paired with **Spacing**, or read beside **Inverted Generational Distance**, it separates convergence from spread.

## During a run

The review notes that the generational distance between the fronts of two successive iterations can serve as a stopping criterion: a small change suggests convergence towards the front.

**Metric over Generations** plots the generational distance of each stored generation against the true front, on a logarithmic scale. A steady fall shows the population approaching the front; a plateau shows that it stopped approaching the front. The review lists the generational distance as not monotone with respect to dominance, so a rise from one generation to the next does not by itself mean the front got worse.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-Vel1999a"></a>Van Veldhuizen, D. A. (1999). *Multiobjective Evolutionary Algorithms: Classifications, Analyses, and New Innovations*. Air Force Institute of Technology.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
