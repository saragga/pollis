# Diagnostics

## Network
- **Hubs** — nodes with many edges (high degree); size/colour by degree to surface them.
- **Bridges** — nodes or edges whose removal disconnects parts; high **betweenness centrality** flags them.
- **Clusters / communities** — densely connected groups that a force-directed layout pulls together.
- **Isolates / components** — disconnected nodes or sub-graphs (`connected_components`).

## Tree
- **Depth** — long branches indicate deep hierarchy.
- **Fan-out** — nodes with many children dominate a layer.
- **Imbalance** — lopsided subtrees.

## Choropleth
- **Spatial autocorrelation** — neighbouring regions sharing similar colour (clustering).
- **Outlier regions** — a lone bright/dark area against its neighbours.
- **Binning artefacts** — apparent patterns that change when you change the colour-scale classes.

## Quick Checklist

| Plot | Cue | Implication |
|---|---|---|
| Network | High-degree node | Hub |
| Network | High betweenness | Bridge / bottleneck |
| Tree | Lopsided subtree | Imbalanced hierarchy |
| Choropleth | Colour clustering | Spatial autocorrelation |
