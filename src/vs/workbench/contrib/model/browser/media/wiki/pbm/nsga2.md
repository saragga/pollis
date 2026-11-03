# Pareto-Based Multi-Objective Optimisation: NSGA-II

**NSGA-II**, the Non-dominated Sorting Genetic Algorithm II of [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a), ranks solutions by non-dominated sorting and breaks ties by crowding distance, keeping the best N of parents and offspring together.

## What NSGA-II improved

[Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) write that multi-objective evolutionary algorithms using non-dominated sorting and sharing had been criticised for three things: an O(MN³) computational complexity, for M objectives and population size N; a non-elitist approach; and the need to specify a sharing parameter. NSGA-II alleviates all three.

Its fast non-dominated sorting runs in O(MN²), and its selection operator creates a mating pool by combining the parent and offspring populations and selecting the best N solutions with respect to fitness and spread.

## The generational loop

[Emmerich and Deutz (2025)](#ref-ED2025a) give the loop. Each generation creates N offspring from the current population: parents are chosen by binary tournament, in which the better-ranked of two individuals wins, and recombined; for real-valued problems, with simulated binary crossover and polynomial mutation. Parents and offspring are merged, and the N best of the merged set, by the multi-objective ranking, form the next population.

The loop runs until a termination criterion is met, such as convergence or a limit on the computational budget; in the panel, **Iterations** generations.

## Non-dominated sorting

Non-dominated sorting partitions the population into layers. In the recursion of [Emmerich and Deutz (2025)](#ref-ED2025a), the first layer R₁ holds the non-dominated solutions of the population, and each next layer the non-dominated solutions of what remains:

R₁ = ND(P), Rₖ₊₁ = ND(P \ (R₁ ∪ … ∪ Rₖ))

The rank of a solution is the index of its layer, and solutions in the same layer are mutually incomparable. To fill the next population, whole layers are taken in order of rank while they fit, and the last layer that does not fit is cut by crowding distance.

## Crowding distance

Within a layer, the crowding distance ranks solutions by the space around them. For each objective i, [Emmerich and Deutz (2025)](#ref-ED2025a) take the nearest neighbours of x on either side in that objective, lᵢ and uᵢ, and set cᵢ(x) = uᵢ − lᵢ; the crowding distance is the mean over the m objectives,

c(x) = (1/m) Σᵢ cᵢ(x)

The more space there is around a solution, the greater its crowding distance, and solutions with a high crowding distance are ranked better, to maintain diversity. Ties are broken at random. For two objectives, the distance is proportional to the perimeter of the rectangle that just touches the neighbouring points.

## Constraints

[Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) modify the definition of dominance to solve constrained multi-objective problems efficiently, and report results of the constrained NSGA-II on test problems that include a five-objective, seven-constraint nonlinear problem.

In Metaheuristics.jl, the objective function returns a tuple of objectives, inequality constraints and equality constraints, and a feasible solution satisfies gᵢ(x) ≤ 0 and hⱼ(x) = 0, as the documentation of `NSGA2` states. The default problem of the panel has two inequality constraints and no equality constraint.

## In the panel

The main code calls `NSGA2(N = N, options = Options(iterations = ..., seed = 1, store_convergence = true))`, with **Population** as N, and the documented defaults for the rest: crossover η = 20 with probability 0.9, mutation η = 20 with probability 1/D.

[Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) report that, for most of the problems tried, NSGA-II found a much better spread of solutions and better convergence near the true Pareto-optimal front than two other elitist algorithms, the Pareto-archived evolution strategy and the strength Pareto evolutionary algorithm. The Metaheuristics.jl guide lists NSGA-II among its choices for two or three objectives and for constrained multi-objective problems.

## References

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
