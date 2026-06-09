# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Relationships among many entities | **Network diagram** ([network](network.md)) | Nodes + edges show connectivity, hubs, clusters |
| Parent-child / hierarchical structure | **Tree diagram** ([tree](tree.md)) | Layered layout makes hierarchy legible |
| A value across geographic areas | **Choropleth** ([choropleth](choropleth.md)) | Colour-on-map encodes regional quantities |

## Decision Flow
1. **Is the data geographic** (tied to places/regions)? → choropleth (or a bubble map for point data).
2. **Is it a strict hierarchy** (single parent per node)? → tree diagram.
3. **Is it a general network** of relationships? → network diagram.

## Rules of Thumb
- **Fix the layout seed** so network/tree figures are reproducible; remember node positions are arbitrary.
- **Normalise choropleth values** (rates / per-capita) so the map shows the variable, not population or area.
- **State the colour classification** on a choropleth (quantile vs equal-interval changes the pattern).
- Beyond a few hundred nodes, **filter or aggregate** rather than drawing every node.
