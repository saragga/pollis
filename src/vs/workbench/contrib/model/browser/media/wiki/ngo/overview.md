# Network and Graph Optimisation: Overview

**Network and Graph Optimisation** solves six classic problems on a weighted graph or a cost matrix: shortest paths, robust paths under interval lengths, maximum flows, minimum spanning trees, weighted bipartite matchings and assignments. Graphs.jl, GraphsFlows.jl and Hungarian.jl compute the solutions.

## Optimisation on graphs

A graph optimisation problem looks for the best structure of a given kind inside a graph: a path, a flow, a tree or a set of pairs. Several of these problems were stated and solved in the 1950s. [Kuhn (1955)](#ref-Kuh1955a) gave the Hungarian method for assignment, [Ford and Fulkerson (1956)](#ref-FF1956a) proved that the maximal flow equals the minimal cut, [Kruskal (1956)](#ref-Kru1956a) published his greedy algorithm for spanning trees, and [Dijkstra (1959)](#ref-Dij1959a) his algorithm for shortest paths.

[Nešetřil (1997)](#ref-Nes1997a) lists Dantzig, Dijkstra, Kruskal, Kuhn and Prim among the many contributors of that decade to the spanning tree problem alone, which he calls a cornerstone of combinatorial optimisation.

## Six problems

| Model | Question | Answer |
|---|---|---|
| **Shortest Path** | What is the cheapest route from the source to the target? | A path, its length and the distance to every vertex |
| **Robust Shortest Path** | Which route is safest when lengths are only known within intervals? | The path of least maximum regret |
| **Network Flow** | How much can be sent from the source to the sink? | The maximum flow value and the arcs it uses |
| **Spanning Tree** | How can all vertices be joined at least cost? | A minimum spanning tree and its weight |
| **Bipartite Matching** | Which rows and columns should be paired to maximise weight? | A matching of greatest total weight |
| **Assignment** | Which worker should do which job at least cost? | A minimum-cost assignment |

## Robustness

Four of the models take the weights as known. **Robust Shortest Path** instead treats each edge length as an interval and minimises the largest regret, the gap between the chosen path's length and the length of the best path once the true lengths are known. [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) survey this criterion for shortest paths, spanning trees, assignment and cuts, and [Montemanni and Gambardella (2004)](#ref-MG2004a) give an exact algorithm for the robust shortest path with interval data.

## The software

Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides the graph types and the functions `dijkstra_shortest_paths`, `all_simple_paths` and `kruskal_mst`. GraphsFlows.jl adds `maximum_flow` and `mincut` on the same graphs, and Hungarian.jl provides `hungarian` for assignment. JuMP and HiGHS solve the linear programmes of **Cross-Check** and **Algorithm Comparison** for matching and assignment.

Graphs are built from **Weight Matrix (n x n)**, whose entry W[i, j] is the weight of the directed edge i → j. A missing edge is Inf for **Shortest Path**, **Robust Shortest Path** and **Spanning Tree**, where 0 is an edge of length zero, and 0 for **Network Flow** and **Bipartite Matching**.

## How the panel is organised

**Vertices (n)**, **Edge Density** and **Random Seed** generate the matrix, with integer weights from 1 to 9 and a chain 1 → 2 → … → n that keeps every vertex reachable from vertex 1. **Source** and **Target** set the ends of paths and flows, **Upper Bounds (n x n)** the intervals of the robust model, and **Cost Matrix (n x p)** the costs of the assignment.

The actions fall into five groups: Visualise draws the graph, the matrix and a profile of the solution; Diagnose validates the solution, confirms it by an independent method and checks connectivity; Predict perturbs the weights, solves for all pairs or vertices, and removes edges of the solution; Compare times algorithms, scales the graph and sets the solution against a baseline; and Interpret summarises the solution and its edges and prints an algorithm guide.

[Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a), [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) and [Williamson (2019)](#ref-Wil2019a) treat the algorithms at book length.

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

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
