# Network Analysis: Overview

**Network Analysis** generates the three classic models of network science, the random network, the scale-free network and the small-world network, measures their structure with Graphs.jl, and shows how to attach data to a graph with MetaGraphsNext.jl.

## What is a network?

A network, in the language of [Barabasi (2016)](#ref-Bar2016a), is a set of nodes joined by links: proteins and their interactions, people and their acquaintances, routers and their cables. The same mathematics describes all of them, and a handful of measures characterise their structure:

| Measure | Meaning |
|---|---|
| Degree k_i | Number of links of node i |
| Degree distribution p_k | Probability that a randomly chosen node has degree k |
| Distance d_ij | Number of links in the shortest path from i to j |
| Clustering coefficient | Share of a node's neighbours that are linked to each other |
| Component | A set of nodes joined to each other by paths, to which no other node can be added |

[Newman (2010)](#ref-New2010a) gives a full introduction, from these measures to network models and processes on networks.

## Why models?

Models ask which features of real networks could have emerged by chance. [Barabasi (2016)](#ref-Bar2016a) puts it this way: if a property is present in the random network model, randomness can account for it; if it is absent, it may be a signature of order that needs a deeper explanation. In that sense the random network serves as a reference, even though Barabasi knows of no real network that it describes accurately.

Each of the panel's models adds one mechanism to that reference: preferential attachment in **Scale-Free**, rewiring of a lattice in **Small-World**.

## Three models

| Model | Origin | Mechanism | Signature |
|---|---|---|---|
| **Erdos-Renyi** | [Erdos and Renyi (1960)](#ref-ER1960a) | Links placed at random between pairs of nodes | Poisson degrees, a giant component for ⟨k⟩ > 1 |
| **Scale-Free** | [Barabasi and Albert (1999)](#ref-BA1999a) | Growth and preferential attachment | Power-law degrees with γ = 3, hubs |
| **Small-World** | [Watts and Strogatz (1998)](#ref-WS1998a) | A ring lattice with edges rewired at random | High clustering with short paths |

The fourth model, **Attributed**, is not a model of structure but of data: vertices and edges that carry attributes, queried like a dictionary.

## What the comparison shows

Barabasi summarises how real networks compare with the random model. Their average path lengths are reasonably approximated by the random network's ln N / ln ⟨k⟩, so short distances can arise by chance. Their degree distributions, with many more highly connected nodes, and their clustering, much higher and falling with the degree, are not. **ER vs BA vs WS** and **Degree Variance** make these comparisons on the panel's graphs, at the same N and mean degree.

## How the panel is organised

**N (nodes)**, **k (edges / neighbours)** and **p (probability)** set the size, the links per new node or the neighbours on each side, and the link or rewiring probability. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), generates the graphs and computes their measures, and GLMakie draws the charts.

The actions fall into five groups: Visualise draws the degree distribution and the adjacency matrix; Diagnose checks connectivity and centrality; Predict sweeps the percolation threshold and fits the degree exponent; Compare sets the three models side by side; and Interpret computes the small-world index and the effect of removing a hub.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-ER1960a"></a>Erdos, P., & Renyi, A. (1960). On the Evolution of Random Graphs. *Publications of the Mathematical Institute of the Hungarian Academy of Sciences*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
