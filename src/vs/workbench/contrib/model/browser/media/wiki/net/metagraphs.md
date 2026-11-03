# Network Analysis: Attributed Graphs

The **Attributed** model of the panel: a graph whose vertices and edges carry data, built with MetaGraphsNext.jl and queried by attribute. The structure is a small random graph; the point of the model is the metadata.

## Why attach data to a graph?

The models of the panel describe structure alone: who is linked to whom. Real networks come with attributes, such as the state of an individual in an epidemic, the capacity of a link, or the name of a city. [Barabasi (2016)](#ref-Bar2016a) represents a weighted network by an adjacency matrix whose entries are the weights of the links, A_ij = w_ij, rather than ones, and attaching data of any type generalises the idea.

The MetaGraphsNext.jl documentation describes the package as a type-stable replacement for MetaGraphs.jl, which attaches vertex and edge metadata to a graph on which the full Graphs.jl ecosystem can then be used. Graphs.jl is by [Fairbanks, Besançon, Schölly, Hoffimann, Eubank and Karpinski (2021)](#ref-FBSHE...2021a).

## The panel's graph

The code builds an empty `MetaGraph` on an undirected `Graph()`, with three types fixed at construction:

| Part | Type | Content |
|---|---|---|
| Label | `Int` | The name of each vertex, 1 to N |
| Vertex data | `NamedTuple{(:weight, :state), Tuple{Float64, Symbol}}` | A random weight in [0, 1) and a state drawn from `:S`, `:I` and `:R` |
| Edge data | `Float64` | A random weight in [0, 1) |

It then draws round(N p) pairs of vertices at random and links each pair of distinct vertices, so the graph has at most that many edges. The code then counts the vertices in state `:I`, which its comments call infected, and prints the counts of vertices, edges and infected vertices.

## A dictionary-like interface

The MetaGraphsNext.jl documentation describes access through labels, as in a dictionary:

| Code | Effect |
|---|---|
| `mg[i] = data` | Adds a vertex labelled i, or replaces its data if it exists |
| `mg[u, v] = data` | Adds an edge between two existing labels, or replaces its data |
| `mg[v]` | Returns the data of vertex v |
| `labels(mg)` | Iterates over the vertex labels |
| `haskey(mg, v)` | Tests whether a label exists |

Setting an edge between labels that do not exist throws an error, so vertices come first. The panel's query

`[v for v in labels(mg) if mg[v].state == :I]`

selects vertices by an attribute, and the same pattern selects edges through `edge_labels`.

## Labels and codes

The documentation distinguishes the label of a vertex from its code, the integer that Graphs.jl algorithms use. Without deletions, codes follow the order of insertion; `code_for` and `label_for` convert between them. Methods inherited from Graphs.jl, such as `nv`, `ne` or `degree`, refer to vertices by codes.

Codes are reassigned after `rem_vertex!` to stay contiguous, while labels do not change, so the documentation recommends converting systematically to and from labels. It discourages integer labels in general, to avoid confusion with codes, but notes that using the codes as labels may be reasonable when labels are not needed; the panel's labels 1 to N equal the codes as long as no vertex is removed.

## Weights from data

A `MetaGraph` can turn edge data into weights through a `weight_function` and a `default_weight`, which the documentation illustrates with distances between cities. `Graphs.weights` then returns a weight matrix built from the edge data, so algorithms of Graphs.jl that take weights can read the metadata. [Newman (2010)](#ref-New2010a) covers the measures and metrics used to describe networks, and the models used to generate them.

## References

<a id="ref-Bar2016a"></a>Barabasi, A.-L. (2016). *Network Science*. Cambridge University Press.

<a id="ref-FBSHE...2021a"></a>Fairbanks, J., Besançon, M., Schölly, S., Hoffimann, J., Eubank, N., & Karpinski, S. (2021). JuliaGraphs/Graphs.jl: an optimized graphs package for the Julia programming language. [github.com/JuliaGraphs/Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Erdos-Renyi](erdos-renyi.md) · [Scale-Free](scale-free.md) · [Small-World](small-world.md)
