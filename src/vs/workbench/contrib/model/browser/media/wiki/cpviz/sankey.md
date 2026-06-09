# Sankey Diagram

A **Sankey diagram** shows quantities flowing between nodes as bands whose **width is proportional to the flow**. Quantity is conserved as it moves from sources through intermediate nodes to sinks.

## Construction
Use [SankeyMakie.jl](https://github.com/MakieOrg/SankeyMakie.jl) with a Makie backend:

```julia
using SankeyMakie, CairoMakie
# edges as (source, target, weight); node indices are 1-based
connections = [(1, 3, 8.0), (2, 3, 4.0), (3, 4, 7.0), (3, 5, 5.0)]
names = ["Coal", "Gas", "Grid", "Homes", "Industry"]
sankey(connections; nodelabels = names)
```

## Reading It
- **Band width = quantity.** Follow a band to see where a flow goes and how it splits or merges.
- At each node, total **inflow should equal outflow** (conservation); a mismatch signals a data error.
- Reorder nodes to **minimise crossings** and keep the diagram legible.

## Common Uses
Energy balances, budget allocations, web/marketing funnels, cohort transitions, material flows.

## See Also
- [Decision Guide](decision-guide.md) · [Waterfall Plot](waterfall.md)
