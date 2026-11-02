# Factsheet

**Discrete Maps** iterates the Hénon map with `DynamicalSystems.jl`, and studies its orbits, fixed points, bifurcations and Lyapunov exponent.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Explore the long-run behaviour of a deterministic map |
| Julia stack | `DynamicalSystems.jl`, with `GLMakie.jl` for figures |
| System | Hénon map, defined in the `henon` function |
| Constructor | `DeterministicIteratedMap` |
| Printed result | Whether the orbit is bounded, x and y ranges, orbit size |

The panel has no model tabs: all actions start from the same map.

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Initial state (u0)** | [0.0, 0.0] | Starting point of the orbit |
| **Parameters (p)** | [1.4, 0.3] | a and b, in that order |
| **Iterations (n)** | 10000 | Length of the orbit, or a transient in the sweeps |

**Parameters (p)** does not reach the two sweeps or **Different Maps**, which set their own values.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Transient discarded in most actions | 1000 steps |
| Transient in **Time Series** | None |
| **Bifurcation Diagram** grid | 200 values of a from 0.8 to 1.4, b = 0.3 |
| **Parameter Sweep** grid | 20 values of a from 1.0 to 1.4, b = 0.3 |
| Points kept per a in both sweeps | 100, after a transient of **Iterations (n)** |
| **Fixed Points of Map** search box | x from −2 to 2, y from −1 to 1 |
| Perturbation in **Sensitivity to ICs** | 1e-8 per coordinate, over 100 steps |
| Start in **Forward Iteration** | [0.5, 0.5] |
| Starts in **Multiple Initial Conditions** | x0 of 0.0, 0.1, 0.5, −0.5 with y0 = 0 |
| **Different Maps** settings | Hénon at (1.4, 0.3), logistic at r = 3.9 |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Orbit Plot** | Phase portrait of x against y |
| **Time Series** | x[n] against n, with the transient |
| **Bifurcation Diagram** | Long-run x against a |
| **Sensitivity to ICs** | Growth rate of a small error |
| **Fixed Points of Map** | Fixed points, eigenvalue sizes, stability |
| **Forward Iteration** | First steps from a new start, and predictable horizon |
| **Parameter Sweep** | Distinct values per a |
| **Multiple Initial Conditions** | Range and exponent per start |
| **Different Maps** | Range and exponent for Hénon and logistic |
| **Lyapunov Exponent** | Largest exponent and orbit type |
| **State Statistics** | Mean, standard deviation and range |

## See Also

- [Overview](overview.md) · [Fixed Points](fixed-points.md) · [Bifurcation](bifurcation.md) · [Decision Guide](decision-guide.md)
