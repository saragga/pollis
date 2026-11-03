# Pareto-Based Multi-Objective Optimisation: Assumptions

What the four algorithms take for granted: minimised objectives within box bounds, constraints in a fixed form, conflicting objectives, a finite budget of evaluations, randomness controlled by a seed, and a reference point for the hypervolume.

## Minimised objectives within bounds

[Mejia-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) state the problem that Metaheuristics.jl solves: minimise f(x) subject to gⱼ(x) ≤ 0 for j = 1, …, J and hₗ(x) = 0 for l = 1, …, L, with every decision variable between a lower and an upper bound, where f can be single- or multi-objective.

All entries of **Objectives** are therefore minimised; an objective to maximise enters with a minus sign. **Bounds** gives the box, one column per decision variable, and the candidate solutions are drawn within it.

## The form of the constraints

The objective function returns a tuple of three vectors, objectives, inequality constraints and equality constraints, as the documentation of each algorithm states, and a solution is feasible when gᵢ(x) ≤ 0 and hⱼ(x) = 0. **Inequality Constraints** and **Equality Constraints** take `[0.0]` when there are none, which is always satisfied.

[Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) handle constraints by modifying the definition of dominance, and [Mejia-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) note that Metaheuristics.jl handles both equality and inequality constraints. **Front Statistics** reports the largest total constraint violation among the non-dominated solutions.

## Conflicting objectives

A Pareto front exists as a set of more than one point only when the objectives conflict: if one solution were best in every objective, it would dominate all others, and the front would reduce to it. [Emmerich and Deutz (2024)](#ref-ED2024a) describe ideal solutions where all objectives are optimally met as rare, so that the aim is to find good compromises and avoid lose-lose outcomes.

The default problem has conflicting objectives: the first is smallest at the origin, the second at (5, 5).

## No gradients, but a budget

The four algorithms use only objective and constraint values, never derivatives. [Mejia-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) describe metaheuristics as stochastic algorithms that approximate optimal solutions quickly where not all of the mathematical properties of the problem are known.

What they need instead is a budget of evaluations, set here by **Population** and **Iterations**. [Emmerich and Deutz (2024)](#ref-ED2024a) point out that computation time is often gauged by counting function evaluations, and **Front Statistics** prints the number used.

## Randomness and the seed

All four algorithms are stochastic, and their result depends on the random numbers drawn. The main code fixes `seed = 1` in `Options`, so a run can be repeated exactly. **Hypervolume** runs the algorithm with seeds 1 to 5 to show how much the result varies.

[Emmerich and Deutz (2024)](#ref-ED2024a) describe the attainment curve approach, which summarises the outcome sets of several runs of an algorithm through the probability that a point in objective space is attained.

## A reference point for the hypervolume

The hypervolume needs a reference point that bounds the dominated region. The documentation of `PerformanceIndicators.hypervolume` notes that each point of the front must weakly dominate the reference point, and that the front must be a non-dominated set.

The panel sets the reference point 10% beyond the nadir of the front and keeps only the points that strictly dominate it, so the value depends on the front itself. **Compare Algorithms** uses a common reference point for all four fronts, so that their hypervolumes can be compared.

## References

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ED2024a"></a>Emmerich, M., & Deutz, A. (2024). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies. [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

<a id="ref-MM2022a"></a>Mejia-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
