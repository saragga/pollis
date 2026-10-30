# AdamW

**AdamW** (Loshchilov and Hutter, 2019) is Adam with **decoupled weight decay**: each step takes the Adam step and also shrinks the parameters by lr * decay * x, where decay is the panel's **Weight Decay**.

## Why Decouple
Weight decay is the usual regulariser of neural networks: it pulls the parameters towards zero. In SGD, adding an L2 penalty (decay / 2) * ||x||^2 to the loss is the same as shrinking the parameters at each step. In Adam it is not: the penalty's gradient is divided by Adam's per-coordinate scale, so parameters with large gradients are barely regularised and those with small gradients are regularised strongly. Applying the shrinkage directly to x, outside the adaptive scaling, restores the intended effect, and in practice generalises better.

## What the Panel Shows
AdamW minimises the loss and pulls the parameters towards zero at the same time, so it settles **short of the minimiser of f**, where the Adam step balances decay * x. The result is a regularised solution, not a failure to converge. Setting **Weight Decay** to 0 recovers Adam exactly.

## Choosing the Decay
Typical values are 0.01 to 0.1 in deep learning. Because the shrinkage is lr * decay per step, changing the learning rate also changes the regularisation: tune them together.

## See Also
- [Adam](adam.md) · [AdaMax](adamax.md) · [Decision Guide](decision-guide.md)
