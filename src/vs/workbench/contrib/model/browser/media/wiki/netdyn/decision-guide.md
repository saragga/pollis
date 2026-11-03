# Network Dynamics: Decision Guide

Which model to choose for a question, which action answers it, and when another panel of Pollis is the better place to start.

## Choosing a model

| Question | Model | Why |
|---|---|---|
| When do coupled units fall into step? | **Kuramoto** | Phase oscillators with distributed frequencies and a measurable transition to synchrony |
| How far can one failure spread? | **Cascade** | Loads redistributed to neighbours, with failures that propagate |
| Do hubs help or hurt? | Both | Hubs lower the coupling needed to synchronise, and hubs as triggers can set off large cascades |

[Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) call the Kuramoto model the most successful approach to describing how coherent behaviour emerges in complex systems, ranging from social and physical to biological and technological ones. [Motter and Lai (2002)](#ref-ML2002a) frame cascades around networks such as the Internet and power grids, where loads can redistribute among the nodes.

## Choosing an action

| Question | Action |
|---|---|
| Has the population synchronised, and how quickly? | **Order Parameter** |
| At which coupling does synchronisation set in? | **Coupling Sweep**, **Critical Coupling** |
| Has K passed the onset of synchronisation? | **Synchronisation State** |
| Does the network model change the threshold? | **Topology vs Sync** |
| How large are cascades from random triggers? | **Cascade Distribution**, **Cascade Size Distribution** |
| At which load level do cascades become systemic? | **Load Threshold Sweep** |
| Do random and scale-free networks differ? | **Topology vs Cascade** |
| How dangerous is the failure of a hub? | **Cascade Resilience** |

## Setting the inputs

**K (coupling)** and **sigma (freq.)** act against each other: in the classic analysis the critical coupling is proportional to 1/g(0), so wider frequencies need stronger coupling, as the tooltip of **sigma (freq.)** says. Sweeping K with **Coupling Sweep** at the chosen sigma locates the transition before single runs are read.

**T (time)** must be long enough for r to settle, which **Order Parameter** shows, and **N (nodes)** trades the sharpness of the transition against the time to integrate the network and to compute the eigenvalues of its Laplacian.

## Beyond the panel's models

NetworkDynamics.jl, by [Lindner, Lincoln, Drauschke, Koulen, Würfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a), composes networks of heterogeneous vertex and edge models, including second-order oscillators, algebraic constraints, delays, noise and events. Its documentation includes a tutorial on dynamically induced cascading failures in a power grid, in which callbacks switch off overloaded lines while swing-equation nodes keep evolving, a cascade driven by continuous dynamics rather than by the panel's discrete rule.

[Barrat, Barthelemy and Vespignani (2008)](#ref-BBV2008a) treat many further processes on networks, such as random walks and search, epidemic spreading, opinion formation, and traffic and congestion, and [Newman (2010)](#ref-New2010a) covers processes on networks alongside their structure.

## When to use another panel

| Goal | Panel |
|---|---|
| Structure of the network itself: degrees, clustering, paths, centrality, percolation | **Network Analysis** |
| Contagion and epidemics spreading over contacts | **Epidemics on Networks** |
| Flows through capacitated networks, maximum flow and minimum cut | **Network Flows** |
| Shortest paths, robust paths and other optimisation on graphs | **Network and Graph Optimisation** |
| Systems of differential equations without a network | **Ordinary Differential Equations** |
| Individual agents with their own rules | **Agent-Based Models** |

## References

<a id="ref-BBV2008a"></a>Barrat, A., Barthelemy, M., & Vespignani, A. (2008). *Dynamical Processes on Complex Networks*. Cambridge University Press.

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Würfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
