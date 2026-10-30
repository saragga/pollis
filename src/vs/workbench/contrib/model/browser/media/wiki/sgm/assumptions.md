# Assumptions

## Unbiased Gradient Estimates
The theory assumes the noisy gradient has the true gradient as its mean. A minibatch gradient is unbiased when the minibatches are drawn at random, with or without replacement within an epoch; data fed in a fixed, sorted order are not, and can bias the path. The panel's noise is Gaussian, independent across steps and parameters, and unbiased by construction.

## Bounded Variance
The noise must have **finite variance**, ideally not much larger than the squared gradient far from the minimum. Heavy-tailed noise, from outliers or very small batches, produces occasional huge steps; Adam and AdaMax, which normalise the step, cope better than SGD.

## A Smooth Loss
f must be differentiable for Enzyme to compute its gradient, and its curvature should be bounded: SGD with a learning rate above 2 / L, L the largest curvature, diverges. The default loss has curvatures 2 and 20, so SGD needs a rate below 0.1.

## Constant Rate, No Convergence
With a constant learning rate the iterates converge only **in distribution**, to a stationary cloud around the minimiser. Convergence to the point needs the Robbins-Monro conditions on a decreasing rate, the steps summing to infinity while their squares do not, or an average of the iterates. The panel keeps the rate constant, so the noise floor is visible; **Iterate Averaging** shows the second remedy.

## A Local Minimum
On non-convex losses the methods find a local minimum or a flat region; the noise helps escape saddle points but guarantees nothing global.

## Scaling
SGD assumes the parameters are on similar scales: along a direction of small curvature it creeps, along one of large curvature it oscillates. The adaptive rules divide by a per-parameter scale and are much less sensitive, which **Per-Parameter Progress** shows.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
