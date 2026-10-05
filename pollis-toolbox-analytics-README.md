# Mathematical Foundations Toolbox

Version 1.0.4

The Pollis Mathematical Foundations Toolbox brings symbolic and numerical mathematics to Pollis: symbolic math, nonlinear systems, numerical differentiation and integration, and ordinary and partial differential equations.

Installing it adds the **Mathematical Foundations** submenu at the top of the **Optimise** menu. Each panel has key points, a decision table, example code you can send to the Julia REPL or a notebook, reference wikis and notebook tutorials.

## Panels

| Panel | What it covers | Powered by |
|---|---|---|
| Symbolic Math | Algebra, symbolic differentiation and integration, limits and series, equation solving | Symbolics.jl, SymbolicNumericIntegration.jl |
| Nonlinear Systems | Scalar equations, bracketing methods and systems of nonlinear equations | NonlinearSolve.jl |
| Numerical Differentiation | Derivatives, gradients, Hessians and Jacobians by automatic and finite differences | DifferentiationInterface.jl, ForwardDiff.jl, Enzyme.jl, Mooncake.jl, TaylorSeries.jl |
| Numerical Integration | Definite and multiple integrals, and integration of sampled data | QuadGK.jl, HCubature.jl, FastGaussQuadrature.jl, SymbolicNumericIntegration.jl |
| Ordinary Differential Equations | First-order equations, systems and second-order equations | OrdinaryDiffEq.jl, NonlinearSolve.jl, ForwardDiff.jl |
| Partial Differential Equations | Heat, wave and Poisson equations | OrdinaryDiffEq.jl, MethodOfLines.jl, Krylov.jl, Gridap.jl |

## Requirements

Julia. Each panel lists the Julia packages it uses on its Powered by line and offers to install the missing ones.

## License

AGPL-3.0
