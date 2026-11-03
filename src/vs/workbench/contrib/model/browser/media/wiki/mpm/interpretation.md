# Multi-Objective Optimisation Performance Metrics: Interpretation

A metric value means little on its own. Reading it calls for the direction in which it improves, a comparison with another front or with the reference, and a look at which points earn or lose the score.

## Reading a single value

| Metric | Value of zero | Units |
|---|---|---|
| **Hypervolume** | No point dominates the reference point | Product of the objective units, as a volume |
| **Generational Distance** | Every obtained point lies on the reference front | Objective units |
| **Inverted Generational Distance** | Every reference point is matched by an obtained point | Objective units |
| **Epsilon-Indicator** | The front weakly dominates the reference, with no margin in its worst-covered region | Objective units |
| **Spacing** | All nearest-neighbour distances are equal | Objective units |

The hypervolume has no natural upper bound, since it grows with the distance of the reference point. Its value is meaningful against another front measured with the same reference point, or as a ratio to the hypervolume of the reference front, which [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) give as the hyperarea ratio.

The epsilon-indicator can be negative, when the front dominates the reference with room to spare.

## What does each metric reward?

**Metric Guide** prints the five values with what each needs and rewards.

| Metric | Needs | Rewards |
|---|---|---|
| **Hypervolume** | A reference point only | Convergence and spread, compatible with dominance |
| **Generational Distance** | A reference front | Convergence only |
| **Inverted Generational Distance** | A reference front | Convergence and coverage of the reference |
| **Epsilon-Indicator** | A reference front | The worst-case approximation |
| **Spacing** | Nothing | Evenness of spread only |

Two fronts can then be judged on the aspect that matters for the purpose at hand. A front for a decision-maker to choose from needs coverage and evenness; a front for locating the best attainable values needs convergence.

## Which front is better?

**Compare Two Fronts** prints the five metrics for **Result** and **Second Result**, with the winner of each. The hypervolume uses the same reference point for both, since `refpoint` is computed from both fronts and the reference together.

| Outcome | Reading |
|---|---|
| One front wins all five | Strong evidence that it is better on this problem |
| Split between convergence and spread metrics | One converges better, the other covers better |
| Hypervolume and IGD disagree | The two aggregate convergence and coverage differently |

A single run of each algorithm compares two fronts, not two algorithms. A conclusion about the algorithms calls for several runs with different seeds.

## Does one front dominate the other?

**Coverage** computes the set coverage in both directions. C(A, B) is the share of points of B weakly dominated by some point of A, in the definition given by [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a).

| `C_A_covers_B` | `C_B_covers_A` | Reading |
|---|---|---|
| 1 | Below 1 | A covers B completely |
| High | Low | A largely dominates B |
| Similar | Similar | Neither front dominates the other |
| 0 | 0 | No point of either dominates a point of the other |

Both directions are needed, since the review notes that C(A, B) is not always equal to 1 minus C(B, A).

## Where does the score come from?

**Point Contributions** breaks the chosen metric down point by point, colours the points by their value, and prints the five largest.

| Metric | Value per point | Large values mark |
|---|---|---|
| **Hypervolume** | Hypervolume lost when the point is removed | The trade-offs that matter most |
| **Generational Distance** | Distance to the reference front | Points far from the front |
| **Inverted Generational Distance** | Distance from each reference point to the front | Gaps in the front |
| **Epsilon-Indicator** | Shift needed to dominate each reference point | The worst-covered region |
| **Spacing** | Deviation from the mean neighbour distance | Crowded or isolated points |

For IGD and epsilon the chart shows the reference points, since those metrics are computed from the reference side.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
