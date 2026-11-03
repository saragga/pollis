# Network Dynamics: Assumptions

What the two models take for granted: a fixed scale-free network, oscillators described by a phase alone, a particular choice of coupling, loads that move only to neighbours, and results that hold for large networks.

## A fixed, unweighted network

Both models run on `barabasi_albert(N, 3)`, an undirected network in which every link counts the same, and the network does not change while the process runs. In the cascade, failed nodes stay in the graph but no longer take load. [Lindner, Lincoln, Drauschke, Koulen, Wurfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a) build NetworkDynamics.jl for heterogeneous components, with their own parameters and even their own laws on every vertex and edge, together with events, algebraic constraints, delays and noise; the panel's Kuramoto model uses identical edges and vertices that differ only in their natural frequency.

## Phase oscillators

The Kuramoto model, as [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) present it, describes each oscillator by its phase alone, interacting through the sine of the phase differences. Its classic analysis assumes a frequency density g(ω) that is unimodal and symmetric, centred at zero after a shift; the panel's normal distribution with mean zero meets that assumption, and **sigma (freq.)** sets its width.

The review also covers extensions that the panel does not include, such as noise, inertia and time delays in the coupling.

## The coupling normalisation

On a network, the strength of the coupling can be normalised in several ways, by N, by the mean degree or by the degree of each node, and [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) stress that the choice is not unique and matters for the onset of synchronisation. With λ/k_i, the normalisation by degree neutralises the heterogeneity that the network imposes on the field each node feels.

The panel's code adds K sin(θ_j − θ_i) for every neighbour, without normalisation, so the effective coupling of a node grows with its degree, as the review's mean-field form dθ_i/dt = ω_i + λ r k_i sin(ψ − θ_i) shows. **K (coupling)** therefore differs in scale from the λ of the complete graph, where each term is divided by N.

## Large networks

The critical coupling λ_c = 2/(π g(0)) and the square-root growth of r hold in the limit of infinitely many oscillators, and the network approximations are mean-field results. For finite networks, the review discusses finite-size scaling and the sample-to-sample fluctuations that come from different draws of the natural frequencies and of the links. The tooltip of **N (nodes)** notes that larger networks show smoother synchronisation transitions, at a higher computational cost.

## Loads that move to neighbours

The cascade assumes that a failed node passes its whole load, in equal shares, to its intact neighbours, and to no one else, as in the fibre-bundle rule of [Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a). Redistribution is instantaneous, with no flows on the links, and the total load is conserved except when a failed node has no intact neighbour.

The model of [Motter and Lai (2002)](#ref-ML2002a) rests on a different assumption: the load is the flow along shortest paths between all pairs, so a failure changes loads across the whole network, not only next to the failed node, and capacities are proportional to initial loads rather than equal.

## References

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Wurfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
