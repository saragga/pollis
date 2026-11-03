# Pareto-Based Multi-Objective Optimisation: Diagnostics

How to check a run: the convergence of the hypervolume, the size, spread and feasibility of the front, the variation across seeds, and the effect of the budget.

## What a good approximation needs

[Emmerich and Deutz (2025)](#ref-ED2025a) note that multi-objective optimisation requires not only proximity to Pareto optimal solutions but also comprehensive coverage of the Pareto front. A finite approximation set A is better than another, B, if every point of B is weakly dominated by at least one point of A, and A ≠ B.

The diagnostics of the panel look at both sides: the hypervolume rewards proximity and spread together, the spacing measures the evenness of the spread, and the front size and objective ranges show its coverage.

## Convergence of the hypervolume

**Convergence Plot** computes the hypervolume of the non-dominated set after every generation, with the reference point of the final front. As its description says, the curve rises quickly, then flattens as the front settles.

A curve that is still rising at the last generation suggests that more **Iterations** would improve the front; **Budget Sensitivity** checks the same question from the other side. For SMS-EMOA, [Emmerich and Deutz (2025)](#ref-ED2025a) note that the hypervolume of the population can only grow or stay equal while the reference point is unchanged.

## Front statistics

**Front Statistics** returns the number of points on the front, the range of each objective, the spacing, whether all non-dominated solutions are feasible, the largest total constraint violation among them, and the number of function evaluations.

The spacing is Schott's indicator, computed with `PerformanceIndicators.spacing`; its documentation states that a spacing of 0 means the vectors are uniformly distributed. The objective ranges show how far the front spans, from the best value of each objective on the front to its worst.

## Variation across seeds

**Hypervolume** prints the hypervolume of the front and its mean and standard deviation over five independent runs with seeds 1 to 5. As its description says, a large spread means the result depends on luck.

[Emmerich and Deutz (2025)](#ref-ED2025a) describe the median attainment curve, over the outcome sets of several runs, as a good summary of the behaviour of an optimiser. The five runs of the action give a smaller-scale view of the same variability, through one number per run.

## The effect of the budget

**Budget Sensitivity** runs the algorithm with 0.1, 0.25, 0.5, 1 and 2 times **Iterations**, seed 1 throughout, and plots the hypervolume reached against the number of generations. As its description says, the curve shows how much a larger budget would still improve the front: a flat end suggests that the budget suffices for the problem at hand.

The number of function evaluations, printed by **Front Statistics**, measures the cost of a run, which [Emmerich and Deutz (2025)](#ref-ED2025a) describe as the primary resource in single- and multi-objective optimisation alike.

## Constraint violations

The non-dominated set may contain solutions that violate a constraint. `all_feasible` in the main output and **Front Statistics** report this, and `max_violation` gives the largest sum of violations.

[Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) modify dominance to handle constraints, and the Metaheuristics.jl documentation of each algorithm defines feasibility as gᵢ(x) ≤ 0 and hⱼ(x) = 0. The default problem has two inequality constraints, and **Decision Space** shows where in the box of **Bounds** the non-dominated solutions lie.

## References

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
