# Interpretation

## Solution Summary
The **Solution Summary** gives the final parameters, the loss, the loss at the start, the improvement, the true gradient norm and the iterations. With noise, the final parameters are a random draw from the cloud around the minimum: a different seed would give a slightly different answer. The **late average loss** of the main result, over the last 10% of iterations, is a steadier measure of where the method settled.

## Iterate Averaging
**Iterate Averaging** compares the last iterate with the mean of the second half of the path, the Polyak-Ruppert average. Averaging cancels much of the noise: for SGD on a convex loss it achieves the best possible rate of convergence even with a constant rate, as long as the averaging window is long. When the averaged loss is far below the last one, the result was limited by noise; when they are similar, by the rule or the iterations.

## Per-Parameter Progress
**Per-Parameter Progress** reports, for each parameter, its start and final value, the distance travelled, its jitter over the last 10% of iterations and the remaining gradient. Under SGD, parameters along steep directions jitter more and those along flat directions travel less; adaptive methods even this out, moving each parameter at a similar pace. A large remaining gradient on one parameter shows where the method is still making progress.

## Compare Methods
**Compare Methods** runs SGD, Momentum, Nesterov, Adam, AdaMax and AdaGrad at the **same learning rate** over five seeds and reports the mean and spread of the late average loss. The same rate means different steps in different rules, so this compares the rules at your setting, not at their best: a poor showing may be cured by a different rate. Use the **Learning-Rate Sensitivity** with each rule before drawing conclusions, or the First-Order Methods panel's comparison, which tunes each rule first.

## Evaluate at New Point
**Evaluate at New Point** compares the loss at another parameter vector with the trained one.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
