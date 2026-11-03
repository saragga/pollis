# Network Flows: Assumptions

What the three models take for granted: a directed network with one source and one sink, a steady flow of a single commodity, capacities on arcs, integer data, and costs that grow linearly with flow.

## A directed network with one source and one sink

Every arc of the panel's network carries flow in one direction only, from the first node of the pair drawn to the second. Node 1 is the source and node N the sink, and [Ford and Fulkerson (1956)](#ref-FF1956a) note that a network with many sources and sinks, with shipment allowed from any source to any sink, reduces to this case.

An undirected link that can carry flow either way is modelled by two opposite arcs, each with the link's capacity, the construction that [Williamson (2019)](#ref-Wil2019a) uses to turn an undirected cut problem into a directed one; **Directed vs Undirected** builds the second network in that way.

## A steady flow

Harris's formulation, as [Ford and Fulkerson (1956)](#ref-FF1956a) quote it, assumes a steady state: flow passes through the network at a constant rate, and time does not appear. [Williamson (2019)](#ref-Wil2019a) treats flows over time, in which arcs take time to traverse, as a separate application of minimum-cost flow.

Conservation is exact: whatever enters a node other than the source or the sink leaves it. Networks in which flow is gained or lost along an arc, which Williamson calls generalised flows, are outside the panel's models.

## One commodity

All flow is of one kind, and any unit can serve any demand. When several commodities, each with its own source and sink, share the capacities of the arcs, the problem becomes a multicommodity flow, a different problem that [Williamson (2019)](#ref-Wil2019a) studies in its own chapter. The panel's three models each move a single commodity, so their flows can be added and split freely along any route that has spare capacity.

## Capacities on arcs

Limits sit on the arcs alone, with every node able to pass any amount. The flow on an arc may be anything from zero to its capacity, and an arc drawn twice by the generator has a single, larger capacity, the sum of its two draws.

[Williamson (2019)](#ref-Wil2019a) also allows lower bounds on the flow of an arc in the minimum-cost circulation problem, which `mincost_flow` of GraphsFlows.jl takes through its `edge_demand` keyword; the panel's code does not set it.

## Integer data

Capacities are drawn from the integers 1 to **cap (max capacity)**, costs from 1 to 5, and the demand is 10 units. With integer capacities, [Williamson (2019)](#ref-Wil2019a) shows that an integral maximum flow exists and that augmenting path algorithms find one, so the maximum of **Max Flow** can always be reached in whole units. The bounds that count augmentations, such as at most mU augmentations for m arcs and largest capacity U, rely on integer capacities too.

## Linear costs

In **Min Cost**, each unit of flow on an arc costs the same amount, so the cost of an arc is its unit cost times its flow and the total is the sum Σ c(i, j) f(i, j), as in the problem of [Williamson (2019)](#ref-Wil2019a). Fixed charges for opening an arc, or costs that rise faster than the flow, are not part of the model.

## References

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
