# Network and Graph Optimisation: Assumptions

What the six models take for granted: the generated graph, known and non-negative weights, independent intervals for the robust path, an undirected reading for spanning trees, a bipartite reading for matching, and a complete set of worker–job pairs for assignment.

## The generated graph

**Random Seed** fixes a random generator, and every ordered pair i → j with i ≠ j becomes an edge with probability **Edge Density**, with an integer weight from 1 to 9. A pair that is not drawn has no edge, marked Inf for **Shortest Path**, **Robust Shortest Path** and **Spanning Tree** and 0 for **Network Flow** and **Bipartite Matching**. The chain 1 → 2 → … → n is then completed, with a weight from 5 to 9 for any of its edges not already drawn, so that every vertex can be reached from vertex 1, as the tooltip of **Edge Density** states.

The matrix is directed: W[i, j] and W[j, i] are drawn separately. Any matrix typed into **Weight Matrix (n x n)** replaces the generated one, with the same reading of its entries, as the tooltip of **Weight Matrix (n x n)** gives it. For **Shortest Path**, **Robust Shortest Path** and **Spanning Tree**, a finite entry off the diagonal is an edge of that length, 0 included, and Inf means no edge. For **Network Flow** and **Bipartite Matching**, a positive entry is an edge with that capacity or weight, and 0 means no edge.

## Known, non-negative weights

**Shortest Path**, **Network Flow**, **Spanning Tree**, **Bipartite Matching** and **Assignment** take every weight as a fixed, known number. Dijkstra's algorithm in particular relies on non-negative lengths: [Williamson (2019)](#ref-Wil2019a) proves its correctness under that condition, and turns to Bellman–Ford when some lengths are negative.

An edge of length zero is entered as 0 in the matrices of the three path and tree models, and a missing edge as Inf. The generated weights are all at least 1, and **Weight Uncertainty** multiplies them by factors between 0.8 and 1.2, so they stay positive and a missing edge stays Inf. **Network Flow** reads the entries as capacities, which are non-negative by definition, and an arc of capacity 0 carries no flow.

## Independent intervals

**Robust Shortest Path** assumes that the length of every edge lies between its lower bound in **Weight Matrix (n x n)** and its upper bound in **Upper Bounds (n x n)**, and that each length can take any value in its interval regardless of the others. [Aissi, Bazgan and Vanderpooten (2009)](#ref-ABV2009a) call this the interval scenario case, in which the set of scenarios is the Cartesian product of the intervals.

The tooltip of **Upper Bounds (n x n)** requires upper ≥ lower on every edge, and **Solution Validation** checks it as `bounds_ordered`. No probabilities are attached to the scenarios: the regret criterion looks only at the worst one for each path.

## An undirected reading for trees

A spanning tree joins vertices without regard to direction. **Spanning Tree** therefore turns the directed matrix into an undirected one: i and j are joined if either W[i, j] or W[j, i] is finite, and the edge takes the larger of the two weights when both are, and the finite one otherwise. [Nešetřil (1997)](#ref-Nes1997a) states the problem for a connected undirected graph with real weights on its edges, and `kruskal_mst` of Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), is documented for a connected, undirected graph.

The chain added by the generator makes the undirected graph connected; with a typed matrix that leaves it disconnected, `spans_all_vertices` reports false.

## A bipartite reading for matching

**Bipartite Matching** reads the n × n matrix as a bipartite graph, with the rows as one group of vertices and the columns as the other. Row i and column j are different vertices even when i = j, so the edge directions of the other models play no part. A pair can be matched only along a positive entry, and each row and each column takes at most one partner.

[Kuhn (1955)](#ref-Kuh1955a) poses the assignment problem with a score for every person–job pair. In the matching model, the missing entries are given the largest shifted cost and then dropped, so pairs that are not edges never count towards the weight.

## A complete set of pairs for assignment

**Assignment** assumes that every worker can do every job, at the cost given in **Cost Matrix (n x p)**, and that each worker takes at most one job and each job at most one worker. With more workers than jobs, some workers are left unassigned, and with more jobs than workers, some jobs are left without a worker.

The costs add up: the total is the sum of the costs of the chosen pairs, with no interaction between pairs. The Hungarian.jl README shows how to exclude a pair, by writing `missing` in its place.

## References

<a id="ref-ABV2009a"></a>Aissi, H., Bazgan, C., & Vanderpooten, D. (2009). Min–Max and Min–Max Regret Versions of Combinatorial Optimization Problems: A Survey. *European Journal of Operational Research* 197(2), 427-438. [doi:10.1016/j.ejor.2008.09.012](https://doi.org/10.1016/j.ejor.2008.09.012)

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-Kuh1955a"></a>Kuhn, H. W. (1955). The Hungarian Method for the Assignment Problem. *Naval Research Logistics Quarterly* 2(1-2), 83-97. [doi:10.1002/nav.3800020109](https://doi.org/10.1002/nav.3800020109)

<a id="ref-Nes1997a"></a>Nešetřil, J. (1997). A Few Remarks on the History of MST-Problem. *Archivum Mathematicum* 33(1-2), 15-22. [dml.cz/dmlcz/107593](http://dml.cz/dmlcz/107593)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Network Flow](nf.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
