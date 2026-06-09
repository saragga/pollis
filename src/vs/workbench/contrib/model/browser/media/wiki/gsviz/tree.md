# Tree Diagram

A **tree diagram** is a network that forms a hierarchy (or DAG), drawn with a tidy **layered** layout so parent-child structure reads top-down at a glance — org charts, taxonomies, dependency and file trees.

## Construction
```julia
using Graphs, GraphMakie, NetworkLayout, CairoMakie
g = binary_tree(4)                       # or any tree / DAG
graphplot(g; layout = Buchheim(), nlabels = string.(1:nv(g)))
```
The **Buchheim** algorithm produces a compact, non-overlapping tidy tree; for DAGs a layered (Sugiyama-style) layout works well.

## Reading It
- **Root** at the top; **depth** = distance from the root.
- **Children** hang below their parent; trace root → leaf to follow a path.
- Compare **subtree sizes** and spot **imbalance** or unusually deep branches.

## When to Use
Whenever each node has essentially one parent and you want the hierarchy itself to be the message. For general relationships (cycles, many-to-many), use a [Network Diagram](network.md) instead.

## See Also
- [Network Diagram](network.md) · [Decision Guide](decision-guide.md)
