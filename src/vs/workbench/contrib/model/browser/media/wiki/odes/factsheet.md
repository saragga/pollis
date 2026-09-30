# Ordinary Differential Equations — Factsheet

An ordinary differential equation (ODE) states how a quantity changes: its rate of change depends on time and on its current value. Given where the quantity starts, the equation determines its whole future path. Population growth, cooling, capital accumulation, epidemics, drug concentrations and oscillating springs are all ODEs. Few ODEs have a formula for their solution, so this panel solves them numerically with Julia and checks how accurate the result is.

| | |
|---|---|
| **Purpose** | Solve initial value problems $y' = f(t, y)$, $y(t_0) = y_0$, for one equation, a system, or a second-order equation |
| **Julia stack** | `OrdinaryDiffEq.jl` (solvers), `NonlinearSolve.jl` (equilibria), `ForwardDiff.jl` (Jacobians) |
| **Solvers** | Tsit5, Vern9 (explicit Runge-Kutta), Rodas5P (implicit, stiff), auto-switching, and fixed-step RK4 and Euler for teaching |
| **Error control** | Adaptive solvers pick each step so the estimated local error stays below the tolerance |
| **Output** | A continuous solution `sol(t)`, step counts, function evaluations and a return code |

## The Three Tasks

| Task | Equation | Examples |
|---|---|---|
| First-Order Equation | $y' = f(t, y)$ | Logistic growth, Newton's cooling, a price adjusting to excess demand |
| System of Equations | $u' = F(t, u)$, $u \in \mathbb{R}^n$ | Predator-prey, SIR epidemics, Solow growth with two sectors |
| Second-Order Equation | $y'' = g(t, y, y')$ | Pendulum, spring-mass-damper, RLC circuit |

## Minimal Example

```julia
using OrdinaryDiffEq

rhs(y, p, t) = 0.8y * (1 - y / 10)          # logistic growth, capacity 10
prob = ODEProblem(rhs, 0.5, (0.0, 20.0))
sol = solve(prob, Tsit5(); reltol=1e-8)
sol(5.0)                                     # the solution at t = 5, interpolated
```

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
