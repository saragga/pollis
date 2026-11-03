# Network Dynamics: Diagnostics

How to check a run before reading its result: whether the oscillators have settled, how much the outcome depends on the draw, and how widely cascade sizes spread.

## Has r settled?

The Kuramoto run prints r averaged over the second half of the integration, from T/2 to T, and the review likewise defines r as an average over a suitably long time interval from a starting time tₛ. **Order Parameter** plots r(t) over the whole integration, which shows whether r has reached a plateau or is still rising, and whether it fluctuates around a level. A curve still climbing at the end calls for a longer **T (time)**, as its tooltip suggests for checking whether synchronisation persists.

[Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) study the relaxation towards synchrony. For identical natural frequencies, linearising around the synchronised state gives perturbations that decay at a rate set by the second smallest eigenvalue σ₂ of a Laplacian of the network, with relaxation time τ_r = −1/Re σ₂, so the structure of the network sets how long synchronisation takes.

## Draws and fluctuations

Every run draws a new network, new natural frequencies and new initial phases. The review notes that for finite networks the results vary between realisations, through the random natural frequencies and through the random links, and that both sources of disorder matter for estimating the transition.

Repeating a run with the same inputs shows how much r depends on the draw. **Coupling Sweep** keeps one network and one set of frequencies for every K and draws new initial phases for each, so its curve reflects a single realisation of the network and the frequencies.

## Size of the network

For a finite number of oscillators, [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) write the order parameter near the transition in the finite-size scaling form

R = N^(−β/ν̄) F[(λ − λ_c) N^(1/ν̄)]

with F a scaling function, so that at λ_c the order parameter of a finite network still depends on N. The review reports β = 1/2 and ν̄ = 5/2 for the complete graph and small-world networks. Comparing **Coupling Sweep** at two values of **N (nodes)** shows how the transition changes with size.

## Spread of cascade sizes

A single cascade depends on the trigger and the draw of loads, so the panel repeats it. **Cascade Distribution** draws the histogram of the failed fraction over 200 cascades, and **Cascade Size Distribution** prints their mean, median and maximum. A mean far from the median signals a skewed distribution, with most cascades small and a few large.

[Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a) measure the distribution of avalanche sizes at the critical load: with strongly disordered thresholds it follows a power law, and as the thresholds become more homogeneous it turns into a function sharply peaked around a large mean value.

## The network itself

Each failed node passes its load only to its neighbours, so the degrees of the network shape every cascade. **Topology vs Cascade** and **Topology vs Sync** repeat the processes on a random network and, for synchronisation, a small-world network, which separates the effect of the process from that of the structure. Graphs.jl's `laplacian_matrix` and `betweenness_centrality` give the measures used by **Critical Coupling** and **Cascade Resilience**; NetworkDynamics.jl, by [Lindner, Lincoln, Drauschke, Koulen, Würfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a), assembles the oscillator network that **Order Parameter** integrates.

## References

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Würfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
