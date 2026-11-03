# Network and Graph Optimisation: Bipartite Matching

**Bipartite Matching** pairs the rows of the weight matrix with its columns along existing edges, at most one partner each, so that the total weight of the pairs is as large as possible.

## A bipartite reading of the matrix

A bipartite graph has two groups of vertices, with every edge joining a vertex of one group to a vertex of the other. The model reads **Weight Matrix (n x n)** in that way: row i is a vertex on the left, column j a vertex on the right, and an entry W[i, j] > 0 is an edge between them with that weight. **Graph Plot** draws the rows in one column and the columns in another, with the chosen pairs highlighted.

A matching is a set of edges no two of which share a vertex. The problem asks for a matching of greatest total weight. With the default generator, the diagonal of the matrix is zero and roughly a share **Edge Density** of the other entries is positive, so not every row can be paired with every column.

## Matching and assignment

Weighted bipartite matching is closely tied to the assignment problem of [Kuhn (1955)](#ref-Kuh1955a), in which n persons are assigned to n jobs so that the sum of their scores is as large as possible. [Williamson (2019)](#ref-Wil2019a) treats the minimum-cost perfect matching problem in a bipartite graph with two groups of equal size, in which every vertex is covered by exactly one chosen edge, and notes that it is also sometimes called the assignment problem.

Williamson models it as a minimum-cost circulation: a source joined to every left vertex and a sink joined to every right vertex by arcs of capacity 1, the edges of the graph as arcs of capacity 1 with their costs, and an arc back from the sink to the source. A feasible circulation exists exactly when the graph has a perfect matching, and a minimum-cost circulation gives a minimum-cost perfect matching.

## In the panel

The code turns the maximisation into a minimisation and solves it with `hungarian` of Hungarian.jl:

`assignment = hungarian(maximum(W) .- W)[1]`

Every entry is subtracted from the largest weight, so heavy edges become cheap and a non-edge, of weight 0, receives the largest cost. A square matrix assigns every row to one column, and the shifted costs of the n chosen entries add up to n·max(W) minus their weights, so the least shifted cost is the greatest weight. Pairs on non-edges add nothing to the weight, and the code keeps only the pairs with W[i, j] > 0.

The result prints `matched_pairs`, `total_weight` and `matching_size`, the number of real pairs.

## Checking the optimum

**Solution Validation** confirms that every row and every column is used at most once, that every pair is a real edge, and that the weights of the pairs add up to the reported total.

**Cross-Check** solves the linear programme in which each x(i, j) lies between 0 and 1, every row and every column has a total of at most 1, and the variables of non-edges are fixed at 0, with JuMP and HiGHS. It prints the Hungarian total, the value of the linear programme, whether the two agree, and whether every variable of the linear solution is 0 or 1.

**Baseline Comparison** builds a greedy matching that takes the heaviest remaining edge whose row and column are both free, and prints its weight beside the optimum and the gap between them.

## Further reading

[Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) add a chapter on matchings in bipartite graphs in their fourth edition. [Williamson (2019)](#ref-Wil2019a) develops, in its exercises, an algorithm for the minimum-cost perfect matching problem that runs in O(n(m + n log n)) time for n vertices and m edges. It finds successive shortest paths with Dijkstra's algorithm on reduced costs, a use of Dijkstra's algorithm that [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a), as Williamson notes, trace to earlier work.

The **Assignment** model of the panel solves the related problem in which every row must be assigned at minimum cost.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Kuh1955a"></a>Kuhn, H. W. (1955). The Hungarian Method for the Assignment Problem. *Naval Research Logistics Quarterly* 2(1-2), 83-97. [doi:10.1002/nav.3800020109](https://doi.org/10.1002/nav.3800020109)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Assignment](am.md)
