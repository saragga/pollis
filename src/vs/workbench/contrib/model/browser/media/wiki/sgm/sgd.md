# SGD

**Stochastic gradient descent** (Robbins and Monro, 1951) takes the step x_new = x - lr * g, where g is a noisy, unbiased estimate of the gradient. In Optimisers.jl the rule is Descent(lr). It has no state.

## Two Phases
On a smooth loss SGD has two phases. Far from the minimum the gradient dominates the noise and SGD behaves like gradient descent, converging linearly at a rate set by the learning rate and the curvature. Near the minimum the noise dominates: the iterates stop approaching and wander in a cloud whose variance is roughly proportional to **lr times the noise variance** divided by the curvature. The **Loss Curve** shows both phases.

## The Learning Rate
A larger rate gives a faster first phase and a higher floor; a smaller one a slower first phase and a lower floor. Stability requires lr below 2 / L, L the largest curvature. Practical schedules start with a large rate and decrease it, by steps or as 1/t, which satisfies the Robbins-Monro conditions and lets SGD converge to the point.

## Scaling
Each parameter moves by the rate times its own gradient, so a badly scaled problem, with very different curvatures in different directions, forces a rate small enough for the steepest direction, and progress along the flattest one is slow. **Per-Parameter Progress** shows this; rescaling the parameters or an adaptive rule fixes it.

## Why It Remains a Benchmark
SGD costs one gradient per step, its behaviour is well understood, and with momentum and a tuned schedule it remains competitive in deep learning, where its solutions often generalise well.

## See Also
- [Adam](adam.md) · [AdaGrad](adagrad.md) · [Decision Guide](decision-guide.md)
