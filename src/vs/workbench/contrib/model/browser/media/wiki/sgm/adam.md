# Adam

**Adam** (Kingma and Ba, 2015) keeps two exponential moving averages per parameter: m of the gradient, with beta1 = 0.9, and v of the squared gradient, with beta2 = 0.999. After correcting both for their initialisation at zero, it steps x_new = x - lr * m_hat / (sqrt(v_hat) + eps).

## How It Handles Noise
- The **first moment** m averages the noisy gradients over about ten steps, smoothing the direction.
- The **second moment** v estimates the mean square of the gradient, signal plus noise, over about a thousand steps, and sets the scale.
Far from the minimum the signal dominates and each step is about **lr per parameter**. Near the minimum the noise dominates v, the ratio m / sqrt(v) shrinks to roughly the signal-to-noise ratio, and the steps become smaller automatically: Adam reduces its effective rate where the gradient is mostly noise.

## Scale Invariance
Multiplying the loss by a constant leaves Adam's steps unchanged, since m and sqrt(v) scale alike. That is why one learning rate, around 0.001, works across many problems, and why Adam copes with badly scaled parameters: **Per-Parameter Progress** shows them moving at similar speeds.

## Caveats
With a constant rate Adam does not converge to the point either, and on some convex problems it can fail to converge (Reddi, Kale and Kumar, 2018). For weight decay, use AdamW in the First-Order Methods panel rather than an L2 term in the loss.

## See Also
- [AdaMax](adamax.md) · [AdaGrad](adagrad.md) · [Decision Guide](decision-guide.md)
