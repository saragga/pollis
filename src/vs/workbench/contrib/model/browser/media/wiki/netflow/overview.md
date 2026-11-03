# Network Flows: Overview

**Network Flows** solves three classic problems on a random directed network with capacities: the maximum flow from a source to a sink, the cheapest way to send a given amount, and the minimum cut that limits the flow. GraphsFlows.jl, built on Graphs.jl, computes the flows.

## What is a flow network?

A flow network is a directed graph whose arcs have capacities, with a source where flow enters and a sink where it leaves. [Ford and Fulkerson (1956)](#ref-FF1956a) took the problem from a rail network joining two cities through intermediate ones, and [Williamson (2019)](#ref-Wil2019a) lists uses that reach from the transport of goods and information to image segmentation in computer vision and to deciding when a baseball team has been eliminated from contention.

A flow assigns an amount to every arc, no greater than its capacity, and conserves flow at every node other than the source and the sink.

## Three problems

| Model | Question | Answer |
|---|---|---|
| **Max Flow** | How much can be sent from the source to the sink? | The value of a maximum flow and its arc flows |
| **Min Cost** | How can a given amount be sent at the least cost? | A flow meeting the demands at minimum total cost |
| **Min Cut** | Which arcs limit the flow? | A set of arcs of least capacity that separates source from sink |

The three are tied together. By the minimal cut theorem of [Ford and Fulkerson (1956)](#ref-FF1956a), the value of a maximum flow equals the capacity of a minimum cut, and a minimum-cost flow is a flow first of all, so it cannot send more than the maximum flow allows.

## Algorithms

[Williamson (2019)](#ref-Wil2019a) gives a unified view of combinatorial algorithms for these problems: augmenting paths, blocking flows, push-relabel and scaling for maximum flow; cycle cancelling, successive approximation and network simplex for minimum cost; and maximum adjacency orderings for global minimum cuts. Blocking flows go back to [Dinic (1970)](#ref-Din1970a), and the global cut by maximum adjacency search to [Stoer and Wagner (1997)](#ref-SW1997a), among others.

[Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) give a book-length treatment of theory, algorithms and applications, and [Cormen, Leiserson, Rivest and Stein (2022)](#ref-CLRS2022a) a chapter on maximum flow in their part on graph algorithms.

## The software

GraphsFlows.jl provides `maximum_flow` with a choice of algorithms, push-relabel by default, and `mincost_flow`, which solves a linear programme with an optimiser such as HiGHS. Networks are `DiGraph`s of Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), with capacities and costs held in matrices indexed by node pairs. The flows come back in the same form, a matrix whose entry for a pair of nodes is the flow on the arc between them.

## How the panel is organised

**N (nodes)** sets the number of nodes, with node 1 as source and node N as sink; **M (edges)** the number of random arcs drawn; and **cap (max capacity)** the largest capacity, drawn uniformly from 1 up to it.

The actions fall into five groups: Visualise draws the network with arc widths by use and the capacities against the flows; Diagnose lists the saturated arcs and checks conservation; Predict sweeps the capacities and the number of arcs; Compare sets directed against undirected and sparse against dense networks; and Interpret computes the share of capacity used and the gain from doubling a saturated arc.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-CLRS2022a"></a>Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). MIT Press.

<a id="ref-Din1970a"></a>Dinic, E. A. (1970). Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation. *Soviet Mathematics Doklady*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-SW1997a"></a>Stoer, M., & Wagner, F. (1997). A Simple Min-Cut Algorithm. *Journal of the ACM* 44(4), 585-591. [doi:10.1145/263867.263872](https://doi.org/10.1145/263867.263872)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
