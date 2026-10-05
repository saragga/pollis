# Partial Differential Equations — Decision Guide

## Which Approach?

| Situation | Approach | Julia |
|---|---|---|
| 1-D or 2-D, rectangular, learning or prototyping | Hand-written finite differences plus method of lines (this panel) | `SparseArrays`, `OrdinaryDiffEq` |
| Write the PDE as equations and let the grid be built for you | Symbolic method of lines | `MethodOfLines.jl` + `ModelingToolkit.jl` |
| Curved or complex geometry, unstructured meshes | Finite elements | `Gridap.jl`, `Ferrite.jl` |
| Very smooth solutions, periodic or simple domains | Spectral methods | `ApproxFun.jl`, `FFTW.jl` |
| Shocks, conservation laws, fluid flow | Finite volumes | `Trixi.jl` |
| High dimensions (many assets, many state variables) | Neural PDE solvers, Monte Carlo | `NeuralPDE.jl` |

## Time Stepping for Heat-Type Equations

| Solver | When |
|---|---|
| **FBDF** | Default for large stiff systems |
| **Rodas5P** | Small to medium systems, tight tolerances |
| **ROCK2**, **ROCK4** | Stabilised explicit: no Jacobian, good for large mildly stiff diffusion |
| **KenCarp4** | Stiff diffusion plus non-stiff reaction (IMEX) |
| **Tsit5** | Only on coarse grids; tiny steps otherwise |

For large grids, pass the sparsity pattern (`jac_prototype = A`) so the implicit solvers use sparse linear algebra.

## Time Stepping for Waves

Explicit solvers (Tsit5, Vern9) with steps near $h / c$. For very long runs use symplectic integrators on the second-order form (`SecondOrderODEProblem` with `KahanLi8`), which keep the energy bounded.

## Linear Solvers for Poisson

| Size | Solver |
|---|---|
| Up to about $10^6$ unknowns in 2-D | Sparse direct: `A \ b` |
| 3-D, or very large 2-D | Conjugate gradients with a preconditioner (`Krylov.jl` + `IncompleteLU.jl` or algebraic multigrid) |

## Related Panels

- **Ordinary Differential Equations**: the method of lines gives an ODE system; solver choice follows the same rules.
- **Integration**: integrals of the solution (mass, energy) are the natural summary statistics.
- **Nonlinear Systems**: steady states of nonlinear PDEs are large nonlinear systems.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
