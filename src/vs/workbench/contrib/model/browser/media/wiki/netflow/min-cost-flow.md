# Network Flows: Minimum Cost Flow

The **Min Cost** model of the panel: sending a required amount from supply nodes to demand nodes through capacitated arcs at the least total cost, solved as a linear programme with GraphsFlows.jl and HiGHS.

## The problem

Each arc (i, j) has a capacity u(i, j) and a cost c(i, j) per unit of flow, and each node a supply or demand. [Williamson (2019)](#ref-Wil2019a) writes b(i) > 0 for a supply node and b(i) < 0 for a demand node, with total supply equal to total demand, and seeks a flow that meets the capacity constraints, leaves each node with net outflow b(i), and has the least cost Σ c(i, j) f(i, j).

Williamson notes that a cost per unit of flow models problems such as the transport of goods with per-unit transport costs. [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a), a treatment that Williamson calls magisterial, develop the theory, algorithms and applications of network flows at book length.

## Circulations and negative cycles

[Williamson (2019)](#ref-Wil2019a) reduces any minimum-cost flow problem to a minimum-cost circulation, adding a node joined to each supply and demand node by an arc whose bounds fix the supply or demand. In the residual graph of a circulation, a cycle of arcs with positive residual capacity and negative total cost can carry more flow around it and lower the cost; pushing flow around it cancels the cycle.

Williamson proves the analogue of the maximum flow optimality conditions. For a circulation f, the following are equivalent:

1. f has minimum cost;
2. the residual graph contains no negative-cost cycle;
3. there are node potentials p such that every arc with positive residual capacity has reduced cost c_p(i, j) = c(i, j) + p(i) − p(j) ≥ 0.

## Algorithms

[Williamson (2019)](#ref-Wil2019a) presents several combinatorial algorithms, among them cycle cancelling by minimum mean cycles, capacity scaling, successive approximation and network simplex. Successive shortest paths, which sends flow along shortest paths from supply to demand under reduced costs, appears there as a method for minimum-cost matching; Williamson notes that [Ahuja, Magnanti and Orlin (1993)](#ref-AMO1993a) attribute its use of Dijkstra's algorithm with reduced costs in each iteration to earlier observations.

Like the maximum flow, the problem is also a linear programme, and the panel's code solves it in that form.

## The panel's model

The network is built as in [Maximum Flow](max-flow.md), with a cost per unit drawn from 1 to 5 on each arc. `mincost_flow(g, demand, cap, cost, HiGHS.Optimizer)` of GraphsFlows.jl, according to its documentation, finds a flow that satisfies the node demands and the capacities while minimising the sum of cost times flow, by solving a linear optimisation problem with the given optimiser; it returns a sparse flow matrix.

GraphsFlows.jl's convention is that the demand is negative at sources and positive at sinks, so the code sets −10 at node 1 and 10 at node N. The run prints the total cost, the number of arcs that carry flow, and the largest flow on a single arc.

## Feasibility

Unlike the maximum flow problem, [Williamson (2019)](#ref-Wil2019a) notes, a minimum-cost circulation problem may have no feasible solution, and a single maximum flow computation decides whether one exists. With one source and one sink, sending 10 units from node 1 to node N requires a maximum flow of at least 10 between them, which by the theorem of [Ford and Fulkerson (1956)](#ref-FF1956a) means a minimum cut of capacity at least 10. When the random network cannot carry 10 units, the linear programme has no feasible solution, as the code's comment warns.

**Max Flow** with the same inputs shows how much the network can carry; a larger **M (edges)** or **cap (max capacity)** makes a feasible problem more likely.

## References

<a id="ref-AMO1993a"></a>Ahuja, R. K., Magnanti, T. L., & Orlin, J. B. (1993). *Network Flows: Theory, Algorithms, and Applications*. Prentice Hall.

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cut](min-cut.md)
