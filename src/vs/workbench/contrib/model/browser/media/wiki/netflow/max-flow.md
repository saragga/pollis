# Network Flows: Maximum Flow

The **Max Flow** model of the panel: the largest amount that can be sent from a source to a sink through a network whose arcs have capacities, computed with GraphsFlows.jl.

## The problem

[Ford and Fulkerson (1956)](#ref-FF1956a) open their paper with the problem as T. Harris put it: a rail network connects two cities through intermediate cities, each link has a capacity, and in a steady state the task is to find a maximal flow from one city to the other. They note that the problem can be set up as a linear programme, and that a network with many sources and sinks reduces to one with a single source and a single sink.

[Williamson (2019)](#ref-Wil2019a) states the problem on a directed graph with a source s, a sink t and non-negative integer capacities u(i, j). A flow f obeys two kinds of constraint:

| Constraint | Condition |
|---|---|
| Capacity | 0 ≤ f(i, j) ≤ u(i, j) on every arc |
| Conservation | Flow into i equals flow out of i, for every node other than s and t |

The value |f| is the net flow leaving the source, which by conservation equals the net flow entering the sink.

## Skew symmetry and the residual graph

Williamson adds a reverse arc (j, i) for every arc (i, j) and requires f(j, i) = −f(i, j), so that a flow is described by an antisymmetric matrix. GraphsFlows.jl returns the flow in the same form, which the panel's code notes: F[v, u] = −F[u, v].

The residual capacity of an arc is u_f(i, j) = u(i, j) − f(i, j). On a reverse arc it equals the flow on the forward arc, the amount by which that flow could be reduced. An arc with zero residual capacity is saturated, and an s–t path of arcs with positive residual capacity is an augmenting path: pushing the smallest residual capacity on the path along it gives a flow of greater value.

## Optimality

[Williamson (2019)](#ref-Wil2019a) proves that the following are equivalent for a flow f:

1. f is a maximum flow;
2. no augmenting path exists in the residual graph;
3. |f| equals the capacity of some s–t cut.

The third condition links the flow to [Minimum Cut](min-cut.md). With integer capacities, augmenting from the zero flow keeps every flow integral, so an integral maximum flow exists; Williamson calls it the integrality property, and the panel's capacities, drawn from 1 to **cap (max capacity)**, are integers.

## Algorithms

Augmenting along arbitrary paths need not run in polynomial time, so the algorithms choose their steps with care. [Williamson (2019)](#ref-Wil2019a) analyses three families that GraphsFlows.jl offers:

| GraphsFlows.jl | Method | Bound |
|---|---|---|
| `EdmondsKarpAlgorithm()` | Augment along a shortest path, with the fewest arcs | O(m²n) |
| `DinicAlgorithm()` | Augment by blocking flows in the layered graph of shortest paths | O(mn²) |
| `PushRelabelAlgorithm()`, the default | Push excess from node to node under distance labels, keeping a preflow | O(n²m) |

Here n is the number of nodes and m the number of arcs. Williamson attributes blocking flows to [Dinic (1970)](#ref-Din1970a), and describes push-relabel as among the fastest algorithms in practice. Every method returns a maximum flow, so the value does not depend on the choice.

## The panel's network

The code builds `DiGraph(N)` and draws **M (edges)** ordered pairs of nodes at random, skipping pairs with the same node twice. Each accepted pair becomes an arc with a capacity drawn uniformly from 1 to **cap (max capacity)**; a pair drawn again adds a new draw to the capacity of the existing arc. Node 1 is the source and node N the sink.

`maximum_flow(g, source, sink, cap_mat)` of GraphsFlows.jl, which builds on Graphs.jl by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), returns the value of the flow and the flow matrix. The run prints the value, the number of arcs that carry flow, and the number of saturated arcs.

## References

<a id="ref-Din1970a"></a>Dinic, E. A. (1970). Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation. *Soviet Mathematics Doklady*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
