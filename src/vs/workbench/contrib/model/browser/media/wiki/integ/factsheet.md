# Integration — Factsheet

The definite integral adds up a rate over a range: total cost from marginal cost, total revenue from a price path, consumer surplus from a demand curve, a present value from an income stream, a probability from a density. This panel computes integrals numerically in Julia and shows how accurate each method is.

| | |
|---|---|
| **Purpose** | Definite integrals of formulas in one or several variables, and of sampled data |
| **Julia stack** | `QuadGK.jl` (adaptive, one variable), `HCubature.jl` (adaptive, several variables), `FastGaussQuadrature.jl` (Gauss rules), `SymbolicNumericIntegration.jl` (antiderivatives) |
| **Improper integrals** | Infinite limits with QuadGK |
| **Error control** | Adaptive methods return an error estimate and stop at a relative tolerance |
| **Output** | The integral, its error estimate and the number of function evaluations |

## The Three Tasks

| Task | Integral | Methods |
|---|---|---|
| Definite Integral | $\int_a^b f(x)\,dx$ | Adaptive Gauss-Kronrod, Gauss-Legendre, Simpson, trapezoid, midpoint |
| Multiple Integral | $\int_{[l, u]} f(x)\,dx$, $x \in \mathbb{R}^n$ | Adaptive cubature, Monte Carlo |
| Sampled Data | $\int y\,dx$ from points $(x_i, y_i)$ | Trapezoid, Simpson |

## Minimal Example

```julia
using QuadGK

mc(q) = 10 - 0.8q + 0.1q^2                 # marginal cost
total, err = quadgk(mc, 0, 6)               # variable cost of producing 6 units
pv, _ = quadgk(t -> 100 * exp(-0.05t), 0, Inf)   # present value of a perpetual flow: 2000
```

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
