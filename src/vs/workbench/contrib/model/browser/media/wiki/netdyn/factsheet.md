# Network Dynamics: Factsheet

A quick reference for **Network Dynamics**: the two models, the inputs, what each run prints, and what each action computes. NetworkDynamics.jl builds the oscillator network, OrdinaryDiffEq.jl integrates it, Graphs.jl generates the networks and their measures, and GLMakie draws the charts.

## The two models side by side

| | **Kuramoto** | **Cascade** |
|---|---|---|
| Network | `barabasi_albert(N, 3)` | `barabasi_albert(N, 3)` |
| Node state | Phase θ_i | Load, failed or not |
| Rule | dθ_i/dt = ω_i + K Σ_j A_ij sin(θ_j − θ_i) | A failed node's load is split equally among its intact neighbours |
| Randomness | Natural frequencies ω_i ~ Normal(0, σ²), initial phases uniform on [0, 2π] | Loads uniform on [0, 0.8], one random trigger |
| Solver | `Tsit5` over [0, T] | A queue of failed nodes, until it empties |
| Output | Order parameter r at time T | Number and fraction of failed nodes |

The coupling form is the constant-coupling network model reviewed by [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a), and the redistribution rule is the one of [Moreno, Gómez and Pacheco (2002)](#ref-MGP2002a).

## Inputs

| Input | Default | Used by | Meaning |
|---|---|---|---|
| **N (nodes)** | 100 | Both | Number of nodes of the network |
| **T (time)** | 50 | **Kuramoto** | Integration time |
| **K (coupling)** | 0.3 | **Kuramoto** | Coupling strength along each link |
| **sigma (freq.)** | 0.1 | **Kuramoto** | Standard deviation of the natural frequencies |

No random seed is set, so each run draws a new network, new frequencies or loads, and new initial phases or trigger.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Order Parameter** | r(t) over the integration, with the line r = 1 |
| Visualise | **Cascade Distribution** | A histogram of the failed fractions of 200 cascades |
| Diagnose | **Critical Coupling** | The algebraic connectivity λ₂ of the Laplacian, the code's estimate K_c = 2 std(ω)/λ₂, and the current K |
| Diagnose | **Cascade Size Distribution** | The mean, median and maximum failed fraction of 200 cascades |
| Predict | **Coupling Sweep** | The final r for K from 0 to 1.5 in steps of 0.05, on one network with one set of frequencies |
| Predict | **Load Threshold Sweep** | The mean failed fraction of 100 cascades for initial load ceilings from 0.5 to 1.0 |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Topology vs Sync** | λ₂ and the estimate K_c for `erdos_renyi(N, 6/N)`, `barabasi_albert(N, 3)` and `watts_strogatz(N, 6, 0.1)` |
| Compare | **Topology vs Cascade** | The mean failed fraction of 200 cascades on the random and the scale-free network |
| Interpret | **Synchronisation State** | r and K_c, and a state: synchronised for r > 0.85, partial for r > 0.4, incoherent otherwise |
| Interpret | **Cascade Resilience** | The failed fraction of a cascade started from each of the five nodes of highest betweenness |

## Packages and textbooks

NetworkDynamics.jl, by [Lindner, Lincoln, Drauschke, Koulen, Wurfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a), provides `EdgeModel`, `VertexModel`, `AntiSymmetric` and `Network`. Graphs.jl provides the generators, `neighbors`, `laplacian_matrix` and `betweenness_centrality`, and LinearAlgebra the eigenvalues.

[Barrat, Barthelemy and Vespignani (2008)](#ref-BBV2008a) and [Newman (2010)](#ref-New2010a) cover processes on networks. The original works are [Kuramoto (1984)](#ref-Kur1984a) for the oscillators, and [Motter and Lai (2002)](#ref-ML2002a) for cascades triggered by attacks.

## References

<a id="ref-BBV2008a"></a>Barrat, A., Barthelemy, M., & Vespignani, A. (2008). *Dynamical Processes on Complex Networks*. Cambridge University Press.

<a id="ref-Kur1984a"></a>Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Wurfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-ML2002a"></a>Motter, A. E., & Lai, Y.-C. (2002). Cascade-based Attacks on Complex Networks. *Physical Review E* 66(6), 065102. [doi:10.1103/PhysRevE.66.065102](https://doi.org/10.1103/PhysRevE.66.065102)

<a id="ref-MGP2002a"></a>Moreno, Y., Gómez, J. B., & Pacheco, A. F. (2002). Instability of Scale-Free Networks under Node-Breaking Avalanches. *Europhysics Letters* 58(4), 630-636. [doi:10.1209/epl/i2002-00442-2](https://doi.org/10.1209/epl/i2002-00442-2)

<a id="ref-New2010a"></a>Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press.

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kuramoto Oscillators](kuramoto.md) · [Cascade Failures](cascade.md)
