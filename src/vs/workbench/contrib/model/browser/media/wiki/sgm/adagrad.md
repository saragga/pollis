# AdaGrad

**AdaGrad** (Duchi, Hazan and Singer, 2011) accumulates the squared gradients of each parameter, G = G + g^2, and steps x_new = x - lr * g / (sqrt(G) + eps). Parameters with large or frequent gradients get small steps; parameters with small or rare ones get large steps.

## Under Noise
The accumulated G grows with every step, signal and noise alike, so the effective rate of every parameter decreases roughly like **1 / sqrt(t)**. That is a built-in decreasing schedule: on convex problems AdaGrad converges to the minimum despite the noise, with no schedule to tune. The **Loss Curve** keeps falling slowly instead of flattening at a floor.

## Its Weakness
The decrease never stops. After many steps, especially with noise, which inflates G, the steps become so small that progress stalls, possibly before the minimum is reached. On long non-convex training this is a serious limitation, which RMSProp and Adam fix by using a moving average instead of a sum.

## Sparse Features
AdaGrad was designed for problems such as text models with many rare features: a parameter whose gradient is usually zero keeps a small G and takes large steps when its feature does appear. **Per-Parameter Progress** shows the per-parameter adaptation on the panel's problem.

## Learning Rate
Because the steps shrink, AdaGrad tolerates and needs a larger rate than Adam: 0.1 is a common default.

## See Also
- [Adam](adam.md) · [SGD](sgd.md) · [Decision Guide](decision-guide.md)
