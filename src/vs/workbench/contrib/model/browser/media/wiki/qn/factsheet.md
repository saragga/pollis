# Quasi-Newton Methods — Factsheet

A **quasi-Newton method** iterates x_new = x + alpha * d, with the direction d = -H g, where g is the gradient and H an approximation of the inverse Hessian, updated after each step so that it maps the latest change in gradient y onto the latest step s (H y = s, the secant condition), and alpha the step length chosen by a line search.

| | |
|---|---|
| **Purpose** | Find a local minimum of a smooth, unconstrained function of several variables, without second derivatives |
| **Input** | A Julia expression for f(x), a starting vector x0, the memory m for L-BFGS, the derivative backend and the line search |
| **Core packages** | [Optim.jl](https://github.com/JuliaNLSolvers/Optim.jl), [LineSearches.jl](https://github.com/JuliaNLSolvers/LineSearches.jl), [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl), [FiniteDiff.jl](https://github.com/JuliaDiff/FiniteDiff.jl), [ADTypes.jl](https://github.com/SciML/ADTypes.jl) |
| **Models** | BFGS, L-BFGS |
| **Output** | The minimiser, the minimum, the iterations, the function and gradient calls, the convergence flag, the trace of iterates |
| **Key choice** | BFGS or L-BFGS, by the number of variables; the line search |

## When to Use

- **Smooth objectives** with a gradient available, exactly or by automatic differentiation: likelihoods, least squares, losses of statistical and machine-learning models, calibration of model parameters.
- **When the Hessian is expensive or unavailable**: quasi-Newton methods get close to Newton's convergence from gradients alone.
- **Many variables** (L-BFGS): the default choice for large smooth problems.

## What It Is Not

Not a global optimiser: it finds the local minimum the iterates are drawn to, and different starts may find different minima. Not for non-smooth objectives (absolute values, maxima, kinks at the solution), noisy objectives, or constraints other than simple bounds (use Optim's Fminbox wrapper, or a constrained solver). For quadratic objectives with constraints, see Quadratic Programming.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
