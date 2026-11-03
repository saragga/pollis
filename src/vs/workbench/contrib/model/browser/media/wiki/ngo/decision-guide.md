# Network and Graph Optimisation: Decision Guide

Which model fits a question, which action answers it, which function of the Julia packages to reach for, how to set the inputs, and when another panel of Pollis is the better place to start.

## Choosing a model

| Question | Model | Why |
|---|---|---|
| Cheapest route between two vertices, with known lengths | **Shortest Path** | Dijkstra's algorithm, exact for non-negative lengths |
| Route choice when lengths are only known within bounds | **Robust Shortest Path** | Least maximum regret over all lengths in the intervals |
| Capacity of a network between two vertices | **Network Flow** | Maximum flow, equal to the minimum cut |
| Cheapest way to join every vertex | **Spanning Tree** | Kruskal's algorithm on the undirected graph |
| Best pairing of two groups along allowed links | **Bipartite Matching** | Greatest total weight, at most one partner each |
| Allocation of workers to jobs at least cost | **Assignment** | The Hungarian method on the full cost matrix |

## Choosing an action

| Question | Action |
|---|---|
| What does the solution look like? | **Graph Plot**, **Weight Heatmap**, **Solution Profile** |
| Is it feasible? | **Solution Validation** |
| Is it optimal? | **Cross-Check** |
| Can the target be reached? | **Connectivity Check** |
| Does the solution survive noisy weights? | **Weight Uncertainty** |
| What happens for other pairs, sinks or rows? | **All Pairs / Vertex Values** |
| Which edges does the optimum depend on? | **Edge Sensitivity** |
| How fast are the algorithms, and how do they scale? | **Algorithm Comparison**, **Graph Size Scaling** |
| What does the optimum gain over a simple alternative? | **Baseline Comparison** |
| What is the solution, edge by edge? | **Solution Summary**, **Solution Edges** |

## Choosing a function

| Problem | Functions | Package |
|---|---|---|
| Shortest paths | `dijkstra_shortest_paths`, `bellman_ford_shortest_paths`, `a_star`, `floyd_warshall_shortest_paths`, `yen_k_shortest_paths` | Graphs.jl |
| Spanning trees | `kruskal_mst`, `prim_mst`, `boruvka_mst` | Graphs.jl |
| Flows and cuts | `maximum_flow`, `mincut` | GraphsFlows.jl |
| Assignment and weighted matching | `hungarian` | Hungarian.jl |

For negative lengths, [Williamson (2019)](#ref-Wil2019a) replaces Dijkstra's algorithm by Bellman–Ford, and shows how to modify it to detect negative-cost cycles. **Algorithm Guide** prints a rule of thumb for each problem class. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), documents each function with its arguments.

## Choosing the inputs

**Vertices (n)** sets the size of the problem. For **Robust Shortest Path**, every simple path is enumerated, and the number of paths grows quickly with **Vertices (n)** and **Edge Density**, which keeps the model to small graphs; for larger ones, [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) survey mixed integer formulations, branch-and-bound and the path-ranking algorithm of [Montemanni and Gambardella (2004)](#ref-MG2004a).

**Edge Density** controls how many alternatives exist: with few edges besides the chain 1 → 2 → … → n, there are few other routes for paths and flows, and few pairs to match. **Upper Bounds (n x n)** sets the width of each interval of the robust model. A matrix of one's own can replace any default, with 0 for a missing edge.

## When to use another panel

| Goal | Panel |
|---|---|
| Minimum-cost flows and minimum cuts as separate models | **Network Flows** |
| Degrees, clustering and centrality of a network | **Network Analysis** |
| Synchronisation and cascades on a network | **Network Dynamics** |
| A general linear programme | **Linear Programming** |
| Combinatorial problems beyond the six of the panel | **Discrete and Combinatorial Optimisation** |
| Robust solutions over an uncertainty set | **Uncertainty-Set Robust Optimisation** |

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-MG2004a"></a>Montemanni, R., & Gambardella, L. M. (2004). An Exact Algorithm for the Robust Shortest Path Problem with Interval Data. *Computers & Operations Research* 31(10), 1667-1680. [doi:10.1016/S0305-0548(03)00114-X](https://doi.org/10.1016/S0305-0548(03)00114-X)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
