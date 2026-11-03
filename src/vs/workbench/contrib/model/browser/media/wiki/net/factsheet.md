# Network Analysis: Factsheet

A quick reference for **Network Analysis**: the four models, the inputs, what each run prints, and what each action computes. Graphs.jl generates and measures the graphs, MetaGraphsNext.jl carries the metadata of the attributed graph, and GLMakie draws the charts.

## The four models side by side

| Model | Generator | Parameters | Mean degree |
|---|---|---|---|
| **Erdos-Renyi** | `erdos_renyi(N, p)` | Each pair linked with probability p | p (N − 1) |
| **Scale-Free** | `barabasi_albert(N, k)` | k edges per new node, by preferential attachment | About 2k |
| **Small-World** | `watts_strogatz(N, 2k, p)` | k neighbours on each side, each edge rewired with probability p | 2k |
| **Attributed** | `MetaGraph` | N vertices with data, round(N p) random pairs | At most 2 round(N p) / N |

The mean degree of the random network is p(N − 1), as [Barabasi (2016)](#ref-Bar2016a) derives; the other two follow from the generators' documentation in Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a).

## Inputs

| Input | Default | Used by | Meaning |
|---|---|---|---|
| **N (nodes)** | 100 | All | Number of vertices |
| **k (edges / neighbours)** | 3 | **Scale-Free**, **Small-World**, and the comparisons | Edges per new node, or neighbours on each side of the ring |
| **p (probability)** | 0.05 | **Erdos-Renyi**, **Small-World**, **Attributed** | Link probability, or rewiring probability |

No random seed is set, so each run, and each action, draws a new graph.

## What a run prints

| Model | Output |
|---|---|
| **Erdos-Renyi** | Nodes, edges, mean degree, clustering, average path |
| **Scale-Free** | Maximum degree, mean degree, clustering, the five nodes of highest betweenness and their centralities |
| **Small-World** | Clustering and average path of the graph and of a random graph with the same mean degree, and the small-world index |
| **Attributed** | Vertices, edges, infected vertices out of N |

Clustering is Graphs.jl's `global_clustering_coefficient`. The average path is the mean of the shortest-path distances over all ordered pairs of distinct vertices joined by a path.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Degree Distribution** | A 20-bin histogram of the degrees of a new graph of the chosen model; the random network for **Attributed** |
| Visualise | **Adjacency Heatmap** | The adjacency matrix of a random network with N and p |
| Diagnose | **Connectivity** | Whether a random network is connected, its number of components, the largest and the smallest |
| Diagnose | **Centrality Profile** | The five nodes of highest betweenness in a random network, with their betweenness and closeness |
| Predict | **Percolation Threshold** | The fraction of nodes in the largest component of random networks, for p from 0.01 to 0.2 |
| Predict | **Degree Distribution Fit** | An estimate of the power-law exponent of a scale-free graph |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **ER vs BA vs WS** | Clustering and average path of the three models at mean degree 2k |
| Compare | **Degree Variance** | Variance and maximum of the degrees for the three models |
| Interpret | **Small-World Index** | The index σ of a small-world graph against a random one |
| Interpret | **Hub Influence** | The average path of a scale-free graph before and after removing its node of highest betweenness |

## Packages and textbooks

Graphs.jl provides the generators, `degree`, `global_clustering_coefficient`, `gdistances`, `connected_components`, `betweenness_centrality` and `closeness_centrality`. MetaGraphsNext.jl builds the attributed graph, StatsBase counts the degrees for the fit, and GLMakie draws the histogram and the heat map.

[Barabasi (2016)](#ref-Bar2016a) covers random, scale-free and small-world networks and their robustness, and [Newman (2010)](#ref-New2010a) the measures, models and processes of network science. The original papers are [Erdos and Renyi (1960)](#ref-ER1960a), [Watts and Strogatz (1998)](#ref-WS1998a) and [Barabasi and Albert (1999)](#ref-BA1999a), and the small-world index is that of [Humphries and Gurney (2008)](#ref-HG2008a).

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-ER1960a"></a>Erdos, P., & Renyi, A. (1960). On the Evolution of Random Graphs. *Publications of the Mathematical Institute of the Hungarian Academy of Sciences*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-HG2008a"></a>Humphries, M. D., & Gurney, K. (2008). Network 'Small-World-Ness': A Quantitative Method for Determining Canonical Network Equivalence. *PLoS ONE* 3(4), e0002051. [doi:10.1371/journal.pone.0002051](https://doi.org/10.1371/journal.pone.0002051)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
