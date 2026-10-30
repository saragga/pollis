# Local Optimisation — Overview

This webview minimises a scalar function f(x) of several variables with **Optim.jl**, the standard Julia package for unconstrained and box-constrained optimisation. Its algorithms are grouped by the derivative information they use, which is the panel's first choice: **Gradient Free** methods compare function values only, **Gradient Required** methods follow the gradient, and **Hessian Required** methods use the matrix of second derivatives. The more a method knows about f, the fewer iterations it needs, provided that knowledge is accurate and f is smooth enough for it to mean something.

## Gradient Free
**Nelder-Mead** moves a simplex of n + 1 points by reflections, expansions and contractions. **Simulated Annealing** and **Particle Swarm** are stochastic searches that can leave a local basin, at the cost of many evaluations. See [Gradient Free](gradient-free.md).

## Gradient Required
**BFGS** and **L-BFGS** (quasi-Newton), **Conjugate Gradient** and **Gradient Descent** use the gradient, by automatic differentiation or finite differences. With finite **Lower Bounds** or **Upper Bounds**, the panel wraps the method in **Fminbox**, a barrier method that keeps the iterates inside the box. See [Gradient Required](gradient-required.md).

## Hessian Required
**Newton** steps to the minimum of the local quadratic model; **Newton Trust Region** limits the step to a region where that model is trusted; **IPNewton** is an interior-point Newton method that respects the bounds. See [Hessian Required](hessian-required.md).

## Derivatives
**Derivatives** chooses :forward, exact derivatives by forward-mode automatic differentiation (ForwardDiff.jl), or :finite, finite differences (FiniteDiff.jl), for an f that cannot be differentiated through.

## Common Workflow

1. Enter the **Objective f(x)** and the **Initial Guess x0**, choose the class and the **Algorithm**, and run.
2. Look at the **Convergence Trace** and, in two dimensions, the **Contour + Path**.
3. Diagnose with the **Convergence Check** and the **Gradient Check**.
4. Run a **Multi-Start** to see whether other minima exist.
5. **Compare Algorithms** and **Autodiff vs Finite Differences**.
6. Read the **Solution Summary** and the **Local Optimality (Hessian)**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
