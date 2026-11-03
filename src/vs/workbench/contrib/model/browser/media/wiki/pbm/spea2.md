# Pareto-Based Multi-Objective Optimisation: SPEA2

**SPEA2**, the improved Strength Pareto Evolutionary Algorithm of [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a), assigns fitness by the strength of dominance relations, estimates density from neighbouring points and keeps the elite in an archive.

## From SPEA to SPEA2

[Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a) describe SPEA as a technique for finding or approximating the Pareto-optimal set of multi-objective problems, which had shown very good performance in comparison with other multi-objective evolutionary algorithms and had become a point of reference in later studies.

SPEA2 improves on it in three ways: a fine-grained fitness assignment strategy, a density estimation technique, and an enhanced archive truncation method. Their comparison of SPEA2 with SPEA and two other modern elitist methods, PESA and NSGA-II, on different test problems yields promising results.

## Strength and density

[Emmerich and Deutz (2025)](#ref-ED2025a) classify SPEA2 as Pareto-based, but with a different ranking criterion from non-dominated sorting: the strength of an individual depends on how many other individuals it dominates and by how many it is dominated. In SPEA, clustering served as a secondary ranking criterion, and both operators, the strength and the secondary criterion, were refined in SPEA2.

The panel's decision table describes the density as a k-nearest-neighbour estimate, combined with the strength-based fitness; [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a) list the density estimation technique as the second of their three improvements over SPEA.

## The archive

SPEA2 maintains an archive of non-dominated solutions next to the population, a feature [Emmerich and Deutz (2025)](#ref-ED2025a) mention alongside its refined operators. The archive holds non-dominated solutions across generations, and the enhanced archive truncation method is the third improvement that [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a) list.

The panel's decision table describes the truncation as one that preserves boundary solutions, so that the extremes of the front are not lost when the archive is reduced.

## When to use it

The panel's decision table suggests **SPEA2** for fronts with uneven density, or when an external archive of elite solutions is wanted. The Metaheuristics.jl guide lists `SPEA2` with `NSGA2` and `SMS_EMOA` for problems with two or three objectives.

**Compare Algorithms** and **IGD Comparison** show how its front compares with those of the other three algorithms on the same problem, budget and seed.

## In the panel

The main code calls `SPEA2(N = N, options = ...)` with **Population** as N and the documented defaults of Metaheuristics.jl for the variation operators: crossover η = 20 with probability 0.9, mutation η = 20 with probability 1/D. The objective function returns objectives, inequality constraints and equality constraints, as for the other three algorithms.

The output is read the same way: the front, its ideal and nadir points, its hypervolume and the feasibility of its solutions.

## References

<a id="ref-ED2025a"></a>Emmerich, M., & Deutz, A. (2025). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies (Updated and revised ed.). [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

<a id="ref-ZLT2001a"></a>Zitzler, E., Laumanns, M., & Thiele, L. (2001). SPEA2: Improving the Strength Pareto Evolutionary Algorithm. *TIK-Report 103, ETH Zurich*.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SMS-EMOA](sms.md)
