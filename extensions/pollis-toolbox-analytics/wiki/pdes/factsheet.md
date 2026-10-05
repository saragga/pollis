# Partial Differential Equations — Factsheet

A partial differential equation (PDE) describes a quantity that varies in space as well as time: temperature along a rod, the displacement of a string, the concentration of a pollutant, the price of an option across stock prices. This panel solves the three classic linear PDEs, each on a regular grid. The **heat** equation is diffusion, the **wave** equation is propagation and the **Poisson** equation is a steady state. It then checks the grid, the solver and conservation laws.

| | |
|---|---|
| **Purpose** | Solve the heat and wave equations in one dimension and the Poisson equation on a square |
| **Method** | Finite differences: the **method of lines** for heat and wave, a sparse linear system for Poisson |
| **Julia stack** | `OrdinaryDiffEq.jl` (time stepping), `SparseArrays` and `LinearAlgebra` (standard library), `Krylov.jl` (conjugate gradients) |
| **Boundaries** | Fixed values (Dirichlet), no flux (Neumann), periodic |
| **Output** | The solution on the grid, as a continuous function of time for heat and wave |

## The Three Tasks

| Task | Equation | Type | Typical question |
|---|---|---|---|
| Heat Equation | $u_t = D\,u_{xx} + r(u, x, t)$ | Parabolic | How does a concentration spread and settle? |
| Wave Equation | $u_{tt} = c^2 u_{xx}$ | Hyperbolic | How does a disturbance travel and reflect? |
| Poisson Equation | $-(u_{xx} + u_{yy}) = f(x, y)$ | Elliptic | What is the steady state for a given source? |

## Minimal Example

```julia
using OrdinaryDiffEq, SparseArrays

n, L, D = 100, 1.0, 0.01
h = L / (n + 1); xs = h .* (1:n)
A = spdiagm(-1 => ones(n - 1), 0 => fill(-2.0, n), 1 => ones(n - 1)) ./ h^2
rhs(u, p, t) = D .* (A * u)                          # u = 0 at both ends
sol = solve(ODEProblem(rhs, exp.(-100 .* (xs .- 0.5) .^ 2), (0.0, 5.0)), FBDF())
```

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
