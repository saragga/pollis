# Diagnostics

## Loss Curve
The **Loss Curve** shows the loss at each iteration on a log scale, with a 50-step moving average. Expect a descent followed by a plateau: the **noise floor**. Its height reflects the learning rate and the noise, not a failure. A rising curve or NaN means the rate is too large; a curve still descending at the end means more iterations are needed.

## Parameter Trajectory
The **Parameter Trajectory** draws the noisy path on the contours of f, for the first two parameters. SGD zigzags across steep directions; Adam moves at about the learning rate in every coordinate at first; AdaGrad's steps visibly shrink. At the end, all paths wander in a small cloud around the minimum.

## Learning-Rate Sensitivity
The **Learning-Rate Sensitivity** reruns the method for rates from 1e-4 to 1 and plots the late average loss. The best rates sit at the bottom of a U: smaller rates have not arrived after the iterations given, larger ones bounce in a wide cloud or diverge. Compare the dashed line, the current rate, with the bottom of the U.

## Convergence Check
The **Convergence Check** reports the true gradient norm at the final parameters, and the mean, spread and slope of the loss over the last 10% of iterations. **stationary** is true when the change implied by the slope over that window is smaller than the spread: the loss has stopped falling and only noise remains. A gradient norm of the order of the noise times the square root of the learning rate is typical of the floor.

## Noise Robustness
**Noise Robustness** plots the late average loss of SGD, Adam, AdaMax and AdaGrad against noise levels from 0 to 2. At noise 0 the methods are deterministic and reach very low losses; the slope of each curve shows how fast it degrades.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Loss curve | Descends, then a flat floor | Rising, NaN, or still descending |
| Learning rate | At the bottom of the U | On a steep side |
| Stationary | true | false |
| Averaged vs last iterate | Averaged lower | Much higher: too few iterations |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
