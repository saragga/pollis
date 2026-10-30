# Decision Guide

| Situation | Rule |
|---|---|
| A default for deep learning and most noisy problems | **Adam** |
| Regularising with weight decay | **AdamW**, not Adam with an L2 term |
| Well-scaled problem, tuned schedule, best final accuracy | **SGD with momentum** (Momentum or Nesterov) |
| Narrow valleys where plain steps zigzag | **Momentum** or **Nesterov** |
| Sparse features, rare but informative coordinates | **AdaGrad** (short runs) or **RMSProp** |
| Embeddings, occasional very large gradients | **AdaMax** |
| A baseline, or teaching | **SGD** |
| Small, smooth, deterministic problem | Not a first-order rule: BFGS or Newton |

## Decision Flow

1. **Start with Adam** at 0.001, or SGD with momentum at 0.01.
2. **Run the Learning-Rate Sensitivity** and move the rate into the flat bottom of the U.
3. **Check the Loss Curve** for divergence or a high floor.
4. **Lower the floor** with Iterate Averaging, or by lowering the rate late in training.
5. **Compare Rules** on your own loss before settling on one.

## Rules of Thumb

- **Change the rate by factors of 3 to 10**, not by small steps: the U is wide on a log scale.
- **Momentum rho = 0.9** is standard; the effective step along a steady direction is then ten times the learning rate.
- **Adam's default betas (0.9, 0.999)** rarely need changing.
- **AdaGrad's steps only shrink**: good for convex problems with sparse gradients, too timid for long non-convex training.
- **The noise floor scales with the learning rate**: a smaller rate gives a lower floor, reached more slowly.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
