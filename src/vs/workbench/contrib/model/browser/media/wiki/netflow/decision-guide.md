# Network Flows: Decision Guide

Which model to choose for a question, which action answers it, which algorithm GraphsFlows.jl can use, and when another panel of Pollis is the better place to start.

## Choosing a model

| Question | Model | Why |
|---|---|---|
| How much can the network carry from one node to another? | **Max Flow** | The value of a maximum flow and the arcs it uses |
| How should a fixed amount be routed as cheaply as possible? | **Min Cost** | A flow that meets supplies and demands at the least total cost |
| Which arcs limit what the network can carry? | **Min Cut** | The set of arcs of least capacity separating source from sink |

The three answer one question from different sides. [Ford and Fulkerson (1956)](#ref-FF1956a) prove that the maximal flow equals the minimal cut, and [Williamson (2019)](#ref-Wil2019a) builds the minimum-cost problem on the same flows, with a cost per unit added to every arc.

## Choosing an action

| Question | Action |
|---|---|
| Where does the flow go, and how full is each arc? | **Flow Network**, **Capacity vs Flow** |
| Which arcs are full? | **Bottleneck Edges** |
| Is the flow valid at every node? | **Flow Conservation** |
| How does the flow respond to more capacity? | **Capacity Sweep** |
| How does it respond to more arcs? | **Density Sweep**, **Sparse vs Dense** |
| What do two-way links add? | **Directed vs Undirected** |
| How much of the capacity is used? | **Network Utilisation** |
| Which single upgrade raises the flow most? | **Bottleneck Sensitivity** |

## Choosing an algorithm

`maximum_flow` of GraphsFlows.jl uses push-relabel unless told otherwise, and takes `algorithm=DinicAlgorithm()` or `algorithm=EdmondsKarpAlgorithm()` for blocking flows or shortest augmenting paths. All three return a maximum flow, with the bounds that [Williamson (2019)](#ref-Wil2019a) proves: O(n²m) for push-relabel, O(mn²) for blocking flows, in the method of [Dinic (1970)](#ref-Din1970a), and O(m²n) for shortest augmenting paths. Williamson describes push-relabel as among the fastest in practice.

`mincost_flow` needs a linear programming optimiser from the MathOptInterface ecosystem; HiGHS is the panel's choice. GraphsFlows.jl also offers `mincut` for the minimum s–t cut and `multiroute_flow`, which takes a number of routes.

## Choosing the inputs

**N (nodes)** and **M (edges)** set the size and density of the random network. With M close to N, the source or the sink can have few arcs, and the flow is then small or zero; with M several times N, there are more routes to use. **cap (max capacity)** sets the range of the capacities, and larger values allow more flow on each arc, as its tooltip says.

For **Min Cost**, the demand of 10 units must not exceed the maximum flow, so a network that **Max Flow** shows carrying less than 10 calls for more arcs or larger capacities.

## Beyond the panel's models

[Williamson (2019)](#ref-Wil2019a) covers generalised flows, with gains and losses on arcs, and multicommodity flows, in which several commodities share capacities, as well as global minimum cuts with no source or sink, for which [Stoer and Wagner (1997)](#ref-SW1997a) give a simple algorithm. [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) and [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) treat the classical theory; Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides `mincut(g, distmx)` for global cuts.

## When to use another panel

| Goal | Panel |
|---|---|
| Shortest paths, robust paths, assignment and other optimisation on graphs | **Network and Graph Optimisation** |
| A general linear programme beyond flows | **Linear Programming** |
| Integer decisions, such as which arcs to build | **Discrete and Combinatorial Optimisation** |
| Structure of a network: degrees, clustering, centrality | **Network Analysis** |
| Failures that spread through a loaded network | **Network Dynamics** |

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Din1970a"></a>Dinic, E. A. (1970). Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation. *Soviet Mathematics Doklady*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-SW1997a"></a>Stoer, M., & Wagner, F. (1997). A Simple Min-Cut Algorithm. *Journal of the ACM* 44(4), 585-591. [doi:10.1145/263867.263872](https://doi.org/10.1145/263867.263872)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
