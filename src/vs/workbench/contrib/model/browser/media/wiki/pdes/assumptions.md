# Partial Differential Equations — Assumptions

## A Well-Posed Problem

Hadamard's conditions are that a solution exists, is unique and depends continuously on the data. Each type of PDE needs the right amount of data:

| Equation | Needs |
|---|---|
| Heat | One initial profile, plus a condition at each boundary |
| Wave | Initial position **and** initial velocity, plus boundary conditions |
| Poisson | Boundary conditions only, and no initial data |

The **backward heat equation** $u_t = -D u_{xx}$ is ill-posed: tiny ripples grow without limit. Black-Scholes is a backward equation in calendar time; it is solved forwards in time to maturity, which makes it a normal heat equation.

## Smoothness

- The second-order finite differences give $O(h^2)$ error only for smooth solutions. A step initial profile, a kink or a corner reduces the observed order, although diffusion quickly smooths heat-equation data.
- Boundary data that disagree with the initial data (a hot rod held at zero at its ends) create a local jump that the grid resolves only gradually.
- The wave equation does **not** smooth: a sharp pulse stays sharp, so it needs many grid points per pulse width.

## Resolution

- A feature of width $w$ needs several grid points across it: $h \lesssim w/5$ at least.
- Waves need about 10 or more points per wavelength for moderate accuracy over a few crossings. Numerical **dispersion** (short waves travelling at the wrong speed) grows over long runs.

## Linear Coefficients

This panel uses constant $D$ and $c$ and a rectangular domain. Variable coefficients need an $A$ with coefficients evaluated between grid points. Curved domains need finite elements (Gridap.jl, Ferrite.jl).

## Stability of Time Stepping

Explicit time stepping of the heat equation is stable only for $\Delta t \le h^2 / (2D)$. Halving $h$ quarters the allowed step. The wave equation needs $\Delta t \lesssim h / c$, the CFL condition. Adaptive solvers respect these limits automatically, but they can make an explicit solver very slow.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
