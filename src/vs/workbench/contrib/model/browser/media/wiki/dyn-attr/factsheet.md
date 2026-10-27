# Attractor & Basin Analysis — Factsheet

A deterministic dynamical system, left to run, settles onto an **attractor**. Many systems have more than one, and which one a trajectory reaches depends on where it starts: the state space is divided into **basins of attraction**. As a parameter changes, attractors can lose stability, merge or vanish at **bifurcations**, and a system can tip from one regime to another. This panel finds the attractors, maps their basins and traces the bifurcations.

| | |
|---|---|
| **Purpose** | Find all coexisting attractors, map which initial conditions reach each, and see how they change with a parameter |
| **Input** | A system of ordinary differential equations `f!(du, u, p, t)`, an initial state u0, parameters p, and the grid resolution N |
| **Core packages** | [Attractors.jl](https://github.com/JuliaDynamics/Attractors.jl), [BifurcationKit.jl](https://github.com/bifurcationkit/BifurcationKit.jl), [DynamicalSystems.jl](https://github.com/JuliaDynamics/DynamicalSystems.jl), [FractalDimensions.jl](https://github.com/JuliaDynamics/FractalDimensions.jl) |
| **Methods** | Attractor Finding, Basins of Attraction, Bifurcation (numerical continuation) |
| **Output** | The attractors, basin fractions and basin maps, bifurcation points and diagrams, basin entropy, correlation dimension |
| **Key choices** | The grid box and its resolution N; the mapper; the parameter range of the continuation |

## When to Use

- To learn whether a model is **multistable**: whether the same parameters can lead to different long-run outcomes depending only on the starting point (climate states, ecosystems, gene switches, power grids).
- To measure **resilience**: a large basin means the attractor survives large disturbances; a small or fractal one means it does not.
- To find **tipping points**: the parameter values where an attractor disappears and the system moves to another.

## What It Is Not

These are numerical results on a finite grid and a finite time: an attractor smaller than a grid cell, or a basin outside the grid box, is missed. Basin fractions depend on the box chosen. The methods need the equations of the system; to analyse a measured time series, use delay embedding and the time-series tools of DynamicalSystems.jl instead.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Grid and Settings](settings.md)
