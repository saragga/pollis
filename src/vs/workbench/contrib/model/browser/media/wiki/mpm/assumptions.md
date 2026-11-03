# Multi-Objective Optimisation Performance Metrics: Assumptions

What the metrics take for granted about the fronts they measure, the reference they measure against, and the scale of the objectives.

## Every objective is minimised

`Metaheuristics.jl` assumes minimisation throughout, and its documentation notes that the indicators are developed for minimisation problems. A larger hypervolume, or a smaller distance, is better only on that understanding.

An objective that is maximised in the original problem enters as its negative. **Result**, **Reference Front** and **Second Result** must then all use the same signs, since every metric compares their values directly.

## A set of mutually non-dominated points

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) define the indicators on Pareto front approximations: sets in which no element is weakly dominated by another, and which therefore contain only distinct points. The package's hypervolume also expects a non-dominated front.

A result passed as a `Metaheuristics` state goes through `pareto_front`, which returns the non-dominated solutions of its population. A matrix is used as it stands, and **Front Statistics** shows whether it holds dominated points or duplicates.

## A reference front that represents the true one

**Generational Distance**, **Inverted Generational Distance** and **Epsilon-Indicator** measure the front against **Reference Front**, a discrete representation of the true front. Their values describe closeness to that representation.

The demonstration uses the known front of ZDT1. For a problem whose front is unknown, the non-dominated union of every front obtained in the study can serve, and the metrics then measure closeness to the best that has been found. A dense and well-spread **Reference Front** brings the values closest to those that the true front would give.

## Objectives on comparable scales

All five metrics combine the objectives into one number: through Euclidean or Manhattan distances, through a volume, or through the largest difference in any one objective. An objective measured in thousands then weighs more than one measured in fractions.

ZDT1 has both objectives on similar ranges, so the demonstration needs no rescaling. For a problem of one's own, **Front Statistics** prints `front_range` and `reference_range` for each objective. Fronts can be rescaled before they are passed in, for example by the range of the reference front in each objective, applied alike to all three inputs.

## A reference point beyond every front

The hypervolume is measured up to `refpoint`, which the panel places 10% of the range beyond the worst value of each objective over the two fronts and the reference front. [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) define the indicator with a reference vector weakly dominated by every point of the set, and the panel keeps only the points that strictly dominate it.

The hypervolume depends on this point. [Ishibuchi, Imada, Setoguchi and Nojima (2018)](#ref-IISN2018a) show that, for a problem with an inverted triangular Pareto front, the optimal distribution of solutions for hypervolume maximisation depends strongly on where the reference point lies, and they propose a method for specifying it.

## Two or more objectives

The metrics accept any number of objectives, and `objectives` gives the number found. The charts of **Front vs Reference** and **Point Contributions** draw the first two, so with three or more objectives they show a projection of the front.

The cost of computing the metrics grows with the number of objectives. [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) give the cost of the generational distances as proportional to the number of objectives times the sizes of both sets, while the best known bound for the exact hypervolume grows exponentially with the number of objectives.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-IISN2018a"></a>Ishibuchi, H., Imada, R., Setoguchi, Y., & Nojima, Y. (2018). How to Specify a Reference Point in Hypervolume Calculation for Fair Performance Comparison. *Evolutionary Computation* 26(3), 411-440. [doi:10.1162/evco_a_00226](https://doi.org/10.1162/evco_a_00226)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
