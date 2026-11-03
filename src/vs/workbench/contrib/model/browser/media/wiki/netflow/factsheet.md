# Network Flows: Factsheet

A quick reference for **Network Flows**: the three models, the inputs, what each run prints, and what each action computes. GraphsFlows.jl computes the flows on Graphs.jl's directed graphs, HiGHS solves the minimum-cost linear programme, and GraphMakie and GLMakie draw the charts.

## The three models side by side

| | **Max Flow** | **Min Cost** | **Min Cut** |
|---|---|---|---|
| Call | `maximum_flow(g, 1, N, cap_mat)` | `mincost_flow(g, demand, cap, cost, HiGHS.Optimizer)` | `maximum_flow`, then a search of the residual graph |
| Method | Push-relabel, the default | Linear programme | Nodes reachable from the source by residual capacity |
| Extra data | | Costs from 1 to 5 per unit; −10 at node 1, 10 at node N | |
| Output | Flow value, arcs with flow, saturated arcs | Total cost, arcs with flow, largest arc flow | Cut capacity and flow value, cut and saturated arcs, source side |

The relations among the three are those of [Williamson (2019)](#ref-Wil2019a): a maximum flow has the value of a minimum cut, and a minimum-cost flow is feasible only if the maximum flow can carry the demand.

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **N (nodes)** | 20 | Number of nodes; node 1 is the source and node N the sink |
| **M (edges)** | 40 | Number of random node pairs drawn; pairs of a node with itself are skipped |
| **cap (max capacity)** | 10 | Capacities drawn uniformly from the integers 1 to cap |

A pair drawn twice adds a second capacity to the same arc, so the network has at most M arcs. No random seed is set, so each run and each action draws a new network.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Flow Network** | The network drawn with `graphplot`, arc widths proportional to flow over capacity |
| Visualise | **Capacity vs Flow** | Bars of capacity and flow for every arc |
| Diagnose | **Bottleneck Edges** | The flow value and the list of saturated arcs, which contains the minimum cut |
| Diagnose | **Flow Conservation** | Inflow and outflow at every node other than the source and sink |
| Predict | **Capacity Sweep** | The maximum flow with all capacities multiplied by 1 to 5 |
| Predict | **Density Sweep** | The maximum flow for M from 10 to 100 in steps of 10, a new network each time |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Directed vs Undirected** | The maximum flow with one-way arcs and with arcs usable both ways at the same capacity, and their ratio |
| Compare | **Sparse vs Dense** | The number of arcs and the maximum flow for M = N and M = 4N |
| Interpret | **Network Utilisation** | The flow value, the total capacity, and the share of capacity that the flow uses |
| Interpret | **Bottleneck Sensitivity** | For every saturated arc, the gain in maximum flow when its capacity is doubled |

## Packages and textbooks

GraphsFlows.jl provides `maximum_flow`, with `PushRelabelAlgorithm`, `DinicAlgorithm` and `EdmondsKarpAlgorithm` among its algorithms, and `mincost_flow`; Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), provides `DiGraph`, `add_edge!` and `edges`.

[Williamson (2019)](#ref-Wil2019a), [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) and [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) cover the theory and algorithms. The original papers are [Ford and Fulkerson (1956)](#ref-FF1956a) on the minimal cut theorem, [Dinic (1970)](#ref-Din1970a) on blocking flows, and [Stoer and Wagner (1997)](#ref-SW1997a) on global minimum cuts.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Din1970a"></a>Dinic, E. A. (1970). Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation. *Soviet Mathematics Doklady*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-SW1997a"></a>Stoer, M., & Wagner, F. (1997). A Simple Min-Cut Algorithm. *Journal of the ACM* 44(4), 585-591. [doi:10.1145/263867.263872](https://doi.org/10.1145/263867.263872)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
