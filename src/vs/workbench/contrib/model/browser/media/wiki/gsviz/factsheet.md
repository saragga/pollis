# Graph and Spatial Plots — Factsheet

**Graph and spatial plots** show structure that lives in *connections* and *locations* rather than in numeric tables: who links to whom, what contains what, and how a quantity varies across a map.

| | |
|---|---|
| **Purpose** | Visualise networks, hierarchies, and geographic data |
| **Input** | A graph (nodes + edges), a tree/hierarchy, or regions with values |
| **Core packages** | [Graphs.jl](https://github.com/JuliaGraphs/Graphs.jl), [GraphMakie.jl](https://github.com/MakieOrg/GraphMakie.jl), [GeoMakie.jl](https://github.com/MakieOrg/GeoMakie.jl), [Makie.jl](https://github.com/MakieOrg/Makie.jl) |
| **Plot types** | Network diagram, tree diagram, choropleth |
| **Typical use** | Relationships, dependency/org structure, regional statistics |

## When to Use
- The data is a set of **entities and relationships** (a network).
- The data is **hierarchical** — parent/child, a taxonomy, a file tree.
- A value is attached to **geographic areas** and you want a map.

## What It Is Not
These are not for plain numeric distributions or two-variable relationships — use the Core Statistical and Distribution Comparison webviews for that.
