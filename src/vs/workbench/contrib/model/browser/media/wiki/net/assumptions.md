# Network Analysis: Assumptions

What the panel's graphs and measures take for granted: simple undirected graphs, random realisations, sparse networks, and averages over the pairs that a path joins.

## Simple, undirected, unweighted graphs

All four models build undirected graphs without self-loops or multiple edges, and the measures treat every edge alike. [Barabasi (2016)](#ref-Bar2016a) notes that in an undirected network the adjacency matrix is symmetric, A_ij = A_ji, and that a node's degree is the sum of its row. Directed and weighted networks have their own versions of degree, distance and clustering, which the panel does not compute.

The **Attributed** model carries weights as edge data, but the measures of Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), use them only when asked to through a weight function.

## One realisation of a random model

Every generator is random. [Barabasi (2016)](#ref-Bar2016a) stresses that networks generated with the same parameters look different, and do not even have the same number of links. A printed value is therefore one draw from a distribution. **Seed** fixes the draw: with the same inputs, each run and each action generate the same graph, and another **Seed** gives another realisation.

Statements about a model, such as γ = 3 for preferential attachment or the threshold ⟨k⟩ = 1 for the giant component, concern its expected or large-N behaviour, and a single graph of 100 nodes shows them only approximately.

## Size

The theory of all three models is asymptotic, for large N. [Barabasi (2016)](#ref-Bar2016a) shows that the Poisson form of the random network's degree distribution requires N much larger than ⟨k⟩, and that for a small network the exact binomial form must be used. A power law needs two to three orders of magnitude between the smallest and largest degree to be documented convincingly, and the network size this requires grows quickly with the degree exponent.

The panel's default of 100 nodes keeps every action fast; larger **N (nodes)** makes the asymptotic properties clearer, as its tooltip notes, at a higher cost for path lengths and betweenness.

## Sparse networks

[Watts and Strogatz (1998)](#ref-WS1998a) work with n ≫ k ≫ ln(n) ≫ 1, sparse but connected, and [Humphries and Gurney (2008)](#ref-HG2008a) show that dense networks trivially have short paths and high clustering, so that small-world-ness falls as the edge density grows. **k (edges / neighbours)** and **p (probability)** should keep the mean degree much smaller than N for the models and the index to mean what they describe.

## Distances within components

`gdistances` returns `typemax` for vertices that cannot be reached, and the code averages only the distances between distinct vertices joined by a path. For a connected graph this is the average path length of [Barabasi (2016)](#ref-Bar2016a) over all pairs; for a disconnected one it is the average within components, and **Connectivity** shows which case applies. Removing a hub in **Hub Influence** can disconnect a graph, in which case the average after removal is over the remaining connected pairs.

## References

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-HG2008a"></a>Humphries, M. D., & Gurney, K. (2008). Network 'Small-World-Ness': A Quantitative Method for Determining Canonical Network Equivalence. *PLoS ONE* 3(4), e0002051. [doi:10.1371/journal.pone.0002051](https://doi.org/10.1371/journal.pone.0002051)

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
