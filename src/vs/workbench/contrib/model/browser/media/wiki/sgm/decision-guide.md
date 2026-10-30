# Decision Guide

| Situation | Method |
|---|---|
| A default for noisy, badly scaled gradients and deep learning | **Adam** |
| Well-scaled problem, a baseline, or with a tuned schedule | **SGD** |
| Gradients with occasional large spikes; embeddings | **AdaMax** |
| Sparse features, convex problems | **AdaGrad** |
| Weight decay, momentum, Nesterov, RMSProp | First-Order Methods panel |
| No noise, moderate size, precision needed | BFGS or Newton |

## Decision Flow

1. **Start with Adam** at 0.001 to 0.01.
2. **Check the Loss Curve**: lower the rate by 10 if it diverges, raise it if the loss barely moves.
3. **Run the Learning-Rate Sensitivity** and set the rate near the bottom of the U.
4. **Average the iterates**, or lower the rate in a second phase, to get below the noise floor.
5. **Compare Methods**, with each at a sensible rate, before switching.

## Rules of Thumb

- **Halving the learning rate roughly halves the noise floor** in SGD, at the cost of slower progress.
- **More noise needs a smaller rate**: test with **Noise Robustness**.
- **Adam's step is about the learning rate per parameter**, whatever the gradient's scale; SGD's is the rate times the gradient.
- **AdaGrad tolerates larger rates** (0.1 is common), because its steps shrink over time.
- **Report the averaged or late-average result**, not the last noisy iterate.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
