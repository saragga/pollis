# Network Dynamics: Interpretation

How to read what the panel prints: the order parameter and the state of synchronisation, the coupling sweep, the estimated critical coupling, and the sizes of cascades from random triggers and from hubs.

## Reading r

The order parameter of [Kuramoto (1984)](#ref-Kur1984a) is the length of the centroid of the phases on the unit circle: close to 0 when the phases are spread around the circle, close to 1 when the oscillators move as one cluster. Between the two, [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) describe a partially synchronised state in which the oscillators with natural frequencies small enough are locked to the mean field and the others drift.

**Synchronisation State** prints r, averaged over the second half of the run, with K and the mean-field estimate K_c, and says whether K exceeds K_c, which the review gives as the coupling for the onset of synchronisation. The curve of **Order Parameter** shows how r was reached.

## The coupling sweep

**Coupling Sweep** plots r, averaged over the second half of each run, for K from 0 to 1.5. For the complete graph, the review gives r = 0 up to the critical coupling and a growth like (λ − λ_c)^(1/2) after it, the signature of a second-order transition. For a finite network, the finite-size scaling of [Diagnostics](diagnostics.md) applies, and r at the transition depends on N.

Wider natural frequencies move the transition to stronger coupling: in the classic result λ_c = 2/(π g(0)), and for a normal density g(0) falls as the standard deviation **sigma (freq.)** grows.

## The estimated critical coupling

**Critical Coupling** computes the first two moments of the degrees, ⟨k⟩ and ⟨k²⟩, and the mean-field estimate of [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a), K_c = (2/(π g(0))) ⟨k⟩/⟨k²⟩, in which 2/(π g(0)) is the critical coupling of Kuramoto for the complete graph. The code evaluates g(0) for the normal density of **sigma (freq.)** and prints the current K beside the estimate.

The review also presents the frequency approximation, (2/(π g(0)))/σ_max, with σ_max the largest eigenvalue of the adjacency matrix. It notes that this approximation gives accurate results where other approaches fail, and that both predict a threshold that vanishes for large scale-free networks with γ ≤ 3, while simulations suggest a finite one.

## Topology and synchronisation

**Topology vs Sync** prints ⟨k⟩, ⟨k²⟩ and the mean-field K_c for a random network, a scale-free network and a small-world network with mean degree close to 6. In the mean-field result, the more heterogeneous the degrees, the smaller the coupling needed, so in that approximation the hubs of the scale-free network lower its threshold compared with a random network of the same mean degree.

For small-world networks, the review reports that a small fraction of shortcuts improves synchronisation dramatically compared with the regular lattice, and that the gain saturates for intermediate rewiring probabilities.

## Cascade sizes

The fraction of failed nodes measures the damage. **Topology vs Cascade** compares its mean on a random and a scale-free network. [Motter and Lai (2002)](#ref-ML2002a) find that under random breakdown the largest component of a scale-free network stays close to its original size on average, since the trigger is probably a node of small load, and that networks with homogeneous degrees, such as Erdős–Rényi networks, are relatively resistant to cascades even under attack.

**Load Threshold Sweep** raises the ceiling of the initial loads from 0.5 to 1.0. [Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a) find, as the load on a scale-free network increases, an abrupt transition at which the giant component suddenly falls close to zero, and a steep rise of the mean failed fraction over a narrow range of ceilings is the panel's view of such a transition.

## Cascades from hubs

**Cascade Resilience** prints, for each of the five nodes of highest betweenness, the fraction of nodes that fail when the cascade starts there. [Motter and Lai (2002)](#ref-ML2002a) show that an attack on a single key node can trigger a large-scale cascade in a heterogeneous network, and that the damage is larger when the target is chosen by load than by degree.

Fractions much larger than the mean of **Cascade Size Distribution** show the contrast between attacks and random failures; similar fractions show that, for these loads and this network, the starting point matters little.

## References

<a id="ref-Kur1984a"></a>Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
