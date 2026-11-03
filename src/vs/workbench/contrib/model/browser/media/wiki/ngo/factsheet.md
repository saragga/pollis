# Network and Graph Optimisation: Factsheet

The panel's models, inputs, outputs, functions and sources at a glance.

## Models

| Model | Objective | Function | Package |
|---|---|---|---|
| **Shortest Path** | Least total length from **Source** to **Target** | `dijkstra_shortest_paths` | Graphs.jl |
| **Robust Shortest Path** | Least maximum regret over interval lengths | `all_simple_paths`, `dijkstra_shortest_paths` | Graphs.jl |
| **Network Flow** | Greatest flow from **Source** to **Target** | `maximum_flow` with `PushRelabelAlgorithm()` | GraphsFlows.jl |
| **Spanning Tree** | Least total weight of a tree on all vertices | `kruskal_mst` | Graphs.jl |
| **Bipartite Matching** | Greatest total weight of row–column pairs | `hungarian` on shifted costs | Hungarian.jl |
| **Assignment** | Least total cost of a worker–job assignment | `hungarian` | Hungarian.jl |

## Inputs

| Input | Default | Models |
|---|---|---|
| **Vertices (n)** | 8 | all |
| **Edge Density** | 0.4 | all but **Assignment** |
| **Random Seed** | 1 | all |
| **Weight Matrix (n x n)** | `random_weights(n, density, seed)` | all but **Assignment** |
| **Upper Bounds (n x n)** | lower bound plus an integer from 0 to 6 | **Robust Shortest Path** |
| **Cost Matrix (n x p)** | integers from 1 to 20 | **Assignment** |
| **Source** | 1 | paths and flow |
| **Target** | n | paths and flow |

## Outputs

| Model | Fields |
|---|---|
| **Shortest Path** | `path`, `cost`, `reachable`, `distances_from_source` |
| **Robust Shortest Path** | `robust_path`, `max_regret`, `cost_if_all_low`, `cost_if_all_high`, `paths_enumerated` |
| **Network Flow** | `max_flow`, `arcs_used` |
| **Spanning Tree** | `tree_edges`, `total_weight`, `spans_all_vertices` |
| **Bipartite Matching** | `matched_pairs`, `total_weight`, `matching_size` |
| **Assignment** | `assignment`, `total_cost` |

Each model also defines `objective(sol)` and `sol_edges(sol)`, which the actions use to read the objective value and the edges of any solution in the same way.

## Independent checks

| Model | **Cross-Check** |
|---|---|
| **Shortest Path** | `bellman_ford_shortest_paths` on the same graph |
| **Robust Shortest Path** | Regret of the robust path in 500 random scenarios inside the intervals |
| **Network Flow** | `mincut` of GraphsFlows.jl |
| **Spanning Tree** | `prim_mst` of Graphs.jl |
| **Bipartite Matching**, **Assignment** | Linear programming relaxation with JuMP and HiGHS |

## Key results

| Result | Source |
|---|---|
| Dijkstra's algorithm needs non-negative lengths; O(m log n) with a heap | [Williamson (2019)](#ref-Wil2019a) |
| Maximal flow equals minimal cut | [Ford and Fulkerson (1956)](#ref-FF1956a) |
| A path's regret is largest with its own edges high and all others low | [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) |
| Interval min-max regret shortest path, spanning tree and assignment are strongly NP-hard | [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) |
| The greedy algorithm builds a minimum spanning tree | [Kruskal (1956)](#ref-Kru1956a), [Nešetřil (1997)](#ref-Nes1997a) |
| The Hungarian method solves the assignment problem | [Kuhn (1955)](#ref-Kuh1955a) |

## Sources

| Topic | Works |
|---|---|
| Shortest paths | [Dijkstra (1959)](#ref-Dij1959a), [Williamson (2019)](#ref-Wil2019a) |
| Robust shortest paths | [Montemanni and Gambardella (2004)](#ref-MG2004a), [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) |
| Flows and cuts | [Ford and Fulkerson (1956)](#ref-FF1956a), [Williamson (2019)](#ref-Wil2019a) |
| Spanning trees | [Kruskal (1956)](#ref-Kru1956a), [Nešetřil (1997)](#ref-Nes1997a) |
| Matching and assignment | [Kuhn (1955)](#ref-Kuh1955a), [Williamson (2019)](#ref-Wil2019a) |
| Textbooks | [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a), [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) |
| Software | [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a) |

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Dij1959a"></a>Dijkstra, E. W. (1959). A Note on Two Problems in Connexion with Graphs. *Numerische Mathematik* 1(1), 269-271. [doi:10.1007/BF01386390](https://doi.org/10.1007/BF01386390)

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Kru1956a"></a>Kruskal, J. B. (1956). On the Shortest Spanning Subtree of a Graph and the Traveling Salesman Problem. *Proceedings of the American Mathematical Society* 7(1), 48-50. [doi:10.1090/S0002-9939-1956-0078686-7](https://doi.org/10.1090/S0002-9939-1956-0078686-7)

<a id="ref-Kuh1955a"></a>Kuhn, H. W. (1955). The Hungarian Method for the Assignment Problem. *Naval Research Logistics Quarterly* 2(1-2), 83-97. [doi:10.1002/nav.3800020109](https://doi.org/10.1002/nav.3800020109)

<a id="ref-MG2004a"></a>Montemanni, R., & Gambardella, L. M. (2004). An Exact Algorithm for the Robust Shortest Path Problem with Interval Data. *Computers & Operations Research* 31(10), 1667-1680. [doi:10.1016/S0305-0548(03)00114-X](https://doi.org/10.1016/S0305-0548(03)00114-X)

<a id="ref-Nes1997a"></a>Nešetřil, J. (1997). A Few Remarks on the History of MST-Problem. *Archivum Mathematicum* 33(1-2), 15-22. [dml.cz/dmlcz/107593](http://dml.cz/dmlcz/107593)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
