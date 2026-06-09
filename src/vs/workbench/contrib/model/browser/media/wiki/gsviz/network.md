# Network Diagram

A **network diagram** draws a graph: **nodes** (entities) joined by **edges** (relationships), positioned by a layout algorithm so connected nodes sit close together. It is the canonical way to *see* relational structure.

## Construction
```julia
using Graphs, GraphMakie, CairoMakie
g = erdos_renyi(14, 0.18)        # or build with add_edge!
deg = degree(g)
graphplot(g; node_size = 8 .+ 2 .* deg, node_color = deg,
    nlabels = string.(1:nv(g)))
```
`graphplot` uses a force-directed layout by default; pass `layout = Stress()`, `Spring()`, etc. from `NetworkLayout`.

## Reading It
- **Hubs** — large/high-degree nodes with many edges.
- **Bridges** — nodes joining otherwise separate clusters (high betweenness).
- **Communities** — dense clusters the layout pulls together.
- **Direction** — for a `SimpleDiGraph`, set `arrow_show = true`.

## Cautions
Node **positions are arbitrary** — only connectivity is meaningful. Fix the RNG seed for reproducible layouts, and filter/aggregate beyond a few hundred nodes.

## See Also
- [Tree Diagram](tree.md) · [Decision Guide](decision-guide.md)
