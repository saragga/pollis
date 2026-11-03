# Network Dynamics: Cascade Failures

The **Cascade** model of the panel: nodes that carry a load and fail when it exceeds their capacity, passing their load to their neighbours, so that one failure can set off an avalanche through the network.

## Failures that spread

[Motter and Lai (2002)](#ref-ML2002a) observe that in many networks, such as power grids and the Internet, a flow of some quantity loads the nodes, and the removal of a node changes the balance of flows and redistributes its load. A node whose load rises past its capacity fails in turn, and each failure leads to a new redistribution, a step-by-step process they call a cascading failure. A cascade may stop after a few steps or shut down a considerable fraction of the network.

Static robustness, the effect of removing nodes on connectivity, is a different question: [Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a) note that the random removal of nodes, akin to percolation, never leads to cascades, while a threshold rule with load transfer does, which makes it a more stringent test of strength.

## The fibre-bundle rule on a network

[Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a) carry the fibre-bundle model over to networks. Each node of a Barabási–Albert network bears a load σ and has a random security threshold. A node whose load surpasses its threshold fails, and its load is equally transferred to the non-failed nodes directly linked to it, which may make them fail, until every intact node bears a load lower than its threshold.

Raising the common load step by step, they find an abrupt transition: the giant component stays large for small loads and suddenly falls close to zero at a critical point. Close to it, the nodes of highest degree are the most affected, so the hubs fail as a consequence of the rules, without being targeted.

## The panel's rule

The panel's code follows the same redistribution rule, with the randomness in the loads rather than the thresholds:

| Element | Value |
|---|---|
| Network | `barabasi_albert(N, 3)` |
| Initial loads | Uniform on [0, 0.8] |
| Capacities | 1 for every node |
| Trigger | One node chosen at random fails |
| Redistribution | A failed node's load is split equally among its neighbours that have not failed |
| Failure | A node fails when its load exceeds its capacity |

Since every initial load is less than the capacity, no node fails on its own, and the cascade starts with the trigger. Failed nodes enter a queue and shed their load in turn; a failed node with no intact neighbour sheds nothing. The run prints the number and the fraction of nodes that failed.

## Load as betweenness

[Motter and Lai (2002)](#ref-ML2002a) define load differently. One unit of a quantity is exchanged between every pair of nodes along the shortest path, so the load of a node is the number of shortest paths that pass through it, and its capacity is

C_j = (1 + α) L_j

with L_j its initial load and α ≥ 0 a tolerance parameter. The damage is the relative size of the largest component after the cascade, G = N′/N.

Their result is that global cascades occur when the network has a highly heterogeneous distribution of loads and the removed node is among those of higher load. A random trigger is probably one of the many nodes of small load; an intentional attack on a node of very large load can bring down a large part of a scale-free network, while homogeneous networks resist both.

## Attacks on hubs

**Cascade Resilience** starts a cascade from each of the five nodes of highest betweenness, a measure that, like the load of [Motter and Lai (2002)](#ref-ML2002a), counts the shortest paths through a node, and prints the fraction of nodes that fail. The trigger is given a load equal to its capacity plus one, so it sheds more than a randomly chosen trigger would.

Comparing those fractions with the cascades from random triggers in **Cascade Size Distribution** sets attacks against random failures, the contrast that Motter and Lai draw.

## References

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md)
