# Network Dynamics: Kuramoto Oscillators

The **Kuramoto** model of the panel: phase oscillators with different natural frequencies, coupled along the links of a scale-free network, and the order parameter that measures how far they synchronise.

## The model

[Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) review the model that [Kuramoto (1984)](#ref-Kur1984a) built as an analytically tractable simplification of earlier work on coupled oscillators. In its original form, N oscillators with phases θ_i interact with all the others:

dθ_i/dt = ω_i + (λ/N) Σ_j sin(θ_j − θ_i)

where λ is the coupling strength and the natural frequencies ω_i are drawn from a density g(ω), unimodal and symmetric about zero. Each oscillator runs at its own frequency and is pulled towards the phases of the rest. The review describes synchronisation as a threshold process: if the spread of the frequencies is large compared with the coupling, the population behaves incoherently, and if the coupling is strong enough to overcome it, the population locks into synchrony.

## The order parameter

Kuramoto measured synchrony by the complex order parameter

R e^(iψ) = (1/N) Σ_j e^(iθ_j)

the centroid of the N points e^(iθ_j) on the unit circle. Phases spread uniformly over [0, 2π] give R ≈ 0, and oscillators rotating together in one cluster give R ≈ 1. Multiplying by e^(−iθ_i) rewrites the model as dθ_i/dt = ω_i + λR sin(ψ − θ_i), so each oscillator feels the population only through R and ψ, and a small rise in R strengthens the effective coupling and recruits more oscillators.

## Locked and drifting oscillators

In the limit of infinitely many oscillators, the review shows that in the partially synchronised state, 0 < R < 1, the oscillators split into two groups. Those with |ω| ≤ λR are entrained by the mean field and rotate with the common phase; those with |ω| > λR drift incoherently.

Letting R tend to zero in the self-consistent equation for R gives the critical coupling for the onset of synchronisation, first obtained by Kuramoto:

λ_c = 2 / (π g(0))

Near the transition, R grows like (λ − λ_c)^(1/2), in analogy with a second-order phase transition. A narrower frequency density, with a larger g(0), synchronises at weaker coupling.

## On a network

On a network the coupling runs along the links, with adjacency matrix A. [Rodrigues, Peron, Ji and Kurths (2016)](#ref-RPJK2016a) note that the normalisation of the coupling is not unique, since different network models scale differently with N, and that many authors adopt a constant coupling,

dθ_i/dt = ω_i + λ Σ_j A_ij sin(θ_j − θ_i)

which they find more appropriate for comparing the synchronisation of different networks. The panel's code uses that form, with **K (coupling)** as λ, natural frequencies drawn from a normal distribution with mean zero and standard deviation **sigma (freq.)**, and a Barabási–Albert network of **N (nodes)** nodes in which each new node brings 3 links.

## Critical coupling on networks

Unlike the complete graph, the model on a heterogeneous network has no exact solution, and the review presents two approximations:

| Approximation | Critical coupling |
|---|---|
| Frequency approximation | λ_c = (2 / π g(0)) / σ_max, with σ_max the largest eigenvalue of A |
| Mean-field approximation | λ_c = (2 / π g(0)) ⟨k⟩ / ⟨k²⟩ |

The second says that the more heterogeneous the degrees, the weaker the coupling needed, which highlights the role of hubs. For scale-free networks with γ ≤ 3 both predict a critical coupling that vanishes as N grows, while simulations suggest a constant value; the review describes the source of the disagreement as an open problem.

## The implementation

NetworkDynamics.jl, by [Lindner, Lincoln, Drauschke, Koulen, Würfel, Plietzsch and Hellmann (2021)](#ref-LLDKW...2021a), builds a network from vertex and edge models. The panel's edge is an `EdgeModel` whose output at the destination is K sin(θ_src − θ_dst); wrapped in `AntiSymmetric`, the source end receives the negative, so each link pulls both phases towards each other. Each `VertexModel` adds the sum of its incident edge outputs, `esum`, to its natural frequency, and `g=1` makes its first state, the phase, its output.

`Network(g, verts, edge)` returns the right-hand side as a function compatible with OrdinaryDiffEq.jl, and the code integrates it from random initial phases over [0, **T (time)**] with `Tsit5`, then averages R over the second half of the run. **Critical Coupling**, **Topology vs Sync** and **Synchronisation State** use the mean-field approximation of the table, with g(0) of the normal density of **sigma (freq.)**.

## References

<a id="ref-Kur1984a"></a>Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.

<a id="ref-LLDKW...2021a"></a>Lindner, M., Lincoln, L., Drauschke, F., Koulen, J. M., Würfel, H., Plietzsch, A., & Hellmann, F. (2021). NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia. *Chaos* 31(6), 063133. [doi:10.1063/5.0051387](https://doi.org/10.1063/5.0051387)

<a id="ref-RPJK2016a"></a>Rodrigues, F. A., Peron, T. K. DM., Ji, P., & Kurths, J. (2016). The Kuramoto Model in Complex Networks. *Physics Reports* 610, 1-98. [doi:10.1016/j.physrep.2015.10.008](https://doi.org/10.1016/j.physrep.2015.10.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cascade Failures](cascade.md)
