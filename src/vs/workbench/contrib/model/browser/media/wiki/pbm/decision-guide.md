# Pareto-Based Multi-Objective Optimisation: Decision Guide

Which algorithm to run, how to set the population and the number of generations, and how to compare the results.

## Choosing an algorithm

| Situation | Algorithm |
|---|---|
| Two or three objectives, with or without constraints | **NSGA-II** |
| Four or more objectives | **NSGA-III** |
| Two or three objectives, with an archive of non-dominated solutions next to the population | **SPEA2** |
| Two or three objectives, quality judged by hypervolume | **SMS-EMOA** |

The table follows the panel's decision table. The Metaheuristics.jl guide gives a similar selection: `NSGA2`, `SPEA2` or `SMS_EMOA` for two or three objectives, `NSGA3` for more than three, and `NSGA2` or `NSGA3` among the choices for constrained multi-objective problems.

## Three paradigms

[Emmerich and Deutz (2025)](#ref-ED2025a) group multi-objective evolutionary algorithms by their selection. Pareto-based algorithms, such as NSGA-II and SPEA2, rank by dominance first and diversity second. Indicator-based algorithms, such as SMS-EMOA, use a performance indicator like the hypervolume to guide selection. Decomposition-based algorithms split the problem into subproblems that target different sections of the front, and NSGA-III is among them.

The four algorithms of the panel thus cover all three paradigms, and keep diversity along the front in four ways: by crowding, by density and an archive, by reference points and by hypervolume contributions.

## The number of objectives

[Deb and Jain (2014)](#ref-DJ2014a) call problems with four or more objectives many-objective, and designed NSGA-III for them, applying it to problems with three to 15 objectives.

For SMS-EMOA, [Emmerich and Deutz (2025)](#ref-ED2025a) report that all hypervolume contributions can be computed in Θ(N log N) time for two and three objectives, and `SMS_EMOA` approximates the hypervolume with `n_samples` samples when there are more than two. With two objectives, as in the default problem, all four algorithms apply.

## Population and generations

**Population** sets the number of individuals, typically 100 to 300 by its tooltip, and **Iterations** the number of generations, typically 200 to 500. The front is drawn from the population, so a larger population can hold more points on it.

**Convergence Plot** and **Budget Sensitivity** show whether the budget suffices: a hypervolume that has flattened by the last generation, and changes little at twice the budget, suggests that more generations would add little.

## Comparing algorithms

**Compare Algorithms** runs all four on the same problem, with the same **Population**, number of generations and seed, and reports the front size, the hypervolume at a common reference point, the spacing and the run time. **IGD Comparison** measures the distance of each front to the non-dominated union of all four.

[Emmerich and Deutz (2025)](#ref-ED2025a) stress two aspects of performance assessment: the computational resources used, often counted in function evaluations, and the quality of the result, which in multi-objective optimisation means both proximity to the Pareto front and coverage of it. Since one seed gives one outcome, **Hypervolume** shows the spread over five seeds for the selected algorithm.

## From the front to a decision

The algorithms return a set of compromises, and the choice among them belongs to the decision maker. [Emmerich and Deutz (2025)](#ref-ED2025a) describe multicriteria optimisation as computing Pareto optimal solutions to aid decision analysis and decision making.

**Trade-Off Rates** shows where along the front a gain in one objective is cheap or costly in the other, and **Compromise Point** gives a default choice when no preference is stated: the solution closest to the ideal point after scaling. **Decision Space** gives the decision variables of solutions spread along the front, for a closer look at the candidates.

[Deb (2001)](#ref-Deb2001a) and [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a) treat the algorithms and their use at book length.

## References

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B., & Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*. Springer (2nd ed.).

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

<a id="ref-DJ2014a"></a>Deb, K., & Jain, H. (2014). An Evolutionary Many-Objective Optimization Algorithm Using Reference-Point-Based Nondominated Sorting Approach, Part I: Solving Problems with Box Constraints. *IEEE Transactions on Evolutionary Computation* 18(4), 577-601. [doi:10.1109/TEVC.2013.2281535](https://doi.org/10.1109/TEVC.2013.2281535)

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
