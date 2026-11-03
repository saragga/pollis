# Network Analysis: Interpretation

How to read the numbers the panel prints: clustering, the comparison of the three models, the small-world index, the percolation sweep, the fitted exponent and the effect of removing a hub.

## Two clustering coefficients

[Barabasi (2016)](#ref-Bar2016a) defines two measures of clustering for a whole network. The average clustering coefficient ⟨C⟩ is the mean of the local coefficients C_i over all nodes; the global clustering coefficient is

C_Δ = 3 × number of triangles / number of connected triplets

and the factor 3 counts each triangle once for each of its three triplets. The two are not equivalent: in a double star, ⟨C⟩ tends to 1 while C_Δ falls like 1/N. [Humphries and Gurney (2008)](#ref-HG2008a) find them often in good agreement, but differing by an order of magnitude for some networks.

The panel prints both: `global_clustering_coefficient` of Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), and the mean of `local_clustering_coefficient`, which returns the local coefficients node by node. The second is the clustering of [Watts and Strogatz (1998)](#ref-WS1998a), the average of the local coefficients.

## Reading the comparison

**ER vs BA vs WS** prints clustering and average path for the three models at the same N and mean degree 2k. The expected pattern follows from the models:

| Model | Clustering | Average path |
|---|---|---|
| Random network | Low, about ⟨k⟩/N | Short, growing like ln N |
| Small-world, intermediate p | Much higher than the random network's | Close to the random network's |
| Scale-free | Falling as N grows, more slowly than the random network's | Shorter than the random network's |

[Watts and Strogatz (1998)](#ref-WS1998a) give the random graph's clustering and path, and the small-world combination of the two; [Barabasi (2016)](#ref-Bar2016a) gives the scale-free model's diameter, growing like ln N / ln ln N, and its clustering, falling like (ln N)²/N against the 1/N of a random network.

## The small-world index

[Humphries and Gurney (2008)](#ref-HG2008a) define

γ_g = C / C_rand,  λ_g = L / L_rand,  S = γ_g / λ_g

where C and L are the clustering and mean shortest path of the graph, and C_rand and L_rand those of an Erdős–Rényi graph with the same numbers of nodes and edges. A small world has a similar path length, λ_g ≈ 1, and greater clustering, γ_g > 1, than the random graph, and the authors deem a network small-world when S > 1, an assertion that can be tested statistically.

**Small-World Index** and the **Small-World** model print σ in that form, with the global clustering coefficient, which Humphries and Gurney mainly consider, and with `erdos_renyi(nv(g), ne(g))`, a random graph with the same numbers of nodes and edges, as reference. In the Watts–Strogatz model, Humphries and Gurney show that S has a unique maximum at intermediate rewiring, the maximum trade-off between high clustering and short path length, and that it falls as the edge density rises.

Across the real networks they examine, Humphries and Gurney find a linear relation between S and the size n, and show analytically that the Watts–Strogatz models assigned to those networks scale in the same way. Linearity is not inevitable, they add, and S is not maximal for an arbitrary network of a given size.

## The percolation sweep

**Percolation Threshold** prints, for p from 0.01 to 0.2, the fraction of nodes in the largest component of a random network. [Barabasi (2016)](#ref-Bar2016a) shows that the fraction S = N_G / N in the giant component solves

S = 1 − e^(−⟨k⟩S)

which has only the solution S = 0 for ⟨k⟩ ≤ 1 and a positive one for ⟨k⟩ > 1, for example S ≈ 0.583 at ⟨k⟩ = 1.5. The critical probability is p_c = 1/N, or 0.01 at the default N = 100, which is where the sweep starts. At the critical point the largest component grows as N^(2/3), still a vanishing share of a large network.

## The fitted exponent

**Degree Distribution Fit** estimates γ by the maximum-likelihood formula that [Barabasi (2016)](#ref-Bar2016a) gives for a discrete degree distribution,

γ = 1 + n [Σᵢ ln(kᵢ / (K_min − 1/2))]⁻¹

where the sum runs over the n nodes of degree kᵢ ≥ K_min. Barabasi chooses K_min by scanning its values for the smallest Kolmogorov–Smirnov distance between the data and the fitted distribution; the panel takes K_min = **k (edges / neighbours)**. [Barabasi and Albert (1999)](#ref-BA1999a) found γ = 2.9 ± 0.1 in their simulations and γ = 3 from a mean-field calculation, independent of the number of edges each new node brings.

Barabasi adds that a quick estimate from a straight line fitted to p_k on a log-log plot can be affected by systematic biases. He plots degree distributions with logarithmic binning, with bins that widen with the degree so that each holds enough observations, or as a cumulative distribution; both extend the scaling region into the high degrees, where each degree is typically carried by a single node.

## The effect of a hub

**Hub Influence** removes the hub, the node of highest degree, from a scale-free graph and prints the average path before and after. [Barabasi (2016)](#ref-Bar2016a) notes that the hubs shorten paths by linking many small-degree nodes, and that the removal of a single hub is unlikely to fragment a network, as the remaining hubs still hold it together. Under an attack that removes hubs one after another in decreasing order of degree, by contrast, the removal of a small fraction of the hubs is enough to break a scale-free network into tiny clusters.

## References

<a id="ref-BA1999a"></a>Barabasi, A.-L., & Albert, R. (1999). Emergence of Scaling in Random Networks. *Science* 286(5439), 509-512. [doi:10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-HG2008a"></a>Humphries, M. D., & Gurney, K. (2008). Network 'Small-World-Ness': A Quantitative Method for Determining Canonical Network Equivalence. *PLoS ONE* 3(4), e0002051. [doi:10.1371/journal.pone.0002051](https://doi.org/10.1371/journal.pone.0002051)

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
