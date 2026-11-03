# Network Analysis: Decision Guide

Which model to choose for a question, which action answers it, and when another panel of Pollis is the better place to start.

## Choosing a model

| Question | Model | Why |
|---|---|---|
| Could a property arise by chance alone? | **Erdos-Renyi** | The reference in which links carry no structure |
| Where do hubs and heavy-tailed degrees come from? | **Scale-Free** | Growth with preferential attachment |
| How can a clustered network have short paths? | **Small-World** | A lattice with a few random short cuts |
| How are attributes stored and queried on a graph? | **Attributed** | Vertex and edge data in a `MetaGraph` |

[Barabasi (2016)](#ref-Bar2016a) uses the random network as the benchmark against which the properties of real networks are judged, and treats the scale-free and small-world models as additions that explain what the benchmark lacks: hubs for the first, clustering for the second.

## Choosing an action

| Question | Action |
|---|---|
| What do the degrees look like? | **Degree Distribution** |
| Is the graph in one piece? | **Connectivity** |
| Which nodes lie on the most shortest paths? | **Centrality Profile** |
| At which link probability does a giant component appear? | **Percolation Threshold** |
| What degree exponent does preferential attachment give? | **Degree Distribution Fit** |
| How do clustering and path length differ between models? | **ER vs BA vs WS** |
| How unequal are the degrees in each model? | **Degree Variance** |
| How small-world is the rewired lattice? | **Small-World Index** |
| How much does one hub hold the paths together? | **Hub Influence** |

**Adjacency Heatmap** gives a picture of the whole matrix, useful for a small N, where each row and column of the heat map can be read as a node. Each action calls functions of Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), which the [Factsheet](factsheet.md) lists.

## Setting the inputs

**k (edges / neighbours)** is the number of edges a new node brings in **Scale-Free**, as in the model of [Barabasi and Albert (1999)](#ref-BA1999a), and half the degree of the ring lattice in **Small-World**, which [Watts and Strogatz (1998)](#ref-WS1998a) write as k nearest neighbours in all. **p (probability)** is the link probability of the random network and the rewiring probability of the small-world graph, so the same value plays a different part in each model.

For a small world, Watts and Strogatz find the regime of high clustering and short paths at intermediate p, between the lattice at p = 0 and the random graph at p = 1, and [Humphries and Gurney (2008)](#ref-HG2008a) find the index greatest at intermediate rewiring. For a random network, [Barabasi (2016)](#ref-Bar2016a) gives p = 1/N for the appearance of a giant component and p = ln N / N for full connection.

## When to use another panel

| Goal | Panel |
|---|---|
| Synchronisation of oscillators or cascades of failures on a network | **Network Dynamics** |
| Maximum flow, minimum-cost flow or minimum cut in a capacitated network | **Network Flows** |
| Shortest paths on weighted graphs, robust paths, assignment and other graph optimisation | **Network and Graph Optimisation** |

**Network Analysis** describes structure: degrees, components, distances, clustering and centrality of graphs drawn from the classic models. [Newman (2010)](#ref-New2010a) covers processes on networks as well as their structure, and **Network Dynamics** takes up the processes.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-HG2008a"></a>Humphries, M. D., & Gurney, K. (2008). Network 'Small-World-Ness': A Quantitative Method for Determining Canonical Network Equivalence. *PLoS ONE* 3(4), e0002051. [doi:10.1371/journal.pone.0002051](https://doi.org/10.1371/journal.pone.0002051)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
