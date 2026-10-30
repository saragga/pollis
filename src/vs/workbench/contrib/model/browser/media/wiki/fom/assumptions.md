# Assumptions

## A Differentiable Loss
The gradient is computed by Enzyme.jl from the Julia code of f, so f must be **differentiable** almost everywhere and written in code Enzyme can differentiate. Kinks (absolute values, ReLU-like maxima) are tolerated, as in neural-network training, but near a minimum on a kink the gradient does not shrink and the iterates keep moving.

## Smoothness and the Learning Rate
On a smooth loss whose curvature is at most L (the largest eigenvalue of the Hessian), plain gradient steps are stable only for a learning rate below **2 / L**; above it they oscillate and diverge. The default objective has curvatures 2 and 20, so SGD needs a rate below 0.1. Momentum lowers that limit, and the adaptive rules change the picture by rescaling each coordinate.

## Unbiased, Bounded Noise
The theory of stochastic gradient methods assumes the noisy gradient is **unbiased**, its mean the true gradient, with bounded variance. The panel's Gaussian noise satisfies both. Real minibatch gradients are unbiased if the minibatches are sampled at random; heavy-tailed noise, from outliers in the data, makes every rule less stable.

## Convergence Needs a Decreasing Step
With noise and a **constant** learning rate, SGD does not converge to the minimiser: it fluctuates around it, with a spread that grows with the learning rate and the noise. Convergence to the point needs a step that decreases (the Robbins-Monro conditions: the steps sum to infinity, their squares do not) or averaging of the iterates (**Iterate Averaging**).

## A Local Minimum
On a non-convex loss the rules find a stationary point near where they start, usually a local minimum; noise can help leave saddle points, but no rule guarantees the global minimum.

## Scaling
SGD and the momentum methods are sensitive to variables on very different scales; AdaGrad, RMSProp and the Adam family are much less so, because they scale each coordinate separately. That is one of their main advantages.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
