# RMSProp

**RMSProp**, proposed by Hinton in his 2012 lecture notes, keeps AdaGrad's per-coordinate scaling but replaces the growing sum of squared gradients by an **exponential moving average**: s = rho * s + (1 - rho) * g^2, with rho = 0.9 in Optimisers.jl, and steps x_new = x - lr * g / (sqrt(s) + eps).

## Why It Helps
The moving average forgets gradients older than about 1 / (1 - rho) steps, so the effective learning rate does not shrink to zero as in AdaGrad: it follows the **recent** size of each coordinate's gradient. Coordinates with large gradients still get smaller steps, and the method adapts when the scale of the gradients changes during training.

## Step Size
Since g is divided by the root of its recent mean square, each step is about lr per coordinate when the gradient is steady. Near a minimum with noisy gradients, the mean square is dominated by the noise, the steps become lr times a noisy sign, and the iterates fluctuate in a band of width set by lr: lower the rate late in training for a tighter result.

## Relation to Adam
RMSProp is Adam without the momentum term and without bias correction. Adding momentum to RMSProp, which some implementations allow, gives almost Adam.

## See Also
- [AdaGrad](adagrad.md) · [Adam](adam.md) · [Decision Guide](decision-guide.md)
