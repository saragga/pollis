# Network Dynamics: Overview

**Network Dynamics** simulates two processes on scale-free networks: the synchronisation of coupled phase oscillators, with NetworkDynamics.jl, and cascades of overload failures, with Graphs.jl. In each, the outcome depends on the structure of the network as much as on the rules of the process.

## Dynamics on networks

[Lindner, Lincoln, Drauschke, Koulen, Wurfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a) describe systems made of local components that interact through a network: producers and consumers of energy linked by power lines, neurons linked by synapses, cities linked by travellers who carry a disease. The structure that couples the components is neither regular nor completely random, and small changes in it may have large effects on the dynamics of the whole.

[Barrat, Barthelemy and Vespignani (2008)](#ref-BBV2008a) give a unified account of how complex patterns of connectivity shape dynamical processes, from resilience and synchronisation to epidemics, traffic and breakdown, and [Newman (2010)](#ref-New2010a) covers processes on networks alongside their structure.

## Two processes

| Model | Process | State of a node | Outcome |
|---|---|---|---|
| **Kuramoto** | Coupled phase oscillators | A phase on the circle | The order parameter r, from 0 for incoherence to 1 for locking |
| **Cascade** | Load redistribution after failures | A load, and whether the node has failed | The fraction of nodes that fail |

The Kuramoto model is the one introduced by [Kuramoto (1984)](#ref-Kur1984a), in the network form reviewed by [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a). The cascade spreads a failed node's load equally among its intact neighbours, the rule that [Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a) take from the fibre-bundle model, and its attacks on hubs follow the question asked by [Motter and Lai (2002)](#ref-ML2002a): can the failure of a single key node bring down a large part of the network?

## The role of structure

Both processes are sensitive to heterogeneous degrees. For oscillators, the mean-field approximation in the review rescales the critical coupling by ⟨k⟩/⟨k²⟩, so hubs make synchronisation easier. For cascades, Motter and Lai find that networks with a heterogeneous distribution of loads are particularly vulnerable to an attack on a node of high load, while homogeneous networks resist it.

**Topology vs Sync** and **Topology vs Cascade** compare the processes on different network models with the same number of nodes.

## How the panel is organised

**N (nodes)** sets the size of the network, and **T (time)**, **K (coupling)** and **sigma (freq.)** the integration time, the coupling strength and the spread of the natural frequencies of the Kuramoto model. The cascade uses only **N (nodes)**.

The actions fall into five groups: Visualise plots r over time and the distribution of cascade sizes; Diagnose estimates a critical coupling and summarises cascade sizes; Predict sweeps the coupling and the initial loads; Compare sets network models side by side; and Interpret classifies the state of synchronisation and tests cascades started from hubs.

## References

<a id="ref-BBV2008a"></a>Barrat, A., Barthelemy, M., & Vespignani, A. (2008). *Dynamical Processes on Complex Networks*. Cambridge University Press.

<a id="ref-Kur1984a"></a>Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Wurfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
