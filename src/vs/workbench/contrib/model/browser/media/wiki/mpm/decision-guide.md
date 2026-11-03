# Multi-Objective Optimisation Performance Metrics: Decision Guide

The choice of metric follows from what is known about the true front and from which aspect of quality matters for the purpose at hand. A study usually reports more than one, chosen so that together they cover convergence and spread.

## Which metric?

| Situation | Choose | Reason |
|---|---|---|
| No true front is known | **Hypervolume** | Needs only a reference point |
| One number that respects dominance | **Hypervolume** | Strictly monotonic with respect to dominance |
| A reference front, with convergence and coverage both important | **Inverted Generational Distance** | Penalises gaps as well as distance |
| A worst-case guarantee | **Epsilon-Indicator** | Set by the worst-covered region |
| Closeness to the front only | **Generational Distance** | Blind to spread, by design |
| Evenness of the trade-offs offered | **Spacing** | Needs no reference at all |

The decision table on the panel gives the same choices with their reasons.

## Which combinations work well?

A single unary metric summarises a set in one number, and [Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) analyse the limits of that kind of assessment. Reporting several metrics, each covering a different aspect, gives a fuller picture.

| Purpose | Combination |
|---|---|
| A general benchmark against a known front | **Hypervolume**, **Inverted Generational Distance** |
| Separating convergence from spread | **Generational Distance**, **Spacing** |
| A guarantee as well as an average | **Inverted Generational Distance**, **Epsilon-Indicator** |
| Two algorithms compared directly | Any of these, with **Coverage** |

**All Metrics** and **Compare Two Fronts** give the five values at once, so the combination can be chosen when the results are read.

## How should the reference point be set?

The panel's `refpoint` lies 10% of the range beyond the worst value of each objective, over every front in the comparison and the reference. Every front is then measured against the same point, which is the condition for comparing hypervolumes at all.

[Ishibuchi, Imada, Setoguchi and Nojima (2018)](#ref-IISN2018a) propose a method for specifying the reference point for a fair comparison, based on the optimal distribution of solutions for hypervolume maximisation. A study that reports hypervolumes states its reference point, so that others can reproduce the values.

## How large should the reference front be?

**Reference Front** sets the resolution of the three metrics that use it. A sparse reference makes **Inverted Generational Distance** blind to gaps between its points, and makes **Generational Distance** overstate distances for points that fall between reference points.

The ZDT1 front of the demonstration is dense. For a reference of one's own, **Subsample Sensitivity** run on the reference itself, passed as **Result**, shows how stable the metrics are to its size.

## When is another panel the better place?

| Situation | Better place |
|---|---|
| Running NSGA-II, SPEA2 and other Pareto-based algorithms | **Pareto-Based Multi-Objective Optimisation** |
| Decomposition methods, or problems with constraints | **Decomposition and Constrained Multi-Objective Optimisation** |

Both panels run their algorithms with `Metaheuristics.jl`, so a result from either can be passed here as **Result** or **Second Result**, together with the reference front of its test problem.
## A sensible order of work

1. Read **Front Statistics**: size, dominated points, ranges.
2. Plot **Front vs Reference** for the chosen metric.
3. Read **All Metrics**, and **Metric Guide** for what each one rewards.
4. Check **Subsample Sensitivity** if the fronts differ in size.
5. Compare with **Compare Two Fronts** and **Coverage**.
6. Locate strengths and weaknesses with **Point Contributions**.

Step 1 comes first because a front with dominated points, duplicates or mismatched scales distorts every value that follows.

## References

<a id="ref-IISN2018a"></a>Ishibuchi, H., Imada, R., Setoguchi, Y., & Nojima, Y. (2018). How to Specify a Reference Point in Hypervolume Calculation for Fair Performance Comparison. *Evolutionary Computation* 26(3), 411-440. [doi:10.1162/evco_a_00226](https://doi.org/10.1162/evco_a_00226)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M., & da Fonseca, V. G. (2003). Performance Assessment of Multiobjective Optimizers: An Analysis and Review. *IEEE Transactions on Evolutionary Computation* 7(2), 117-132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
