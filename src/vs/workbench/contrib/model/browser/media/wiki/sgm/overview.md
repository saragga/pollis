# Stochastic Gradient Methods — Overview

This webview trains a parameter vector x with the rules of **Optimisers.jl**. At every step the exact gradient of f is computed by **Enzyme.jl** in reverse mode, Gaussian noise of standard deviation **Gradient Noise** is added to imitate minibatch sampling, and the rule updates x. With noise 0 the methods are deterministic.

## Why Noise Matters
If the loss is an average over N observations, the gradient on a random minibatch of size b is unbiased, with a variance about (N - b) / (N b) times the variance across observations. Smaller batches give cheaper and noisier steps. The noise has two effects: it makes the path jitter, and, with a constant learning rate, it stops the iterates from converging, leaving them in a cloud whose size grows with the rate and the noise.

## The Rules
- **SGD** steps along the noisy gradient. See [SGD](sgd.md).
- **Adam** adds momentum and a per-parameter scale from the running second moment. See [Adam](adam.md).
- **AdaMax** uses an infinity-norm scale instead. See [AdaMax](adamax.md).
- **AdaGrad** divides by the root of the accumulated squared gradients. See [AdaGrad](adagrad.md).

## Common Workflow

1. Enter the **Objective f(x)** and **Initial Parameters x0**, choose a rule, the **Learning Rate**, **Iterations** and **Gradient Noise**, and run.
2. Look at the **Loss Curve** and the **Parameter Trajectory**.
3. Run the **Learning-Rate Sensitivity** and the **Convergence Check**.
4. Use **Iterate Averaging** to reduce the noise in the result.
5. **Compare Methods** and test their **Noise Robustness**.
6. Read the **Solution Summary** and the **Per-Parameter Progress**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
