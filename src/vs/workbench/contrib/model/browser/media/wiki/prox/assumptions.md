# Assumptions

## Convexity
All five methods assume F is **convex**: the least-squares loss is convex, and the three penalties are norms, hence convex. Convexity makes every local minimum global and gives the methods their guarantees. On nonconvex nonsmooth problems (an L0 penalty, a nonconvex loss) they may still run, without guarantees.

## A Smooth Part and a Simple Part
The proximal methods rely on splitting F into pieces whose proximal maps are **cheap**: the penalty's prox has a closed form; the loss's prox is a linear solve with I + t A'A (Douglas-Rachford), and its conjugate's prox a scaling (Chambolle-Pock). Problems whose pieces have no cheap prox need inner solvers, which the Proximal Point method illustrates.

## Lipschitz Gradient of the Loss
The reference solver and the residual use the Lipschitz constant of the loss's gradient, L = ||A||^2, its largest curvature. It is computed exactly here; for large problems an estimate or a line search replaces it.

## Bounded Subgradients
The subgradient and bundle methods assume subgradients are bounded on the region explored. The loss's gradient grows with ||x||, so very large steps can make the subgradient method wander far before the diminishing step brings it back.

## Step Sizes
Each method has its own condition on **Step Size**:
- Subgradient: the step at iteration k is step / sqrt(k), diminishing, which the convergence proof requires.
- Bundle: 1 / step is the proximal weight around the stability centre.
- Chambolle-Pock: tau = step and sigma = 0.99 / (step L), so that tau sigma ||A||^2 < 1.
- Douglas-Rachford and Proximal Point: any positive step converges; its size changes the speed.

## The Problem Is Synthetic
A, x_true and the noise are random, seeded for reproducibility, so the **Sparsity Pattern** can be checked against a known truth. Recovering the support needs enough observations relative to the sparsity and a well-chosen penalty weight.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
