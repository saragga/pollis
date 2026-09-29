# Assumptions

## Input Form
- **Network** — a `Graphs.jl` graph: a set of nodes and edges (directed or undirected, optionally weighted).
- **Tree** — a graph that is acyclic and connected (or a DAG); the layout assumes a root and parent-child direction.
- **Choropleth** — geographic **polygons** (regions) each paired with a numeric value, in a known coordinate reference system.

## Layout Is Not Data
A network/tree **layout** (force-directed, stress, Buchheim) is a *visual* choice — node positions carry no inherent meaning. Two runs of a force-directed layout can look different; only the connectivity is real. Fix the RNG seed for reproducible figures.

## Choropleth Pitfalls
- **Area ≠ importance.** Large regions dominate the eye regardless of their value; small dense regions vanish. Consider normalising (rates, per-capita) and pairing with a cartogram or bubble map.
- **Region and data must align** on a common key, and polygons must use a sensible **map projection** — an unprojected lat/long map distorts area badly.

## Scale
Network and tree diagrams stay legible to roughly a few hundred nodes; beyond that, filter, aggregate, or switch to summary metrics. Choropleths need enough regions to show a pattern but readable boundaries.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
