# Nonsmooth and Proximal Optimisation — Factsheet

**Nonsmooth optimisation** minimises convex functions that are not differentiable everywhere, such as the L1 norm of the lasso, whose kink at zero is what produces exact zeros. **Proximal methods** handle the nonsmooth part through its **proximal map**, prox(v) = argmin_u g(u) + ||u - v||^2 / (2 t), which for many penalties has a closed form.

| | |
|---|---|
| **Purpose** | Minimise a smooth loss plus a nonsmooth penalty, here penalised sparse regression |
| **Input** | The variables n, the observations m, the penalty (L1, L2 or max norm), its weight, the step size and the iterations |
| **Core packages** | [ProximalOperators.jl](https://github.com/JuliaFirstOrder/ProximalOperators.jl), [ProximalAlgorithms.jl](https://github.com/JuliaFirstOrder/ProximalAlgorithms.jl) |
| **Models** | Subgradient, Bundle, Chambolle-Pock, Douglas-Rachford, Proximal Point |
| **Output** | The solution, the objective, its gap to a reference optimum, the optimality residual and the recovered sparsity pattern |
| **Key choice** | How the nonsmooth part is used: through subgradients only, or through its proximal map |

## When to Use

- **Sparse and structured estimation**: the lasso, the group lasso, total variation, nuclear-norm penalties.
- **Signal and image processing**: denoising and reconstruction problems of the form g(x) + h(K x).
- **Learning the methods**: the panel runs five algorithms on the same problem, min 0.5 ||A x - b||^2 + lambda penalty(x), with a known sparse truth.

## What It Is Not

Not for smooth problems, where gradient and Newton methods are faster; not for nonconvex nonsmooth problems, where these guarantees do not hold. For the lasso itself, specialised coordinate-descent solvers (GLMNet) are faster in practice: the Lasso panel covers them.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
