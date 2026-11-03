# Network Flows: Minimum Cut

The **Min Cut** model of the panel: the set of arcs of least total capacity whose removal separates the source from the sink, read off the residual graph of a maximum flow.

## Cuts

[Ford and Fulkerson (1956)](#ref-FF1956a) call a collection of arcs that meets every chain from source to sink a disconnecting set, and a disconnecting set with no proper subset that is also disconnecting a cut; the value of a set is the sum of the capacities of its arcs. [Williamson (2019)](#ref-Wil2019a) describes a cut by a set of nodes S that contains s but not t: the arcs of the cut are those leaving S, δ⁺(S), and its capacity is

u(δ⁺(S)) = Σ over (i, j) ∈ δ⁺(S) of u(i, j)

Only arcs from S to the rest count; arcs entering S do not.

## The minimal cut theorem

Any unit of flow from s to t must cross the cut, so Williamson shows that |f| ≤ u(δ⁺(S)) for every flow f and every cut S. Equality holds exactly when every arc leaving S is saturated.

The central result of network flow theory, in Williamson's words, is that the bound is always attained. [Ford and Fulkerson (1956)](#ref-FF1956a) state it as their minimal cut theorem: the maximal flow value obtainable in a network is the minimum value over all disconnecting sets. A maximum flow therefore certifies a minimum cut, and the other way round.

## Finding the cut

Williamson's proof gives the construction that the panel's code uses. Once no augmenting path is left, let S be the set of nodes reachable from s through arcs of positive residual capacity. The sink is not in S, and every arc from S to the rest has zero residual capacity, so it is saturated and |f| = u(δ⁺(S)).

The code computes the maximum flow with `maximum_flow` of GraphsFlows.jl, grows S by a depth-first search over residual capacities cap − flow, which include the reverse arcs of flow already sent, and lists the arcs with positive capacity from S to the rest. It prints the cut's capacity beside the flow value, the number of cut arcs beside the number of saturated arcs, and the nodes on the source side. GraphsFlows.jl also offers `mincut(flow_graph, source, target, capacity_matrix, algorithm)`, which returns the two parts and the value.

## Saturated arcs and cut arcs

Every arc of the cut is saturated, but, as the code's comment notes, a saturated arc need not be in the cut: an arc can carry its full capacity with both of its ends inside S, or both outside it. The panel's printout sets the two counts side by side, and **Bottleneck Edges** lists all saturated arcs, a set that contains the minimum cut.

## Global minimum cuts

A different problem asks for the cut of least capacity over all nontrivial sets S, with no source or sink given. [Williamson (2019)](#ref-Wil2019a) calls it the global minimum cut, and shows that it can be found with a number of s–t cut computations, or, in an undirected graph, by an algorithm based on maximum adjacency orderings, running in O(n(m + n log n)) time.

[Stoer and Wagner (1997)](#ref-SW1997a) present such an algorithm for undirected edge-weighted graphs, simple to describe and to implement, which uses no flow techniques and consists of about |V| nearly identical phases, each a maximum adjacency search. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides `maximum_adjacency_visit` for that search and `mincut(g, distmx)` for the global minimum cut of a graph with non-negative weights.

## References

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-SW1997a"></a>Stoer, M., & Wagner, F. (1997). A Simple Min-Cut Algorithm. *Journal of the ACM* 44(4), 585-591. [doi:10.1145/263867.263872](https://doi.org/10.1145/263867.263872)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md)
