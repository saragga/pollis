# Network Flows: Interpretation

How to read what the panel prints: the value of the flow and its bounds, the bottleneck arcs and their sensitivity, the sweeps and comparisons, the share of capacity used, and the minimum cost.

## The value of the flow

The maximum flow is the most the network can carry from node 1 to node N in a steady state. Every s–t cut bounds it, as [Williamson (2019)](#ref-Wil2019a) shows: |f| ≤ u(δ⁺(S)) for every set S containing the source but not the sink. Two cuts give quick bounds: S = {1}, the total capacity of the arcs leaving the source, and S = all nodes but N, the total capacity of the arcs entering the sink.

A flow far smaller than both points to a bottleneck inside the network, which **Min Cut** locates. By [Ford and Fulkerson (1956)](#ref-FF1956a), the tightest of all such bounds is exactly the maximum flow.

## Bottlenecks

**Bottleneck Edges** lists every saturated arc. The arcs of a minimum cut are among them, and the cut found by **Min Cut** names the set of arcs whose combined capacity equals the maximum flow.

**Bottleneck Sensitivity** doubles the capacity of each saturated arc in turn and prints the gain in maximum flow. The theorem explains the pattern. Raising an arc's capacity changes only the cuts that contain that arc; if some minimum cut does not contain it, that cut's capacity is unchanged and still bounds the flow, so the gain is zero. A positive gain therefore marks an arc that lies in every minimum cut, and the gain is at most the arc's original capacity, the amount by which the cut through it grew.

## The capacity and density sweeps

**Capacity Sweep** multiplies every capacity by 1 to 5 on one network. Multiplying all capacities by a factor multiplies the capacity of every cut by the same factor, so by the minimal cut theorem the maximum flow scales by that factor too, and the points lie on a straight line through the origin.

**Density Sweep** draws a new network for each M from 10 to 100. Adding arcs to a fixed network can only raise the capacities of its cuts, but each point of the sweep is a different random network, so neighbouring points of the curve can differ in either direction.

## Comparisons

**Directed vs Undirected** sets every random link usable in both directions with the same capacity, the construction that [Williamson (2019)](#ref-Wil2019a) uses for undirected networks. The undirected network contains every arc of the directed one, so every cut has at least the same capacity and the maximum flow is at least as large; the printed ratio measures what two-way links add.

**Sparse vs Dense** compares M = N with M = 4N. With few arcs, the source or the sink may have little or no capacity around it and the flow is small or zero.

## Utilisation

**Network Utilisation** divides the total flow on all arcs, counting each arc once, by the total capacity of the network. The total flow on arcs is not the value of the flow: one unit sent along a path of five arcs counts five times. A maximum flow is limited by its minimum cut, so arcs away from the cut can keep spare capacity, and arcs off every route carry nothing.

## The minimum cost

**Min Cost** prints Σ c(i, j) f(i, j) for the flow of 10 units. [Williamson (2019)](#ref-Wil2019a) characterises its optimality: no cycle of arcs with spare residual capacity has negative total cost, or equivalently there are node potentials under which every such arc has a non-negative reduced cost. The largest flow on a single arc shows how concentrated the flow is.

## References

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
