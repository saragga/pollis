# Network Analysis: Scale-Free

The **Scale-Free** model of the panel: a network that grows one node at a time, each new node linking preferentially to nodes that already have many links. The result is a degree distribution with a power-law tail, and a few large hubs.

## Power laws

[Barabasi (2016)](#ref-Bar2016a) defines a scale-free network as one whose degree distribution follows a power law,

p_k ∼ k^(−γ)

with γ the degree exponent. Taking logarithms gives log p_k ∼ −γ log k, a straight line of slope −γ on a log-log plot. Compared with a Poisson distribution of the same mean, a power law has more nodes of small degree, fewer near the average, and far more of very high degree.

[Barabasi and Albert (1999)](#ref-BA1999a) report power-law tails for the collaboration graph of film actors, the World Wide Web and the citations of scientific papers, with exponents between 2.1 and 4, a feature that, they note, the random graph and small-world models of the time did not predict.

## Growth and preferential attachment

[Barabasi and Albert (1999)](#ref-BA1999a) identify two features of real networks absent from earlier models. Networks grow, by the continuous addition of new nodes, and new nodes attach preferentially, with a higher probability of linking to a node that already has many connections.

The model of [Barabasi (2016)](#ref-Bar2016a) starts with m_0 nodes and, at each step, adds a node with m ≤ m_0 links. Each link connects to an existing node i with probability

Π(k_i) = k_i / Σ_j k_j

so a node of degree four is twice as likely to be chosen as one of degree two. The mechanism produces a rich-gets-richer process in which a few early nodes turn into hubs.

## The panel's generator

`barabasi_albert(N, k)` in Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), grows a graph of N vertices from an initial graph of k vertices, isolated by default. Each new vertex attaches with k edges to k different vertices already present, by preferential attachment. **k (edges / neighbours)** is therefore m in the notation of Barabasi, and the tooltip notes a mean degree of about 2k.

## The degree exponent

The continuum theory of [Barabasi (2016)](#ref-Bar2016a) gives each node a degree that grows with time as

k_i(t) = m (t / t_i)^(1/2)

where t_i is the time it joined: older nodes have higher degrees. The resulting degree distribution has exponent γ = 3, and the exact form is

p_k = 2m(m + 1) / (k (k + 1) (k + 2))

Barabasi notes three consequences: for large k this reduces to k^(−3); the exponent does not depend on m; and the distribution is stationary, the same for networks of any size or age. **Degree Distribution Fit** estimates γ from the panel's graph; its comment recalls the value 3.

## Both ingredients are needed

[Barabasi (2016)](#ref-Bar2016a) examines two limiting cases. With growth but uniform attachment, degrees grow only logarithmically in time and the degree distribution is exponential, with no hubs. With preferential attachment but a fixed number of nodes, the distribution is not stationary and the network eventually becomes a complete graph. Neither reproduces a power law, so growth and preferential attachment are needed together.

## Hubs and distances

In a scale-free network the largest degree grows as a power of the size,

k_max = k_min N^(1/(γ − 1))

so hubs can be orders of magnitude larger than typical nodes, while in a random network the largest degree grows only logarithmically. For the model with m > 1, Barabasi gives the diameter as growing like ln N / ln ln N, more slowly than ln N, so distances are shorter than in a random graph of the same size. The clustering coefficient of the model decreases with size as (ln N)² / N, more slowly than the 1/N of a random network.

**Centrality Profile** and **Hub Influence** look for the hubs through betweenness.

## Robust and fragile

[Barabasi (2016)](#ref-Bar2016a) shows that scale-free networks withstand the random removal of nodes, which mostly strikes the many small nodes, but break apart quickly when the hubs are removed in decreasing order of degree. In a random network, attacks and random failures have more similar effects, since there are no hubs to target. **Hub Influence** removes the hub with the highest betweenness and prints the change in average path length.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
