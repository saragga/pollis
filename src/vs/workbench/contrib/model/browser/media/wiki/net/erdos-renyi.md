# Network Analysis: Erdos-Renyi

The **Erdos-Renyi** model of the panel: N nodes, each pair linked independently with the same probability p. The simplest random network, and the reference against which the other models are read.

## Two definitions

[Barabasi (2016)](#ref-Bar2016a) distinguishes two versions of the random network:

| Model | Fixed | Introduced by |
|---|---|---|
| G(N, L) | N labelled nodes joined by L randomly placed links | Erdos and Renyi, in their series of papers |
| G(N, p) | Each pair of nodes linked with probability p | Gilbert |

[Erdos and Renyi (1960)](#ref-ER1960a), on the evolution of random graphs, is one of that series. Barabasi works with G(N, p), in which most quantities are easier to calculate, and calls the result the Erdos-Renyi network in honour of the two mathematicians.

The panel uses the same version. `erdos_renyi(N, p)` in Graphs.jl, by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a), adds an edge between each pair of vertices with probability p, while `erdos_renyi(N, ne)` with an integer second argument fixes the number of edges instead.

## Links and degrees

Since each of the N(N − 1)/2 pairs is linked with probability p, [Barabasi (2016)](#ref-Bar2016a) derives the expected number of links and the average degree:

⟨L⟩ = p N(N − 1) / 2

⟨k⟩ = p (N − 1)

The number of links varies from one realisation to the next, and so does every printed quantity. The degree of a node follows the binomial distribution

p_k = C(N − 1, k) p^k (1 − p)^(N − 1 − k)

which, for a sparse network with ⟨k⟩ much smaller than N, is well approximated by the Poisson distribution p_k = e^(−⟨k⟩) ⟨k⟩^k / k!. Its peak lies at ⟨k⟩, and its standard deviation is ⟨k⟩^(1/2), so most nodes have degrees close to the average.

## No hubs

Because of the k! in the Poisson form, Barabasi shows that the chance of a node with a degree far greater than ⟨k⟩ falls faster than exponentially. In a random network hubs are effectively absent, and the largest degree grows with N only logarithmically or more slowly.

**Degree Distribution** shows a histogram concentrated around the mean, which **Degree Variance** quantifies; for a Poisson distribution the variance equals ⟨k⟩. [Scale-Free](scale-free.md) describes networks where the opposite holds.

## Four regimes

As p grows, [Barabasi (2016)](#ref-Bar2016a) describes four regimes of the random network:

| Regime | Condition | Structure |
|---|---|---|
| Subcritical | ⟨k⟩ < 1, p < 1/N | Many tiny components, mostly trees |
| Critical point | ⟨k⟩ = 1 | The largest component still holds a vanishing fraction of nodes |
| Supercritical | ⟨k⟩ > 1 | A giant component with a finite fraction of nodes, beside small trees |
| Connected | ⟨k⟩ > ln N, p > ln N / N | All nodes in one component |

The critical probability is p_c = 1/(N − 1), approximately 1/N. Near the critical point the giant component holds a fraction of nodes proportional to ⟨k⟩ − 1, and the fraction S in general solves S = 1 − e^(−⟨k⟩ S).

**Percolation Threshold** sweeps p from 0.01 to 0.2 and prints the fraction of nodes in the largest component, and **Connectivity** tests whether the graph is connected.

## Short distances

A node in a random network has about ⟨k⟩ nodes at distance one, ⟨k⟩² at distance two, and so on, so the number reached grows exponentially with the distance. [Barabasi (2016)](#ref-Bar2016a) concludes that the average distance follows

⟨d⟩ ≈ ln N / ln ⟨k⟩

which is the small-world property: distances grow with the logarithm of N, rather than with N or a power of it, as in a lattice.

## Low clustering

Two neighbours of a node are linked with probability p, like any other pair, so the local clustering coefficient of a random network is

C_i = p = ⟨k⟩ / N

the same for every degree, and falling as 1/N for a fixed average degree. [Barabasi (2016)](#ref-Bar2016a) observes that real networks have far higher clustering than a random network with the same N and L, and that their clustering falls with the degree. The **Small-World** model of [Watts and Strogatz (1998)](#ref-WS1998a) was proposed to combine high clustering with short distances.

## References

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-ER1960a"></a>Erdos, P., & Renyi, A. (1960). On the Evolution of Random Graphs. *Publications of the Mathematical Institute of the Hungarian Academy of Sciences*.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-WS1998a"></a>Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of Small-World Networks. *Nature* 393(6684), 440-442. [doi:10.1038/30918](https://doi.org/10.1038/30918)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Scale-Free](scale-free.md) · [Small-World](small-world.md) · [Attributed Graphs](metagraphs.md)
