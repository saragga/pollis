# Differentiation — Factsheet

The derivative measures how fast a function changes. In economics it is the **marginal** quantity: marginal cost, marginal utility, the marginal product of labour. This panel computes derivatives, gradients, Hessians and Jacobians in Julia through **DifferentiationInterface.jl**, one interface over several **backends**.

| | |
|---|---|
| **Purpose** | First and second derivatives of functions of one or several variables, at a point |
| **Julia stack** | `DifferentiationInterface.jl` with `ForwardDiff.jl`, `Enzyme.jl`, `Mooncake.jl`, `FiniteDiff.jl` or `Symbolics.jl`; `TaylorSeries.jl` for higher orders |
| **Automatic backends** | ForwardDiff (forward mode), Enzyme and Mooncake (reverse mode): exact to machine precision |
| **Numerical backend** | FiniteDiff: difference quotients, about half the digits of machine precision |
| **Symbolic backend** | Symbolics: exact formulas, then evaluated |
| **Output** | `derivative`, `second_derivative`, `gradient`, `hessian`, `jacobian` |

## The Three Tasks

| Task | Input to output | Result | Economic example |
|---|---|---|---|
| Derivatives | $\mathbb{R} \to \mathbb{R}$ | $f'(x_0)$, $f''(x_0)$ | Marginal cost and whether it is rising |
| Gradients and Hessians | $\mathbb{R}^n \to \mathbb{R}$ | $\nabla f(x_0)$, $\nabla^2 f(x_0)$ | Marginal products; concavity of a production function |
| Jacobians | $\mathbb{R}^n \to \mathbb{R}^m$ | $J_F(x_0)$, an $m \times n$ matrix | Cross-price effects in a demand system |

## Minimal Example

```julia
using DifferentiationInterface
import ForwardDiff

f(x) = x[1]^0.3 * x[2]^0.7          # Cobb-Douglas production
x0 = [1.0, 2.0]
backend = AutoForwardDiff()
gradient(f, backend, x0)            # marginal products of capital and labour
hessian(f, backend, x0)             # negative semidefinite: concave
```

Swapping `AutoForwardDiff()` for `AutoEnzyme()` or `AutoMooncake(; config=nothing)` changes nothing else in the code.

## See Also
- [Overview](overview.md) · [Automatic Differentiation](automatic-differentiation.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
