# Network Analysis: Small-World

The **Small-World** model of the panel: a ring lattice whose edges are rewired at random with probability p. For a broad range of p the network keeps the high clustering of the lattice while gaining the short distances of a random graph.

## Between order and randomness

[Watts and Strogatz (1998)](#ref-WS1998a) note that the connection topology of networked systems is usually assumed to be either completely regular or completely random, while many biological, technological and social networks lie in between. They start from a ring lattice of n vertices, each joined to its k nearest neighbours, and rewire each edge at random with probability p:

| p | Network |
|---|---|
| 0 | The original ring lattice, highly clustered, with distances that grow linearly with n |
| Intermediate | A small-world network: highly clustered, yet with short paths |
| 1 | A random network, poorly clustered, with distances that grow logarithmically with n |

The rewiring keeps the number of vertices and edges unchanged. Their requirement n ≫ k ≫ ln(n) ≫ 1 keeps the graph sparse, but not so sparse that it risks becoming disconnected.

## Path length and clustering

[Watts and Strogatz (1998)](#ref-WS1998a) measure two quantities. The characteristic path length L(p) is the number of edges in the shortest path between two vertices, averaged over all pairs. The clustering coefficient C(p) is the average over vertices of C_v, the fraction of the k_v(k_v − 1)/2 possible edges between the neighbours of v that are present.

For the lattice, L ≈ n/2k and C ≈ 3/4; for the random graph, L ≈ ln(n)/ln(k) and C ≈ k/n. The two limits might suggest that high clustering always comes with long paths, and low clustering with short ones.

## Short cuts

On the contrary, [Watts and Strogatz (1998)](#ref-WS1998a) find a broad interval of p in which L(p) is almost as small as for the random graph while C(p) remains much larger. A few rewired edges become short cuts that contract the distance not only between the two vertices they join, but between their neighbourhoods, and the neighbourhoods of those. Removing an edge from a clustered neighbourhood has at most a linear effect on C, so the transition to a small world is almost undetectable at the local level.

In their figure, for n = 1000 and k = 10, the drop in L(p) and the plateau of C(p) are plotted on a logarithmic axis of p. [Barabasi (2016)](#ref-Bar2016a) reads from it that short path lengths and high clustering coexist for p between about 0.001 and 0.1.

## The panel's generator

`watts_strogatz(N, 2k, p)` in Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), builds a ring with div(2k, 2) = k neighbours on each side, so an expected degree of 2k, as the code's comment and the tooltip of **k (edges / neighbours)** state. Its documentation describes the rewiring: each edge (s, t) of the lattice, taken hop length by hop length, is kept with probability 1 − p, and otherwise replaced by an edge from s to a vertex chosen uniformly from the whole graph, excluding s and its neighbours.

**p (probability)** is the rewiring probability, with 0 giving the ring lattice and 1 a random graph, as its tooltip says.

## What the model leaves out

[Barabasi (2016)](#ref-Bar2016a) notes that, as an extension of the random network model, the Watts-Strogatz model has a bounded, Poisson-like degree distribution, so the hubs seen in many real networks are absent from it, and its local clustering does not depend on the degree. [Barabasi and Albert (1999)](#ref-BA1999a) make the same observation about the degree distribution: for finite p it stays peaked around the coordination number of the lattice, though it gets broader.

**Degree Distribution** shows degrees concentrated near 2k, and **Degree Variance** compares their spread with the other models.

## Measuring small-world-ness

[Humphries and Gurney (2008)](#ref-HG2008a) turn the comparison with a random graph into a single number, the ratio of the relative clustering to the relative path length, and call a network small-world when it exceeds 1. **Small-World Index** computes it, and the code of the model prints it at the end, after the clustering and path length of both graphs. [Interpretation](interpretation.md) explains how to read it.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-HG2008a"></a>Humphries, M. D., & Gurney, K. (2008). Network 'Small-World-Ness': A Quantitative Method for Determining Canonical Network Equivalence. *PLoS ONE* 3(4), e0002051. [doi:10.1371/journal.pone.0002051](https://doi.org/10.1371/journal.pone.0002051)

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Attributed Graphs](metagraphs.md)
