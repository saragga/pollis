# Stochastic Gradient Methods — Factsheet

A **stochastic gradient method** minimises a loss from **noisy estimates of its gradient**, such as the gradient of the loss on a random minibatch of the data rather than on all of it. Each step is cheap and imprecise; the noise averages out over many steps.

| | |
|---|---|
| **Purpose** | Minimise a loss whose exact gradient is too expensive or unavailable, as in training on large datasets |
| **Input** | A Julia expression for f(x), the initial parameters x0, the learning rate, the iterations and the gradient noise |
| **Core packages** | [Optimisers.jl](https://github.com/FluxML/Optimisers.jl), [Enzyme.jl](https://github.com/EnzymeAD/Enzyme.jl) |
| **Models** | SGD, Adam, AdaMax, AdaGrad |
| **Output** | The final parameters, the loss path, the late average loss and the gradient norm |
| **Key choice** | The rule, its learning rate, and how the noise is handled at the end (averaging or a smaller rate) |

## When to Use

- **Large datasets**: the loss is a sum over many observations and the full gradient is costly; a minibatch gradient is an unbiased estimate at a fraction of the cost.
- **Online learning**: the data arrive as a stream, one batch at a time.
- **Understanding noise**: the panel adds Gaussian noise of a chosen size to the exact gradient, so the effect of the noise on each rule can be studied in isolation.

## What It Is Not

Not a precise optimiser: with a constant learning rate the iterates settle into a **noise floor** around the minimum rather than converging to it. For a deterministic, smooth problem of moderate size, BFGS or Newton gives a far more accurate answer. The First-Order Methods panel covers more rules (momentum, Nesterov, RMSProp, AdamW) and tunes each before comparing them.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
