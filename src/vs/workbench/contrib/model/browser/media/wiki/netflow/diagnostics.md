# Network Flows: Diagnostics

How to check a computed flow: whether it respects capacities and conservation, whether the cut certifies it, why it may be zero, and why a minimum-cost problem may have no solution.

## Capacities

A flow must never exceed the capacity of an arc. **Capacity vs Flow** draws both for every arc with capacity, and every flow bar should reach at most its capacity bar; arcs whose bars match are saturated, and arcs with no flow bar are unused.

The flow matrix returned by GraphsFlows.jl is antisymmetric, F[v, u] = −F[u, v], so the reverse entry of a used arc is negative. Following [Williamson (2019)](#ref-Wil2019a), the reverse arc has capacity zero, and its negative flow stays within that bound; a reader of the matrix keeps the positive entries to see the flow actually sent.

## Conservation

**Flow Conservation** sums, for every node other than the source and the sink, the positive entries of the flow matrix into the node and out of it, and prints whether they agree. [Williamson (2019)](#ref-Wil2019a) requires the net flow out of every such node to be zero, which under skew symmetry is the same as the sum of the flows on its outgoing arcs being zero.

A node with in = out = 0 is simply not on any route of the flow.

## The cut as a certificate

**Min Cut** prints the capacity of the cut it finds next to the value of the flow. By the theorem of [Ford and Fulkerson (1956)](#ref-FF1956a), the two agree exactly when the flow is maximum and the cut minimum, and [Williamson (2019)](#ref-Wil2019a) shows that the set of nodes reachable from the source in the residual graph always gives such a cut. Equal values are therefore a check on both computations at once.

The number of cut arcs is printed next to the number of saturated arcs: the first can never exceed the second, since every arc of a minimum cut is saturated.

## A flow of zero

With N = 20 nodes and M = 40 random pairs, the sink may not be reachable from the source at all, or node 1 may have no outgoing arc. The maximum flow is then zero, the cut from the residual search contains no arcs, and its capacity is zero, consistent with the theorem.

**Density Sweep** and **Sparse vs Dense** show how the flow grows as arcs are added. Since every action draws its own network, a zero flow in one action says nothing about the network of another.

## An infeasible minimum-cost problem

**Min Cost** asks for 10 units from node 1 to node N. When the maximum flow between them is less than 10, no flow meets the demand and the linear programme is infeasible, as the comment in the code warns. [Williamson (2019)](#ref-Wil2019a) notes that, unlike the maximum flow problem, the minimum-cost circulation problem can have no feasible solution, and that one maximum flow computation tells whether it has one.

Running **Max Flow** with the same inputs shows the amount the network can carry; raising **M (edges)** or **cap (max capacity)** gives the network more arcs or more capacity to carry the demand.

## References

<a id="ref-FF1956a"></a>Ford, L. R., & Fulkerson, D. R. (1956). Maximal Flow Through a Network. *Canadian Journal of Mathematics* 8, 399-404. [doi:10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)

<a id="ref-Wil2019a"></a>Williamson, D. P. (2019). *Network Flow Algorithms*. Cambridge University Press. [doi:10.1017/9781316888568](https://doi.org/10.1017/9781316888568)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Maximum Flow](max-flow.md) · [Minimum Cost Flow](min-cost-flow.md) · [Minimum Cut](min-cut.md)
