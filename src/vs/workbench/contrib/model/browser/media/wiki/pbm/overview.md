# Pareto-Based Multi-Objective Optimisation: Overview

**Pareto-Based Multi-Objective Optimisation** approximates the set of best compromises between several conflicting objectives with four evolutionary algorithms from Metaheuristics.jl: NSGA-II, NSGA-III, SPEA2 and SMS-EMOA.

## Pareto optimality

When objectives conflict, no single solution is best in all of them. [Emmerich and Deutz (2025)](#ref-ED2025a) define Pareto dominance informally: a solution A dominates a solution B if A is better in at least one criterion and not worse in any other. A solution is Pareto optimal if no other solution dominates it, so that it cannot be improved in one criterion without worsening another.

The Pareto optimal solutions form the Pareto set in decision space, and their objective vectors form the Pareto front. A multi-objective algorithm returns a finite set of mutually non-dominated points, which [Emmerich and Deutz (2025)](#ref-ED2025a) call an approximation set of the Pareto front.

## Evolutionary multi-objective algorithms

[Emmerich and Deutz (2025)](#ref-ED2025a) write that interest in multi-objective evolutionary algorithms surged after the book of [Deb (2001)](#ref-Deb2001a), and that the algorithms differ mainly in their selection operators. They name three paradigms: Pareto-based algorithms, which rank by Pareto dominance first and by diversity among equally ranked points second, such as NSGA-II and SPEA2; indicator-based algorithms, which select by a performance indicator such as the hypervolume; and decomposition-based algorithms, among which they place NSGA-III.

[Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a) treat evolutionary algorithms for multi-objective problems at book length.

## Four algorithms

| Algorithm | Selection | Source |
|---|---|---|
| **NSGA-II** | Non-dominated sorting, then crowding distance | [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) |
| **NSGA-III** | Non-dominated sorting, then closeness to reference points | [Deb and Jain (2014)](#ref-DJ2014a) |
| **SPEA2** | Strength-based fitness, density estimation and an archive | [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a) |
| **SMS-EMOA** | Non-dominated sorting, then hypervolume contribution | [Beume, Naujoks and Emmerich (2007)](#ref-BNE2007a) |

All four come from Metaheuristics.jl, by [Mejia-de-Dios and Mezura-Montes (2022)](#ref-MM2022a), and are called with the same `optimize(f, bounds, algorithm)` interface.

## The problem

**Objectives** is a vector of expressions in x, all minimised; **Inequality Constraints** holds g(x) ≤ 0 and **Equality Constraints** h(x) = 0, with `[0.0]` meaning none; **Bounds** is a 2 × n matrix of lower and upper bounds. The default has two objectives, 4x₁² + 4x₂² and (x₁ − 5)² + (x₂ − 5)², two nonlinear inequality constraints, and bounds x₁ ∈ [0, 5], x₂ ∈ [0, 3].

**Population** and **Iterations** set the size of the population, 100 by default, and the number of generations, 250.

## What the panel returns

The main code returns the number of points on the front, the ideal and nadir points of the front, its hypervolume and whether all non-dominated solutions are feasible. The hypervolume uses a reference point 10% beyond the nadir, in the direction away from the ideal point.

The actions fall into five groups: Visualise plots the front and the convergence of the hypervolume; Diagnose gives front statistics and the hypervolume over five seeds; Predict shows how the budget and the trade-offs shape the front; Compare runs the four algorithms side by side; and Interpret shows the Pareto set and a compromise point.

## References

<a id="ref-BNE2007a"></a>Beume, N., Naujoks, B., & Emmerich, M. (2007). SMS-EMOA: Multiobjective Selection Based on Dominated Hypervolume. *European Journal of Operational Research* 181(3), 1653-1669. [doi:10.1016/j.ejor.2006.08.008](https://doi.org/10.1016/j.ejor.2006.08.008)

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B., & Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*. Springer (2nd ed.).

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

<a id="ref-DJ2014a"></a>Deb, K., & Jain, H. (2014). An Evolutionary Many-Objective Optimization Algorithm Using Reference-Point-Based Nondominated Sorting Approach, Part I: Solving Problems with Box Constraints. *IEEE Transactions on Evolutionary Computation* 18(4), 577-601. [doi:10.1109/TEVC.2013.2281535](https://doi.org/10.1109/TEVC.2013.2281535)

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

<a id="ref-MM2022a"></a>Mejia-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ZLT2001a"></a>Zitzler, E., Laumanns, M., & Thiele, L. (2001). SPEA2: Improving the Strength Pareto Evolutionary Algorithm. *TIK-Report 103, ETH Zurich*.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
