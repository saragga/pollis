# Interpretation

## Solution Summary
The **Solution Summary** gives the final parameters, their loss, the loss at the start, the improvement and the true gradient norm. With noise, the final parameters are **one draw** from the cloud the iterates wander in: another seed gives a slightly different answer. The late average loss of the main result is a steadier summary than the final loss.

## Iterate Averaging
**Iterate Averaging** (Polyak and Ruppert) takes the mean of the second half of the iterates. The noise in the steps largely cancels in the average, which usually lands closer to the minimiser, and has a lower loss, than the last iterate. When the averaged loss is much lower, the result is limited by noise, not by the rule.

## Optimiser State
The **Optimiser State** shows what the rule carries from step to step: nothing for SGD, a velocity for Momentum and Nesterov, the accumulated squares for AdaGrad, a moving average of squares for RMSProp, and the first and second moment estimates for the Adam family. In Adam, the second moment tracks the gradient variance: with noise it does not go to zero near the minimum, which is why Adam's steps stay at about the learning rate times the signal-to-noise ratio there.

## Compare Rules
**Compare Rules** tunes each of the eight rules on its own grid of learning rates on one seed, then reports the late average loss over five fresh seeds, with its spread. Compare rules by those figures at their **best** rates, never at a shared one: the same number means a different step in each rule.

## Optimization.jl Interface
**Optimization.jl Interface** runs the same rule through Optimization.jl, the common interface to Optim, NLopt and the other solvers, and checks its result against the panel's hand-written loop without noise. The two should agree; the interface is how to swap in other solvers later.

## Evaluate at New Point
**Evaluate at New Point** compares the loss at another parameter vector with the trained one.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
