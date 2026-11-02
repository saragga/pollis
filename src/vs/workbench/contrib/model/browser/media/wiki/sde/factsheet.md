# Factsheet

The Diffusion Processes panel simulates stochastic differential equations, dX = f(X,t) dt + g(X,t) dW, with StochasticDiffEq.jl. It generates paths from the equation you type and fits nothing to data. The tabs differ in the diffusion term and in the solvers they offer.

## What the Diffusion Processes Panel Does

| Item | Description |
|---|---|
| **Purpose** | Forward simulation of a diffusion, one path per `solve` call |
| **Julia stack** | StochasticDiffEq.jl for `SDEProblem` and `solve`; DiffEqDevTools.jl, DiffEqNoiseProcess.jl, StatsBase.jl, Distributions.jl and Plots.jl for the Next Steps |
| **Models** | **Additive Noise**, **Multiplicative Noise** and **Stratonovich** tabs |
| **Inputs** | **Drift f(X,t)**, **Noise sigma** or **Diffusion g(X,t)**, **Solver**, **Initial state X0**, **Time span T**, **Step size dt** |
| **Default inputs** | Drift `-0.5*X`, sigma 0.3, diffusion `0.2*X`, X0 of 1.0, T of 10.0, dt of 0.01 |
| **Key choice** | Whether the noise scales with the state, and which calculus defines the noise integral |

## What Differs Between the Three Diffusion Tabs

| Tab | Diffusion input | Solvers in the menu | Equation solved |
|---|---|---|---|
| **Additive Noise** | **Noise sigma**, a constant | EM, LambaEM, SRA1, SOSRA2 | Constant g, for which Itô and Stratonovich give one equation |
| **Multiplicative Noise** | **Diffusion g(X,t)** | SRIW1, EM, LambaEM, RKMil | Itô |
| **Stratonovich** | **Diffusion g(X,t)** | EulerHeun, LambaEulerHeun, RKMilCommute | Stratonovich with the first two; Itô with RKMilCommute, as its call leaves the package default in place |

## How Each Diffusion Solver Controls Its Step

The table gives the type in StochasticDiffEq.jl, which differs from the menu label for SRA1, RKMil and RKMilCommute. Those three are adaptive solvers, so **Step size dt** sets only their first step. Adaptive solvers run at the package default tolerances, `abstol` and `reltol` of 0.01, since the panel sets neither.

| Solver | Step control | Strong order |
|---|---|---|
| EM | Fixed | 1/2, or 1 with constant g |
| EulerHeun | Fixed | 1 for scalar or commutative noise |
| LambaEM | Adaptive | 1/2 |
| LambaEulerHeun | Adaptive | 1 for scalar or commutative noise |
| RKMil, RKMilCommute | Adaptive | 1 |
| SRIW1 | Adaptive | 3/2, weak 2 |
| SRA1, SOSRA2 | Adaptive | 3/2 with additive noise, weak 2 |

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Stratonovich](stratonovich.md)
