# Network and Graph Optimisation: Interpretation

How to read what the panel prints: the objective of each model, the effect of noisy weights, the values for all pairs and vertices, the sensitivity to each edge of the solution, and the comparisons with baselines.

## The objective of each model

| Model | Objective | Reading |
|---|---|---|
| **Shortest Path** | `cost` | Total length of the cheapest route; `Inf` when the target is unreachable |
| **Robust Shortest Path** | `max_regret` | Largest excess over the best route in hindsight, across all lengths in the intervals |
| **Network Flow** | `max_flow` | Most that can pass from source to sink per unit of time, in a steady state |
| **Spanning Tree** | `total_weight` | Least cost of joining all vertices |
| **Bipartite Matching** | `total_weight` | Greatest weight of pairs along existing edges |
| **Assignment** | `total_cost` | Least cost of giving every worker at most one job |

**Solution Summary** prints the objective with a sentence naming the problem, and **Solution Edges** lists every edge of the solution with its weight, or, for a flow, with its flow, capacity and whether it is saturated.

## The robust path's figures

A maximum regret of zero means the robust path is a shortest path under every scenario. A positive value R means that, whatever the lengths turn out to be, the chosen path is never more than R longer than the best path for those lengths, and that some scenario brings the gap to R exactly.

`cost_if_all_low` and `cost_if_all_high` give the path's length at the two ends of its intervals. As [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) explain, the regret criterion is less conservative than the min-max criterion, which looks at the worst length alone; **Algorithm Comparison** shows the difference by printing the regret of the path that is shortest with every length at its upper bound.

## Weight uncertainty

**Weight Uncertainty** multiplies every weight by its own random factor between 0.8 and 1.2, solves again, and repeats 100 times. `same_solution_share` is the share of draws in which the solution has the same edges as the nominal one, and `objective_mean` and `objective_range` describe the objective across the draws.

A share close to 1 marks a solution that stays optimal under moderate noise; a low share means that other solutions have objectives close to the nominal one and overtake it when the weights move. For **Robust Shortest Path**, the noise is applied to both bounds of every interval.

## All pairs and vertex values

**All Pairs / Vertex Values** widens the view from one solution to many:

| Model | Output |
|---|---|
| **Shortest Path**, **Robust Shortest Path** | Floyd–Warshall distances between all pairs of vertices, with `Inf` for unreachable pairs |
| **Network Flow** | The maximum flow from the source to every other vertex as the sink |
| **Spanning Tree** | Distances between all pairs of vertices along the tree |
| **Bipartite Matching**, **Assignment** | The objective without each row, and its change |

For matching and assignment, the change measures what each row contributes: a large drop in matched weight, or a large rise in cost, marks a row that the optimum depends on.

## Edge sensitivity

**Edge Sensitivity** removes each edge of the solution in turn and solves again. For **Shortest Path**, **Network Flow**, **Bipartite Matching** and **Assignment**, removing an edge only takes options away, so a cost can only stay the same or rise, and a flow or a weight stay the same or fall. For **Robust Shortest Path**, the removal also takes routes away from the best path in hindsight, so the maximum regret can move either way.

A change of zero means that an alternative of equal value exists without that edge. For **Spanning Tree**, removing a bridge, an edge whose removal disconnects the graph, leaves a forest with a lower weight but `spans_all_vertices` false, which is not an improvement. For **Assignment**, the pair is forbidden with the cost 10·sum(W) rather than removed.

## Baseline comparisons

**Baseline Comparison** sets each solution against a simpler alternative. For paths and flows, the baseline makes every edge usable in both directions: an arc whose reverse is missing gains one with the same weight, and a pair with arcs both ways keeps its two weights. The graph only gains arcs, so the shortest length cannot rise and the maximum flow cannot fall.

For **Spanning Tree**, the baseline is the tree of shortest paths from vertex 1, which minimises distances from one vertex rather than total weight, so its weight is at least that of the minimum spanning tree. For **Bipartite Matching** and **Assignment**, a greedy method takes the heaviest or cheapest free pair first, and `gap` measures what it misses against the Hungarian optimum of [Kuhn (1955)](#ref-Kuh1955a).

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-Kuh1955a"></a>Kuhn, H. W. (1955). The Hungarian Method for the Assignment Problem. *Naval Research Logistics Quarterly* 2(1-2), 83-97. [doi:10.1002/nav.3800020109](https://doi.org/10.1002/nav.3800020109)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
