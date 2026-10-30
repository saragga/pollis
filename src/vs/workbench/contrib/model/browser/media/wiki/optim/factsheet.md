# Local Optimisation — Factsheet

A **local optimiser** starts at x0 and moves, step by step, to points of lower f(x), until no small move improves it: it returns a **local minimum**, the one the iterates are drawn to from that start.

| | |
|---|---|
| **Purpose** | Find a local minimum of a scalar function of several variables, unconstrained or within box bounds |
| **Input** | A Julia expression for f(x), a starting vector x0, the algorithm, the derivative backend, and lower and upper bounds |
| **Core packages** | [Optim.jl](https://github.com/JuliaNLSolvers/Optim.jl), [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl), [FiniteDiff.jl](https://github.com/JuliaDiff/FiniteDiff.jl), [ADTypes.jl](https://github.com/SciML/ADTypes.jl) |
| **Models** | Gradient Free (Nelder-Mead, Simulated Annealing, Particle Swarm), Gradient Required (BFGS, L-BFGS, Conjugate Gradient, Gradient Descent), Hessian Required (Newton, Newton Trust Region, IPNewton) |
| **Output** | The minimiser, the minimum, the convergence flags, the iterations and calls, the trace of iterates |
| **Key choice** | How much of the derivative information f offers: none, the gradient, or the Hessian |

## When to Use

- **Fitting and calibration**: minimising a negative log-likelihood, a sum of squares or a loss over a model's parameters.
- **Engineering and economics**: a cost, an energy or a utility of a few to many continuous variables.
- **A first look at any objective**: the three classes side by side show how hard the problem is.

## What It Is Not

Not a global optimiser: a different start can give a different minimum (see **Multi-Start**). Not for constraints other than simple bounds: equalities and general inequalities belong to Constrained Optimisation or Nonlinear Programming. Not for integer variables: see Discrete and Combinatorial Optimisation.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
