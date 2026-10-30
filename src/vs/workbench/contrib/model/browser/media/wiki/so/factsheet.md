# Second-Order Methods — Factsheet

A **second-order method** uses the Hessian, the matrix of second derivatives, as well as the gradient: it fits a quadratic model of f at the current point and steps to the model's minimum. Near a minimum this gives **quadratic convergence**, the number of correct digits roughly doubling at each step.

| | |
|---|---|
| **Purpose** | Minimise a smooth function precisely, in few iterations, using second derivatives |
| **Input** | A Julia expression for f(x), the initial guess x0, the derivative backend, and box bounds for IPNewton |
| **Core packages** | [Optim.jl](https://github.com/JuliaNLSolvers/Optim.jl), [NLopt.jl](https://github.com/jump-dev/NLopt.jl), [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl), [FiniteDiff.jl](https://github.com/JuliaDiff/FiniteDiff.jl) |
| **Models** | Newton, Newton Trust Region, IPNewton, Truncated Newton |
| **Output** | The minimiser, the minimum, the iterations, the convergence flag and the path of the iterates |
| **Key choice** | How the Newton step is safeguarded: a line search, a trust region, a barrier for bounds, or an inexact inner solve |

## When to Use

- **Smooth problems of small to moderate size**, where the Hessian is affordable and a precise answer is wanted: maximum likelihood, calibration, the final polish after a cheaper method.
- **Ill-conditioned problems**, such as the default Rosenbrock function, where first-order methods crawl along a curved valley.
- **Box constraints** (IPNewton) and **large problems** where the Hessian is used only through products with vectors (Truncated Newton).

## What It Is Not

Not a global optimiser: every method here finds a local minimum near its start. Not suited to noisy or non-smooth objectives, where the Hessian is meaningless, nor to very large problems with an explicit Hessian, whose cost grows like the cube of the dimension.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
