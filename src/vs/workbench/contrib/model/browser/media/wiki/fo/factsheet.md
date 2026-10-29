# First-Order Methods — Factsheet

**First-order methods** minimise a differentiable function using only its values and gradients. They need memory proportional to the number of variables, not its square, which makes them the methods of choice for very large problems, and the basis of the optimisers used to train neural networks. Their speed depends on the **conditioning** of the problem: how unequal the curvature of f is in different directions.

| | |
|---|---|
| **Purpose** | Find a local minimum of a smooth function of many variables, without second derivatives |
| **Input** | The objective f(x), an initial guess x0, the derivative method, the line search, the maximum number of iterations |
| **Core packages** | [Optim.jl](https://github.com/JuliaNLSolvers/Optim.jl), with [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl) or [FiniteDiff.jl](https://github.com/JuliaDiff/FiniteDiff.jl) for the gradient |
| **Methods** | Gradient Descent, Conjugate Gradient (Hager-Zhang) |
| **Output** | The minimiser, the minimum, the convergence flag, iterations, function and gradient calls, the final gradient norm |
| **Key choice** | The method (Conjugate Gradient is almost always faster) and the line search |

## When to Use

- The function is **smooth** and its gradient is available or cheap by automatic differentiation.
- There are **many variables**, too many to store or factor a Hessian.
- As a **baseline** to understand why a problem is hard: a slow first-order method reveals poor conditioning.

## What It Is Not

First-order methods find a **local** minimum: on a non-convex function, the result depends on x0 (see the global optimisers). They do not handle constraints (see constrained optimisation and the proximal methods), and they are slow on ill-conditioned problems of moderate size, where quasi-Newton methods (BFGS, L-BFGS) or Newton's method are better. For the stochastic gradients of machine learning, see the stochastic first-order methods (SGD, Adam).

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
