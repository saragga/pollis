# Network and Graph Optimisation: Shortest Path

**Shortest Path** finds the cheapest route from **Source** to **Target** in a directed graph whose edges have non-negative lengths, with Dijkstra's algorithm as implemented in Graphs.jl.

## The problem

A directed graph has a length c(i, j) on every edge i → j, and the length of a path is the sum of the lengths of its edges. The shortest path problem asks for a path of least length from a source s to a target t, and in its single-source form for the least length d(i) from s to every vertex i.

[Williamson (2019)](#ref-Wil2019a) notes that the lengths are really costs, so the problem could be called the cheapest path problem, and treats it as the simplest flow problem with costs: an uncapacitated one, in which sending a(i) units from s to i costs a(i)·d(i) along a cheapest path. In the panel, the entry W[i, j] of **Weight Matrix (n x n)** is the length of the edge i → j, and 0 marks a missing edge.

## Dijkstra's algorithm

The algorithm, due to [Dijkstra (1959)](#ref-Dij1959a), keeps a label d(i) for every vertex, an upper bound on its true distance from s. At the start d(s) = 0 and every other label is ∞. As [Williamson (2019)](#ref-Wil2019a) describes it, the algorithm marks the unmarked vertex with the smallest label, whose label is then known to be exact, and updates every edge (i, j) leaving it:

d(j) = min(d(j), d(i) + c(i, j))

Marking and updating repeat until every reachable vertex is marked, and labels only ever decrease. The argument that the smallest label is exact needs every length to be non-negative. With a binary heap, Williamson gives a running time of O(m log n) for n vertices and m edges, and O(m + n log n) with a Fibonacci heap.

## Negative lengths: Bellman–Ford

When some lengths are negative, the Bellman–Ford algorithm passes over all edges, applying the same update, n − 1 times. [Williamson (2019)](#ref-Wil2019a) shows that after k passes every label is at most the length of the shortest path with at most k edges, so n − 1 passes suffice when no negative-cost cycle can be reached from s; with such a cycle, the shortest path is not defined. Williamson notes that the algorithm is traditionally attributed jointly to Bellman and Ford, and was found by others at about the same time.

The lengths drawn by the panel are integers from 1 to 9, all positive, and **Cross-Check** runs `bellman_ford_shortest_paths` on the same graph to confirm the length and the path found by Dijkstra's algorithm.

## In the panel

The code builds a `SimpleDiGraph` from **Weight Matrix (n x n)**, calls `dijkstra_shortest_paths(g, source, W)` with the matrix as the edge lengths, and reads the path to **Target** with `enumerate_paths`. The state returned by Graphs.jl holds `dists`, the distance from the source to every vertex, and `parents`, the predecessor of each vertex on its shortest path, as its documentation describes.

The result has four fields: `path`, the vertices from source to target; `cost`, its length; `reachable`, false when the length is infinite; and `distances_from_source`, the whole vector of distances. Because the generator always adds the chain 1 → 2 → … → n, every vertex is reachable from vertex 1 on the default inputs.

## Related algorithms in Graphs.jl

Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), offers several shortest-path functions besides `dijkstra_shortest_paths` and `bellman_ford_shortest_paths`. `a_star` computes a single source–target path by A* search with an optional heuristic, and returns its edges. `floyd_warshall_shortest_paths` and `johnson_shortest_paths` compute the distances between all pairs of vertices; for Floyd–Warshall the documentation gives a space requirement of the order of |V|². `yen_k_shortest_paths` computes the K shortest distances between a source and a target by Yen's algorithm, and returns their paths too.

**Algorithm Comparison** times Dijkstra, Bellman–Ford, A* with a zero heuristic, and Floyd–Warshall on the panel's graph, and **All Pairs / Vertex Values** prints the Floyd–Warshall distance matrix. [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) and [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) treat these algorithms at textbook length.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Dij1959a"></a>Dijkstra, E. W. (1959). A Note on Two Problems in Connexion with Graphs. *Numerische Mathematik* 1(1), 269-271. [doi:10.1007/BF01386390](https://doi.org/10.1007/BF01386390)

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
