# Network and Graph Optimisation: Spanning Tree

**Spanning Tree** connects every vertex of the graph at the least total weight, with Kruskal's algorithm on the undirected version of the weight matrix.

## The minimum spanning tree problem

A spanning tree of a connected undirected graph is a set of edges that joins all its vertices without forming a circuit; with n vertices, it has n − 1 edges. [Nešetřil (1997)](#ref-Nes1997a) states the problem as follows: given a connected graph with real weights on its edges, find a spanning tree whose total weight is minimal. When the vertices are points of a metric space and the weights are distances, the solution is the shortest network connecting all the points.

Nešetřil calls the problem a cornerstone of combinatorial optimisation, and in a sense its cradle, and notes that it has a polynomial solution whatever the weight function, negative weights included.

## Two rules

According to [Nešetřil (1997)](#ref-Nes1997a), all known algorithms for the problem combine two dual properties of trees:

| Rule | Statement |
|---|---|
| Cut rule | The optimal tree contains an edge of minimal weight in every cut |
| Circuit rule | The edge of a circuit whose weight is larger than that of every other edge of the circuit is not in the optimal tree |

A cut here is a split of the vertices into two groups, and the edges of the cut are those with one end in each group. The rules explain why an algorithm may add the lightest edge across a cut, or discard the heaviest edge of a circuit, without losing optimality.

## Kruskal's algorithm

The greedy algorithm of [Kruskal (1956)](#ref-Kru1956a), in the words of [Nešetřil (1997)](#ref-Nes1997a), sorts the edges by increasing weight and takes each in turn, adding it to the tree if, together with the edges already chosen, it does not form a circuit. Nešetřil describes the greedy algorithm as perhaps the most thoroughly studied and used heuristic in combinatorial optimisation, and notes that the class of problems it solves was identified with the matroids.

Nešetřil adds that the greedy algorithm, though perhaps the easiest to state, is not the fastest known, if only because sorting the edges by weight brings a non-linear lower bound of order n log n, and that such complexity considerations revived the interest in other procedures.

## Other algorithms

[Nešetřil (1997)](#ref-Nes1997a) recalls that the procedure known as Prim's algorithm was formulated as early as 1930, and that Borůvka gave the first efficient solution in 1926: every vertex selects its lightest edge, each component of the selected edges is contracted to a single vertex, and the algorithm is applied again to the contracted graph. The note also updates the extensive literature on the problem.

Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides `kruskal_mst`, `prim_mst` and `boruvka_mst`, each for a connected undirected graph with an optional weight matrix. Its documentation asks `boruvka_mst` for distinct edge weights, and lets `kruskal_mst` and `boruvka_mst` compute a maximum spanning tree with `minimize=false`. [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) treat minimum spanning trees among their graph algorithms.

## In the panel

The weight matrix is directed, so the code first symmetrises it: the undirected edge i – j exists if either i → j or j → i has a finite length, and takes the larger of the two when both do. It then builds a `SimpleGraph` and calls `kruskal_mst(g, Wu)`. The result prints `tree_edges`, `total_weight` and `spans_all_vertices`, which is true when the tree has n − 1 edges.

The chain 1 → 2 → … → n added by the generator keeps the undirected graph connected, so the default inputs always have a spanning tree. **Cross-Check** computes the weight of the tree found by `prim_mst` and compares it with Kruskal's, and **Baseline Comparison** sets the tree against the tree of shortest paths from vertex 1.

## References

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-Kru1956a"></a>Kruskal, J. B. (1956). On the Shortest Spanning Subtree of a Graph and the Traveling Salesman Problem. *Proceedings of the American Mathematical Society* 7(1), 48-50. [doi:10.1090/S0002-9939-1956-0078686-7](https://doi.org/10.1090/S0002-9939-1956-0078686-7)

<a id="ref-Nes1997a"></a>Nešetřil, J. (1997). A Few Remarks on the History of MST-Problem. *Archivum Mathematicum* 33(1-2), 15-22. [dml.cz/dmlcz/107593](http://dml.cz/dmlcz/107593)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
