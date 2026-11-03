# Multi-Objective Optimisation Performance Metrics: Hypervolume

The hypervolume measures the region of objective space that a front dominates, bounded by a reference point. Larger is better, and it rewards closeness to the true front and spread along it in one number.

## Definition

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) describe the hypervolume indicator, also called the S-metric, as the volume of the part of objective space dominated by the front A and bounded by a reference vector r that every point of A weakly dominates:

HV(A; r) = λ( union over a in A of the box [a, r] )

where λ is the Lebesgue measure in as many dimensions as there are objectives, and [a, r] is the box between a point and the reference vector. With two objectives the region is a staircase, and its area is the hypervolume.

The review's summary table lists the indicator under [Zitzler, Deb and Thiele (2000)](#ref-ZDT2000a), whose comparison of evolutionary algorithms on six test functions includes the ZDT1 problem of the demonstration.

## Why is it singled out?

The review states that the hypervolume and some closely related indicators are the only known unary indicators to be strictly monotonic: if one front is better than another in the sense of dominance, its hypervolume is larger, provided all their points lie strictly inside the region that dominates the reference point.

No other metric of the panel has that property. Within the region bounded by the reference point, a front that improves on another, by moving a point to one that dominates it or by adding a point that no other point dominates, gains hypervolume. **Hypervolume** is the panel's default metric, and the one suited to ranking fronts by a single number in agreement with dominance.

## The reference point

The value depends on the reference point, which the review names as a drawback of the indicator. [Ishibuchi, Imada, Setoguchi and Nojima (2018)](#ref-IISN2018a) note that a point slightly worse than the nadir point is usually used in the evolutionary multi-objective community, and propose a specification method for fair comparison.

The panel's `refpoint` takes the worst value of each objective over **Result**, **Second Result** and **Reference Front**, and adds 10% of the range. Points that do not strictly dominate it are left out before the volume is computed, and a front with no such point has a hypervolume of zero. With two objectives, the region that only an end point of the front dominates reaches the reference point, so moving the reference point changes the contributions of the end points most.

## How the panel computes it

`hypervolume(F)` keeps the rows of F that are strictly less than `refpoint` in every objective and passes them to `PerformanceIndicators.hypervolume` of `Metaheuristics.jl`, which computes the volume between the points and the reference point. The package documents the function for a non-dominated front whose points each weakly dominate the reference point.

**Front vs Reference** shades the dominated staircase in the first two objectives, with the reference point in red. The shaded area is the hypervolume when there are two objectives.

## Exclusive contributions

**Point Contributions** gives, for each point, the hypervolume lost when that point alone is removed: its exclusive contribution. The five largest are printed and the chart colours each point by its contribution.

| Contribution | Reading |
|---|---|
| Large | A point that covers a region no other point covers |
| Small | A point in a crowded part of the front |
| At the ends of the front | Depends strongly on the reference point |

The review notes that, with two objectives, the distribution of points which maximises the hypervolume depends on the slope of the front. A hypervolume-optimal front need not be evenly spaced, which **Spacing** shows.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-IISN2018a"></a>Ishibuchi, H., Imada, R., Setoguchi, Y., & Nojima, Y. (2018). How to Specify a Reference Point in Hypervolume Calculation for Fair Performance Comparison. *Evolutionary Computation* 26(3), 411-440. [doi:10.1162/evco_a_00226](https://doi.org/10.1162/evco_a_00226)

<a id="ref-ZDT2000a"></a>Zitzler, E., Deb, K., & Thiele, L. (2000). Comparison of Multiobjective Evolutionary Algorithms: Empirical Results. *Evolutionary Computation* 8(2), 173-195. [doi:10.1162/106365600568202](https://doi.org/10.1162/106365600568202)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
