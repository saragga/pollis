# Diagnostics

## Loss Curve
The **Loss Curve** plots the loss at every iteration on a log scale, with a 50-step moving average. A healthy run falls and then flattens at a **noise floor**, whose height is set by the learning rate and the gradient noise: halving either lowers it. A curve that rises or turns into NaN means the learning rate is too large; one that is still falling steeply at the end means too few iterations or too small a rate.

## Parameter Trajectory
For two-parameter problems, the **Parameter Trajectory** draws the iterates on the contours of f. SGD zigzags across a narrow valley; momentum overshoots and swings back; the adaptive rules move almost diagonally at first, since every coordinate steps by about the learning rate. With noise the end of the path is a cloud around the minimum, not a point.

## Learning-Rate Sensitivity
The **Learning-Rate Sensitivity** runs the rule over a grid of learning rates from 1e-4 to 1 and plots the average loss over the last 10% of iterations. The curve is U-shaped: too small a rate stalls, too large a rate bounces or diverges. The dashed line is the current rate: it should sit in the flat bottom of the U, and on the low side of it when the run is short of iterations.

## Convergence Check
The **Convergence Check** reports the norm of the true (noiseless) gradient at the final parameters, and, over the last 10% of iterations, the mean and spread of the loss and the slope of a line through it. **stationary** is true when the slope over that window is smaller than the spread: the loss has stopped falling, and what remains is noise.

## Failures and What They Mean
- **NaN or Inf**: the learning rate is too large for the curvature; reduce it by a factor of 10.
- **Loss stuck high**: too small a rate, or AdaGrad's steps have shrunk too far.
- **Floor too high**: noise; lower the rate late in training, or use Iterate Averaging.
- **AdamW short of the minimum**: expected; weight decay pulls the parameters towards 0.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Loss curve | Falls, then flat | Rising, NaN, or still falling steeply |
| Learning rate | In the flat bottom of the U | On the steep side |
| Stationary | true | false at the end |
| Gradient norm | Small, at the scale of the noise floor | Large |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
