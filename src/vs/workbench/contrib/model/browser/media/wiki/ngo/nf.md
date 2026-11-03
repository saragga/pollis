# Network and Graph Optimisation: Network Flow

**Network Flow** reads the weight matrix as arc capacities and computes the largest flow that can be sent from **Source** to **Target**, with the push-relabel algorithm of GraphsFlows.jl.

## The maximum flow problem

Every arc i → j can carry any amount between 0 and its capacity u(i, j), the entry W[i, j] of **Weight Matrix (n x n)**. A flow from s to t respects the capacities and conserves flow at every vertex other than s and t: what enters such a vertex leaves it. Its value is the net amount leaving s, and the problem asks for a flow of largest value.

[Ford and Fulkerson (1956)](#ref-FF1956a) took the problem from a question of Harris about a rail network joining two cities through intermediate ones, each link with a capacity, in a steady state. [Williamson (2019)](#ref-Wil2019a) lists applications that run from the transport of goods and information to image segmentation in computer vision.

## Flows and cuts

An s–t cut splits the vertices into a set S containing s and its complement containing t, and its capacity is the total capacity of the arcs leaving S. Every unit of flow must cross the cut, so no flow can be worth more than any cut. The minimal cut theorem of [Ford and Fulkerson (1956)](#ref-FF1956a) states that the maximal flow value equals the minimal cut capacity.

**Cross-Check** applies the theorem: it calls `mincut` of GraphsFlows.jl on the same graph and prints the maximum flow, the capacity of the cut, whether the two agree, and the two sides of the cut. With integer capacities, as the panel draws them, [Williamson (2019)](#ref-Wil2019a) shows that an integral maximum flow exists.

## Algorithms

[Williamson (2019)](#ref-Wil2019a) treats the main families of maximum flow algorithms. Augmenting path methods push flow along an s–t path with spare residual capacity until none is left; choosing a shortest such path at every step bounds the work at O(m²n) for n vertices and m arcs. Blocking flow methods augment along all shortest paths at once, in O(mn²). Push-relabel methods let vertices hold an excess and push it towards the sink, guided by distance labels, in O(n²m), and Williamson describes them as among the fastest in practice.

`maximum_flow` of GraphsFlows.jl takes the algorithm as an argument. **Algorithm Comparison** runs `PushRelabelAlgorithm()`, `EdmondsKarpAlgorithm()`, `DinicAlgorithm()` and `BoykovKolmogorovAlgorithm()` on the same network and prints the value and the time of each.

## In the panel

The code builds a `SimpleDiGraph` from the weight matrix and calls `maximum_flow(g, source, target, W, PushRelabelAlgorithm())`, which returns the value and a flow matrix F whose entry F[i, j] is the flow from i to j. The result prints `max_flow` and `arcs_used`, the arcs carrying a positive flow.

**Solution Edges** lists each of those arcs with its flow, its capacity and whether it is saturated, and **Solution Profile** sets the flow on every arc beside its capacity. **All Pairs / Vertex Values** solves the problem again with every other vertex as the sink in turn. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), supplies the graph type on which GraphsFlows.jl works.

## Beyond a single maximum flow

The **Network Flows** panel of Pollis studies the same problem with minimum-cost flows and minimum cuts as separate models. [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) give a book-length account of the theory, algorithms and applications of network flows, and [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) a chapter on maximum flow among their graph algorithms.

[Williamson (2019)](#ref-Wil2019a) goes on to minimum-cost flows, flows with gains and losses on arcs, flows of several commodities that share capacities, and global minimum cuts with no source or sink.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Shortest Path](sp.md) · [Robust Shortest Path](rsp.md) · [Spanning Tree](st.md) · [Bipartite Matching](bm.md) · [Assignment](am.md)
