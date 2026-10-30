# First-Order Methods — Factsheet

A **first-order method** updates the parameters from the gradient alone: x_new = x - step, where the step is built from the current gradient g, and in most rules from a running memory of past gradients (a velocity, or averages of g and g squared).

| | |
|---|---|
| **Purpose** | Minimise a loss by gradient steps, as in training statistical and machine-learning models, with or without noisy (minibatch) gradients |
| **Input** | A Julia expression for f(x), the initial parameters x0, the learning rate, the momentum rho or the weight decay where the rule has one, the iterations and the gradient noise |
| **Core packages** | [Optimisers.jl](https://github.com/FluxML/Optimisers.jl), [Enzyme.jl](https://github.com/EnzymeAD/Enzyme.jl), [Optimization.jl](https://github.com/SciML/Optimization.jl), [OptimizationOptimisers.jl](https://github.com/SciML/Optimization.jl) |
| **Models** | SGD, Momentum, Nesterov, AdaGrad, RMSProp, Adam, AdaMax, AdamW |
| **Output** | The final parameters, the loss path, the late average loss, the gradient norm and the optimiser's state |
| **Key choice** | The rule and its learning rate |

## When to Use

- **Training neural networks and other large models**, where the gradient is cheap, the Hessian is out of reach, and the gradient is often estimated from a minibatch.
- **Noisy gradients**: stochastic objectives where line searches and quasi-Newton updates are unreliable.
- **Learning how the rules differ**: the panel runs the eight Optimisers.jl rules on the same loss, with controlled noise.

## What It Is Not

Not the fastest choice for a small, smooth, deterministic problem: BFGS and Newton (Local Optimisation, Quasi-Newton Methods) reach a precise minimum in far fewer steps. With a constant learning rate and noisy gradients the rules **do not converge** to a point; they settle into a noise floor around the minimum.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
