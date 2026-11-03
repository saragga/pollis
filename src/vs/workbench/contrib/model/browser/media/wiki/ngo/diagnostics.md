# Network and Graph Optimisation: Diagnostics

How to check a solution: drawing it, validating its constraints, confirming the optimum by an independent method, and checking that the graph is connected.

## Drawing the solution

**Graph Plot** places the vertices on a circle, or the rows and columns in two columns for **Bipartite Matching** and **Assignment**, draws every edge in grey and the solution's edges in red. **Weight Heatmap** shows the matrix itself, with rows as the tails of edges and columns as their heads, and marks the entries the solution uses.

**Solution Profile** depends on the model:

| Model | Plot |
|---|---|
| **Shortest Path** | Distance from the source to every vertex |
| **Robust Shortest Path** | Histogram of the maximum regret of every simple path, with the robust path's regret marked |
| **Network Flow** | Flow beside capacity on every arc |
| **Spanning Tree** | Weights of the tree's edges against those of all edges |
| **Bipartite Matching**, **Assignment** | Weight or cost of each chosen pair |

## Validating the constraints

**Solution Validation** tests the conditions that define a feasible solution of each problem. A path must start at **Source**, end at **Target**, use existing edges and visit no vertex twice, and its weights must add up to the reported cost. A flow must stay within every capacity and conserve flow at every vertex other than the source and the sink; the net outflow of the source is then the value of the flow.

A spanning tree must connect all n vertices with n − 1 edges, and is acyclic exactly when both hold. In a matching or an assignment, no row or column may appear twice; an assignment must also contain as many pairs as the smaller dimension of **Cost Matrix (n x p)**.

## Confirming the optimum

**Cross-Check** solves each problem a second way:

| Model | Independent method | Basis |
|---|---|---|
| **Shortest Path** | Bellman–Ford | Both are exact on non-negative lengths, by [Williamson (2019)](#ref-Wil2019a) |
| **Robust Shortest Path** | 500 random scenarios inside the intervals | No sampled regret can exceed the worst-case regret, by Proposition 7 of [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) |
| **Network Flow** | `mincut` | Maximal flow equals minimal cut, by [Ford and Fulkerson (1956)](#ref-FF1956a) |
| **Spanning Tree** | `prim_mst` | Every minimum spanning tree has the same weight |
| **Bipartite Matching**, **Assignment** | Linear programming relaxation | The relaxation's value is reached by an integral solution when `relaxation_integral` is true |

## Reading the cross-check

For **Shortest Path**, `same_path` can be false when two paths of equal length exist, while the two lengths still agree. For **Robust Shortest Path**, `bound_holds` compares the largest regret found among the samples with the exact maximum regret. The exact value is attained at the path's worst-case scenario, with each of its own edges at the upper bound and every other edge at the lower bound, so a sampled scenario can come close to it but never exceed it.

For **Network Flow**, the output also lists the two sides of the minimum cut, the source side and the sink side. For **Spanning Tree**, only the weights of the two trees are compared, since a graph with tied weights can have more than one minimum spanning tree.

## Connectivity

**Connectivity Check** counts the vertices and edges, computes the observed density, the share of the n(n − 1) possible directed edges that are present, and lists the strongly connected components and the vertices reachable from vertex 1. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides `is_weakly_connected` and `strongly_connected_components` for these.

A target that cannot be reached from the source has no path, an infinite shortest length and a maximum flow of zero. With the generated chain, every vertex is reachable from vertex 1. For **Assignment**, the check reports a complete bipartite graph, the numbers of workers and jobs, and the range of the costs.

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
