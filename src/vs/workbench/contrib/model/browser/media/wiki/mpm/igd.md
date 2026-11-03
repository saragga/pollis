# Multi-Objective Optimisation Performance Metrics: Inverted Generational Distance

The inverted generational distance turns the generational distance round: it measures how far each point of the true front lies from the obtained front. Smaller is better, and it penalises gaps in the front as well as distance from it.

## Definition

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) attribute the indicator to [Coello Coello and Cruz Cortés (2005)](#ref-CC2005a) and describe it as the average minimal distance from an element of a discrete representation R of the true front to the closest point of the front A:

IGD(A; R) = (1 / |R|) × ( sum over r in R of ( min over a in A of ‖a − r‖ )^p )^(1/p)

with the Euclidean norm, and p = 2 as the usual choice. The formula has the form of the generational distance with the roles of the two sets exchanged.

## How the panel computes it

`igd(F)` calls `PerformanceIndicators.igd(F, ref)` of `Metaheuristics.jl`, whose exponent `p` defaults to 1. With p = 1 it is the mean, over the reference points, of the distance from each reference point to the nearest obtained point.

**Front vs Reference** joins every fourth reference point to its nearest obtained point with a red line. **Point Contributions** plots the reference points, not the obtained ones, coloured by their distance to the front, and prints the five largest.

## Why does it penalise gaps?

Every reference point counts once, whatever the obtained front looks like. A region of the true front with no obtained point nearby leaves its reference points far from everything, and their distances raise the average.

A front that clusters its points in one region scores well on **Generational Distance**, since each of its points is close to the front, but poorly on **Inverted Generational Distance**, since the rest of the front is uncovered. The panel's decision table calls it the usual benchmark metric when a reference front is known, for this reason: one number reflects both convergence and coverage.

The review places it among the indicators that capture both convergence and distribution.

## What are its limits?

The review states that the pros and cons of the inverted generational distance are the same as those of the generational distance, and that both are not monotone with respect to dominance. A front that dominates another can, in particular cases, have a larger inverted generational distance.

The value also depends on the reference front: its density sets the resolution at which gaps are seen, and its extent sets which regions count. The review describes IGD+, a modified version that integrates the dominance relation and is weakly Pareto compliant. The package provides it as `igd_plus`.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-CC2005a"></a>Coello Coello, C. A., & Cruz Cortés, N. (2005). Solving Multiobjective Optimization Problems Using an Artificial Immune System. *Genetic Programming and Evolvable Machines* 6(2), 163-190. [doi:10.1007/s10710-005-6164-x](https://doi.org/10.1007/s10710-005-6164-x)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
