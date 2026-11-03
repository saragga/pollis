# Multi-Objective Optimisation Performance Metrics: Epsilon-Indicator

The additive epsilon-indicator measures the smallest amount by which a front must be moved, equally in every objective, so that it weakly dominates the reference front. Smaller is better, and the value is set by the region of the reference front that the obtained front covers worst.

## Definition

[Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) define the epsilon-indicators, and [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) state the additive one as follows. A vector a additively ε-dominates a vector b when a_i ≤ ε + b_i for every objective i. For two sets A and B, the additive indicator is

I+(A, B) = max over b in B of ( min over a in A of ( max over i of ( a_i − b_i ) ) )

the smallest ε for which every point of B is ε-dominated by some point of A. A value of zero or less means that A weakly dominates B.

## How the panel computes it

`epsilon(F)` evaluates the formula with A the obtained front and B the reference front, in a line of the panel's code:

`maximum(minimum(maximum(F[i, :] .- ref[j, :]) for i in axes(F, 1)) for j in axes(ref, 1))`

For each reference point, the inner part finds the obtained point that needs the smallest shift to dominate it; the outer maximum takes the reference point that needs the largest such shift. The result is in the units of the objectives, so it reads directly as a margin: no point of the reference front is better than the obtained front by more than epsilon in any objective.

## Reading the shifted front

**Front vs Reference** draws the obtained front shifted by minus epsilon in every objective, in red. Every reference point is then weakly dominated by some point of the shifted front, and at least one reference point is only just reached.

**Point Contributions** plots the reference points, coloured by the shift each one needs, and prints the five largest. The largest is the epsilon-indicator itself, and the reference points with large values mark the region where the front falls short.

## What does it reward?

The review places the epsilon-indicator among convergence indicators and states that the binary additive and multiplicative versions are Pareto compliant, need no knowledge of the Pareto front, and extend naturally the approximation schemes of optimisation theory.

The value involves only one particular element of each set, as the review notes. **Epsilon-Indicator** therefore gives a worst-case guarantee: every point of the reference front is matched within epsilon in every objective. Two fronts with the same worst region score the same, whatever they do elsewhere, which is why it reads best beside an average such as **Inverted Generational Distance**.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M., & da Fonseca, V. G. (2003). Performance Assessment of Multiobjective Optimizers: An Analysis and Review. *IEEE Transactions on Evolutionary Computation* 7(2), 117-132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Spacing](spacing.md)
