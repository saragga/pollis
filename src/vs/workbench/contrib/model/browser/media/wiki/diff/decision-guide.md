# Differentiation — Decision Guide

## Which Task?

| You have | You want | Task |
|---|---|---|
| $f(x)$, one variable | Slope, curvature, marginal value | Derivatives |
| $f(x_1, \dots, x_n)$, one output | Marginal effects, optimality conditions, concavity | Gradients and Hessians |
| $F(x_1, \dots, x_n)$, several outputs | Sensitivities of a system, local invertibility | Jacobians |

## Which Backend?

| Situation | Backend | Why |
|---|---|---|
| Few inputs (up to about 50), ordinary Julia code | **ForwardDiff** | Robust, fast, no setup |
| Many inputs, one output (likelihood, loss, welfare) | **Enzyme** or **Mooncake** | Reverse mode: cost does not grow with $n$ |
| Code with mutation or in-place arrays | **Enzyme** or **Mooncake** | Both support mutation |
| A black box: external library, simulator, other language | **FiniteDiff** | Only needs function values |
| You want the formula itself, or an exact reference | **Symbolics** | Exact expressions; see also the Symbolic Math panel |
| Hessians | ForwardDiff, or `SecondOrder(forward, reverse)` | Forward-over-reverse is the standard combination |

Not sure? Run **Compare Backends**: it tries every backend on your function and reports which ones work, their accuracy and their speed.

## Why Not Zygote?

Zygote.jl was long the default reverse-mode AD in Julia, but it cannot differentiate code that mutates arrays, and active development of reverse-mode AD has moved to Enzyme and Mooncake. DifferentiationInterface makes switching a one-line change.

## Related Panels

- **Symbolic Math**: derivatives as formulas, limits and series.
- **Nonlinear Systems**: Jacobians inside Newton's method and comparative statics of equilibria.
- **Local Optimisation**: gradients and Hessians driving the search for an optimum.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Automatic Differentiation](automatic-differentiation.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
