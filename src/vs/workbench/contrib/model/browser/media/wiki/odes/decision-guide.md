# Ordinary Differential Equations — Decision Guide

## Which Solver?

| Situation | Solver | Why |
|---|---|---|
| Default, non-stiff | **Tsit5** | Efficient order-5 pair with a good interpolant |
| Very tight tolerances ($10^{-10}$ or less), smooth problems | **Vern9** | High order pays off when high accuracy is needed |
| Stiff: fast and slow time scales, tiny steps with Tsit5 | **Rodas5P** (small systems), **FBDF** or **KenCarp4** (large ones) | Implicit, stable with large steps |
| Not sure whether it is stiff | **AutoTsit5(Rosenbrock23())** | Starts explicit, switches when it detects stiffness |
| Teaching, or matching a textbook | **RK4**, **Euler** with fixed `dt` | Transparent; shows the order of convergence |
| Long-time Hamiltonian mechanics (planets, molecules) | Symplectic methods such as `VerletLeapfrog`, `KahanLi8` | Keep energy bounded over millions of periods |
| Solver never specified | `solve(prob)` | DifferentialEquations.jl picks a method automatically |

## Tolerances

| Use | `reltol` |
|---|---|
| Plots | $10^{-3}$ to $10^{-4}$ |
| Reported numbers | $10^{-6}$ to $10^{-8}$ |
| References, convergence studies | $10^{-10}$ to $10^{-12}$ |

## Beyond Plain ODEs

| Feature | Tool |
|---|---|
| Unknown parameters to estimate from data | The **ODE Inference Methods** panel (PEtab, optimisation, Bayesian) |
| Random shocks | `StochasticDiffEq.jl` (SDEs) |
| Delays, e.g. incubation periods | `DelayDiffEq.jl` |
| Events: switches, thresholds, impulses | Callbacks in OrdinaryDiffEq |
| Algebraic constraints | DAE solvers (`Rodas5P` with a mass matrix, `IDA`) |
| Spatial dependence | The **Partial Differential Equations** panel |
| Symbolic model building | `ModelingToolkit.jl` |

## Related Panels

- **Nonlinear Systems**: equilibria are roots of $F(u) = 0$.
- **Differentiation**: Jacobians for stability.
- **Partial Differential Equations**: the method of lines turns a PDE into a large ODE system.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
