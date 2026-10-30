# AdaMax

**AdaMax**, from the same paper as Adam (Kingma and Ba, 2015), replaces Adam's second moment, a moving average of squared gradients, by an exponentially weighted **infinity norm**: u = max(beta2 * u, |g|). The step is x_new = x - (lr / (1 - beta1^t)) * m / u, with the first moment m and its bias correction as in Adam; u needs no bias correction.

## What Changes
Adam's scale is the root mean square of recent gradients; AdaMax's is, roughly, the largest recent gradient in absolute value, decaying slowly. Each step is therefore at most about lr per coordinate, and a single very large gradient sets the scale for a while instead of being averaged in, which makes the step size more stable.

## When It Helps
AdaMax is sometimes preferred for **embeddings** and other models with sparse or occasionally very large gradients, where Adam's averaged scale can let a rare spike through. On most problems it behaves very much like Adam; **Compare Rules** shows whether it makes a difference on yours.

## Learning Rate
Because the denominator is a maximum rather than an average, AdaMax's steps are a little smaller than Adam's at the same rate; Kingma and Ba suggested 0.002 as its default.

## See Also
- [Adam](adam.md) · [AdamW](adamw.md) · [Decision Guide](decision-guide.md)
