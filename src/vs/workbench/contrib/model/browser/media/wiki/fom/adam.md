# Adam

**Adam**, adaptive moment estimation (Kingma and Ba, 2015), is the most used optimiser in deep learning. It keeps two moving averages for each coordinate: the first moment, m = beta1 * m + (1 - beta1) * g, a velocity, and the second moment, v = beta2 * v + (1 - beta2) * g^2, a scale. It corrects both for their start at zero, m_hat = m / (1 - beta1^t) and v_hat = v / (1 - beta2^t), and steps x_new = x - lr * m_hat / (sqrt(v_hat) + eps). The panel uses beta = (0.9, 0.999).

## Why It Works Well
It combines momentum, which smooths the direction, with RMSProp's per-coordinate scaling, which makes the step about **lr per coordinate**, nearly independent of the scale of the gradient. That makes the default rate of 0.001 work on a wide range of problems with little tuning, and it copes well with noisy and sparse gradients.

## Bias Correction
Without the correction, m and v would be biased towards zero in the first steps, v much more than m (beta2 is close to 1), giving overly large first steps. The correction removes that bias; after a few thousand steps it has no effect.

## Limitations
Adam does not converge on some convex problems with a constant rate (Reddi, Kale and Kumar, 2018), and in deep learning its solutions sometimes generalise less well than tuned SGD with momentum. Adding an L2 penalty to the loss interacts badly with its scaling: use AdamW for weight decay.

## See Also
- [AdamW](adamw.md) · [AdaMax](adamax.md) · [RMSProp](rmsprop.md)
