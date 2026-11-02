# Diagnostics

Quality of a front has several parts: feasibility, convergence, spread and stability. No single number captures them all, so each check addresses one part.

## How to Check Feasibility

`all_feasible` should be true. **Constraint Check** prints the front size, the count of feasible solutions, the largest violation, and the first generation with a feasible member, then plots the feasible share per generation. A late first feasible generation means that the search had trouble reaching the feasible region. A share stuck at a low level suggests a narrow region, or a helper population in the count. No feasible solution at all usually means an error in the sign of a constraint, or an impossible problem.

## How to Use Hypervolume

Hypervolume is the region of objective space dominated by the front, up to a reference point, as introduced by [Zitzler and Thiele (1999)](#ref-ZT1999a). Larger is better, and it rewards both convergence and spread. The code sets the reference 10% beyond the nadir of the front. Its value depends strongly on that point, so that values compare only under one reference. `hv` drops any solution outside the reference. **Compare Algorithms** builds a common reference for that reason.

## How to Test Stability Across Seeds

**Hypervolume** reruns on seeds 1 to 5, and reports mean and standard deviation. A large spread means that the result depends on luck, so a single run should not be reported alone. Five seeds give only a rough idea, and published comparisons often use 30 or more. A small spread with a poor value means a method that fails reliably. Rerun with a larger **Population** or **Iterations** if the spread is large.

## How to Test Convergence

**Budget Sensitivity** computes hypervolume at 0.1, 0.25, 0.5, 1 and 2 times **Iterations**, always with seed 1. A flat curve at the end suggests convergence for that seed, and a rising curve means that more budget helps. The curve need not rise everywhere, as each point is a separate run. Combine it with the view of the front, since hypervolume can flatten while part of the front stays missing. For **Epsilon-Dominance Archive**, memory grows with iterations, as every generation is stored.

## How to Check the Spread

**Pareto Front Plot** shows gaps at a glance, for two objectives. **Weight Vectors** joins each ray to the front solution serving it best, and repeated points or uneven gaps show parts missed. A gap may be a real feature of a cut front, so check that against **Active Constraints** or a rerun with more budget. For more than two objectives, use the indicators, and pairwise plots. **Weight Vectors** stops with an error in that case, as it needs exactly two objectives.

## How to Read IGD and the Limits of Indicators

IGD is the mean distance from each reference point to the nearest point of a front, so lower is better, and it rewards closeness and coverage. **IGD Comparison** uses the non-dominated union of all runs as the reference. Without the true front, it measures only how one run compares with the others. Each indicator has blind spots, and [Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) show why indicators can mislead if taken alone. Report more than one, and look at the plot.

## References

<a id="ref-ZT1999a"></a>Zitzler, E. and Thiele, L. (1999). Multiobjective evolutionary algorithms: a comparative case study and the strength Pareto approach. *IEEE Transactions on Evolutionary Computation* 3(4), 257–271. [doi:10.1109/4235.797969](https://doi.org/10.1109/4235.797969)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M. and da Fonseca, V. G. (2003). Performance assessment of multiobjective optimizers: an analysis and review. *IEEE Transactions on Evolutionary Computation* 7(2), 117–132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
