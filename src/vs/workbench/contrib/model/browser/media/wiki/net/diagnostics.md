# Network Analysis: Diagnostics

How to check a generated graph before reading its measures: whether it is connected, how its components are sized, how spread its degrees are, and what scale its centralities have.

## Connectivity

**Connectivity** reports `is_connected`, the number of components from `connected_components`, and the sizes of the largest and the smallest, for a random network with the panel's N and p. [Barabasi (2016)](#ref-Bar2016a) places a random network in one of four regimes by its mean degree:

| Mean degree | Regime | Structure |
|---|---|---|
| ⟨k⟩ < 1 | Subcritical | Many tiny components |
| ⟨k⟩ = 1 | Critical | Components of very different sizes |
| 1 < ⟨k⟩ < ln N | Supercritical | A giant component with small components beside it |
| ⟨k⟩ > ln N | Connected | A single component |

Barabasi derives the expected number of isolated nodes as I_N ≈ N e^(−Np). At the defaults, N = 100 and p = 0.05, the mean degree p(N − 1) is 4.95 against ln 100 ≈ 4.6, and I_N ≈ 100 e^(−5) ≈ 0.7, so a draw may be connected or may leave a node or two outside the giant component.

## Component sizes

A largest component close to N with a smallest of size 1 is the supercritical picture: a giant component and isolated nodes. In that regime, [Barabasi (2016)](#ref-Bar2016a) notes, the small components are trees, while the giant component contains loops and cycles. Several components of comparable size point instead to the subcritical or critical regime, where no component holds a finite share of the nodes.

When the graph is not connected, distances and closeness refer to pairs within components, as [Assumptions](assumptions.md) describes, so **Connectivity** is worth running before reading the average path or **Centrality Profile**.

## Spread of the degrees

**Degree Variance** prints the variance and the largest degree for the three models. [Barabasi (2016)](#ref-Bar2016a) gives the standard deviation of a Poisson degree distribution as σ_k = ⟨k⟩^(1/2), always smaller than ⟨k⟩ when ⟨k⟩ > 1, so the nodes of a random network have comparable degrees and ⟨k⟩ serves as its scale. For a power law with γ < 3 the second moment ⟨k²⟩ diverges as N grows, and the degree of a randomly chosen node can be far from the mean.

A variance close to the mean degree is the mark of the random network; a much larger variance with a high maximum is the mark of hubs. [Watts and Strogatz (1998)](#ref-WS1998a) describe a lattice in which every vertex starts with the same degree, so the small-world graph starts from zero variance and gains spread only through rewiring.

## Largest degree

[Barabasi (2016)](#ref-Bar2016a) calls the expected maximum degree the natural cutoff. With an exponential degree distribution it differs little from the smallest degree, since it grows with ln N, and with a Poisson distribution it grows even more slowly; in a scale-free network it grows as a power of N, as k_max ~ k_min N^(1/(γ − 1)). The maximum printed by **Scale-Free** and **Degree Variance** is therefore expected to be larger for the scale-free graph than for the random one.

## Centrality values

**Centrality Profile** prints the five nodes of highest betweenness in a random network, with their betweenness and closeness. Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), defines betweenness as

bc(v) = (1/𝒩) Σ_(s ≠ t ≠ v) σ_st(v) / σ_st

where σ_st counts the shortest paths from s to t and σ_st(v) those passing through v, normalised by default by 𝒩 = (|V| − 1)(|V| − 2)/2, the number of possible distinct paths between pairs of an undirected graph. Closeness is normalised by |δ_n| / (|V| − 1), where δ_n is the set of vertices that n can reach.

## References

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
