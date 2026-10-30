# First-Order Methods — Overview

The First-Order Methods panel trains a parameter vector x on a loss f(x) with the **update rules of Optimisers.jl**, the optimisers of the Flux ecosystem. The gradient is computed by **Enzyme.jl** in reverse mode, and Gaussian noise of standard deviation **Gradient Noise** is added to it at every step, to imitate the sampling noise of minibatch training; set it to 0 for the deterministic method.

## The Rules
- **SGD** steps along -g, scaled by the learning rate. See [SGD](sgd.md).
- **Momentum** and **Nesterov** accumulate a velocity of past gradients, damping oscillations across a valley and speeding up along it. See [Momentum](momentum.md) and [Nesterov](nesterov.md).
- **AdaGrad** and **RMSProp** scale each coordinate by the size of its past gradients. See [AdaGrad](adagrad.md) and [RMSProp](rmsprop.md).
- **Adam**, **AdaMax** and **AdamW** combine a velocity with that per-coordinate scaling; AdamW adds decoupled weight decay. See [Adam](adam.md), [AdaMax](adamax.md) and [AdamW](adamw.md).

## The Learning Rate
The **Learning Rate** means different things for different rules. In SGD and the momentum methods the step is the learning rate times the gradient; in the adaptive rules each coordinate moves by about the learning rate, whatever the size of its gradient. The same number is therefore not comparable across rules, which is why **Compare Rules** tunes the rate for each.

## Common Workflow

1. Enter the **Objective f(x)** and **Initial Parameters x0**, choose a rule, its **Learning Rate**, the **Iterations** and the **Gradient Noise**, and run.
2. Look at the **Loss Curve** and, in two dimensions, the **Parameter Trajectory**.
3. Use the **Learning-Rate Sensitivity** to find the working range, and the **Convergence Check** to see whether the loss has flattened.
4. Try **Iterate Averaging** to reduce the noise in the result.
5. **Compare Rules**, each at its own best rate, and check the **Optimization.jl Interface**.
6. Read the **Solution Summary** and the **Optimiser State**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
