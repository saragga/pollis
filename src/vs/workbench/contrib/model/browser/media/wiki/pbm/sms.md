# Pareto-Based Multi-Objective Optimisation: SMS-EMOA

**SMS-EMOA**, the S-metric selection evolutionary multi-objective algorithm of [Beume, Naujoks and Emmerich (2007)](#ref-BNE2007a), selects by dominated hypervolume: at each step it discards the solution that contributes least to the hypervolume of the population.

## An indicator-based algorithm

[Emmerich and Deutz (2025)](#ref-ED2025a) present SMS-EMOA as the classical example of indicator-based multi-objective optimisation, in which a performance indicator, a scalar measure of the quality of a Pareto front approximation, guides selection. SMS-EMOA uses the hypervolume indicator, and they note that theoretical analysis attests favourable properties to it: maximising it yields approximations with points on the Pareto front, well distributed across it.

The title of [Beume, Naujoks and Emmerich (2007)](#ref-BNE2007a), multiobjective selection based on dominated hypervolume, names the principle.

## The hypervolume

For an approximation set A in m objectives and a reference point r, [Emmerich and Deutz (2025)](#ref-ED2025a) define the hypervolume indicator as the Lebesgue measure of the region dominated by A and bounded by r:

HI(A) = Vol({y : y ⪯ r and a ⪯ y for some a ∈ A})

The measure is a length for m = 1, an area for m = 2 and a volume for m = 3. The closer the points move to the Pareto front, and the more they spread along it, the more space they dominate. Since the dominated space is infinite, the reference point bounds it.

## A steady-state loop

Each iteration of SMS-EMOA, as [Emmerich and Deutz (2025)](#ref-ED2025a) describe it, creates a single offspring by recombination and mutation. The offspring joins the population, which then has N + 1 members, and a subset of size N with maximal hypervolume is kept.

With the reference point unchanged, the hypervolume of the population can then only grow or stay equal as the iterations go on. When all solutions are non-dominated, keeping the subset of maximal hypervolume amounts to deleting the point with the smallest exclusive contribution,

ΔHI(y, Y) = HI(Y) − HI(Y \ {y})

## Dominated solutions

When the population contains dominated solutions, the standard implementation partitions it into layers of equal dominance rank, as in NSGA-II, and discards the solution with the smallest hypervolume contribution on the worst-ranked layer, as [Emmerich and Deutz (2025)](#ref-ED2025a) explain.

They add that SMS-EMOA typically converges to regularly spaced approximations of the Pareto front, with a density that depends on the local curvature of the front; for two objectives, the density is highest where the slope of the front is −45°.

## Computational cost

[Emmerich and Deutz (2025)](#ref-ED2025a) report that all hypervolume contributions of a population can be computed in time Θ(N log N) for two and three objectives, and cite faster incremental methods for more. In Metaheuristics.jl, `SMS_EMOA` has a parameter `n_samples`, 10 000 by default, the number of samples used to approximate the hypervolume in many-objective problems, with more than two objectives.

The panel's decision table suggests **SMS-EMOA** for two or three objectives, when the quality of the front is judged by its hypervolume.

## In the panel

The main code calls `SMS_EMOA(N = N, options = ...)` with **Population** as N and the documented defaults of Metaheuristics.jl for crossover and mutation. The Metaheuristics.jl guide lists `SMS_EMOA` among its choices for two or three objectives.

The panel computes the hypervolume of every front with `PerformanceIndicators.hypervolume`, at a reference point 10% beyond the nadir of the front, so the selection criterion of SMS-EMOA and the measure used to compare the four algorithms are the same indicator, though the reference points may differ.

## References

<a id="ref-BNE2007a"></a>Beume, N., Naujoks, B., & Emmerich, M. (2007). SMS-EMOA: Multiobjective Selection Based on Dominated Hypervolume. *European Journal of Operational Research* 181(3), 1653-1669. [doi:10.1016/j.ejor.2006.08.008](https://doi.org/10.1016/j.ejor.2006.08.008)

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md)
