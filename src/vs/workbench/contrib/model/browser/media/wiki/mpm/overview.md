# Multi-Objective Optimisation Performance Metrics: Overview

A multi-objective optimiser returns a set of trade-offs, not a single answer, and judging it means judging a whole set. The panel measures such a set with five metrics, each capturing a different aspect of its quality, and compares two sets with them.

## What is being assessed?

When several objectives conflict, no single point is best in all of them. A point dominates another when it is at least as good in every objective and better in one, and the points that no feasible point dominates form the Pareto front.

An evolutionary algorithm returns a finite set of mutually non-dominated points, which [Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) call an approximation set. Assessing it means asking how close it lies to the true front and how well it covers it. [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) state the difficulty plainly: evaluating the quality of a Pareto front approximation involves several factors, such as closeness to the front and coverage of the objective space.

## Convergence, spread and both

[Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) group performance indicators into four families, three of which the panel uses.

| Family | Question | Panel's metrics |
|---|---|---|
| Convergence | How close is the set to the front? | **Generational Distance**, **Epsilon-Indicator** |
| Distribution and spread | How evenly and widely is it spread? | **Spacing** |
| Convergence and distribution | Both at once | **Hypervolume**, **Inverted Generational Distance** |

The fourth family, cardinality, counts the non-dominated points, which the panel reports as `front_size`. The review places the epsilon-indicator among convergence indicators.

## Unary and binary indicators

A unary indicator assigns one number to one set, and a binary indicator assigns a number to a pair of sets. The five metrics of the panel are unary, although four of them use a reference front, and **Coverage** is binary.

[Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) analyse what such numbers can and cannot say about which set is better. A comparison based on an indicator should agree with Pareto dominance: when one set is better than another in the sense of dominance, the indicator should not say the opposite. The review by [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) states that the hypervolume and some closely related indicators are the only known unary indicators that are strictly monotonic with respect to dominance.

## The demonstration problem

ZDT1 is one of six test functions of [Zitzler, Deb and Thiele (2000)](#ref-ZDT2000a), each built around a feature known to make convergence to the Pareto-optimal front difficult. ZDT1 has two objectives, and `Metaheuristics.jl` supplies its true front, so every metric that needs a reference front can be computed against it.

The panel compares two algorithms on it. NSGA-II, by [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a), uses fast non-dominated sorting and a selection that combines parents and offspring. SPEA2, by [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a), is a successor to the SPEA of [Zitzler and Thiele (1999)](#ref-ZT1999a), which stores non-dominated solutions externally in a second, continuously updated population.

## How the panel is organised

The panel computes the chosen metric for **Result**, and the actions look at it from several sides.

1. **Front vs Reference** draws what the metric measures, and **Point Contributions** breaks it down point by point.
2. **All Metrics** and **Metric Guide** set the five side by side.
3. **Front Statistics** checks that the front is fit to be measured.
4. **Metric over Generations** and **Subsample Sensitivity** show how the value depends on the run and on the size of the front.
5. **Compare Two Fronts** and **Coverage** compare **Result** with **Second Result**.

Each metric has its own page: [Hypervolume](hv.md), [Generational Distance](gd.md), [Inverted Generational Distance](igd.md), [Epsilon-Indicator](eps.md) and [Spacing](spacing.md).

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ZDT2000a"></a>Zitzler, E., Deb, K., & Thiele, L. (2000). Comparison of Multiobjective Evolutionary Algorithms: Empirical Results. *Evolutionary Computation* 8(2), 173-195. [doi:10.1162/106365600568202](https://doi.org/10.1162/106365600568202)

<a id="ref-ZLT2001a"></a>Zitzler, E., Laumanns, M., & Thiele, L. (2001). SPEA2: Improving the Strength Pareto Evolutionary Algorithm. TIK-Report 103, ETH Zurich. [doi:10.3929/ethz-a-004284029](https://doi.org/10.3929/ethz-a-004284029)

<a id="ref-ZT1999a"></a>Zitzler, E., & Thiele, L. (1999). Multiobjective Evolutionary Algorithms: A Comparative Case Study and the Strength Pareto Approach. *IEEE Transactions on Evolutionary Computation* 3(4), 257-271. [doi:10.1109/4235.797969](https://doi.org/10.1109/4235.797969)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M., & da Fonseca, V. G. (2003). Performance Assessment of Multiobjective Optimizers: An Analysis and Review. *IEEE Transactions on Evolutionary Computation* 7(2), 117-132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
