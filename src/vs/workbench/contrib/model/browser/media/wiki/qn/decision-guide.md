# Decision Guide

| Situation | Method |
|---|---|
| Smooth, up to a few thousand variables | **BFGS** |
| Smooth, many variables (thousands to millions) | **L-BFGS** |
| Hessian cheap and exact (small n, automatic differentiation) | Newton: fewer iterations near the solution |
| Very large, memory-bound, gradient cheap | Conjugate gradient, or L-BFGS with small m |
| Non-smooth or noisy objective | Nelder-Mead or another derivative-free method, not quasi-Newton |
| Bounds on the variables | Fminbox around L-BFGS in Optim |
| Quadratic objective with linear constraints | Quadratic Programming |

## Decision Flow

1. **Is f smooth?** If not, quasi-Newton is the wrong family.
2. **Gradient**: use automatic differentiation if f is written in Julia; finite differences only when it cannot be differentiated through.
3. **Number of variables**: BFGS below a few thousand, L-BFGS above.
4. **Line search**: keep HagerZhang; switch to MoreThuente or StrongWolfe if the line search fails, or to BackTracking when function evaluations are expensive and the problem is convex.
5. **Check convergence**: the flag, the gradient norm and the trace.
6. **Check the minimum**: positive Hessian eigenvalues, and the same minimum from other starts.

## Rules of Thumb

- **Memory m** between 5 and 20 is typical; beyond 20 the gain is usually small.
- **BFGS and L-BFGS reach the same minimum** from the same start on a well-behaved problem; they differ in cost.
- **Scale the variables** to similar magnitudes before blaming a quasi-Newton method.
- **More iterations do not fix** a line-search failure: look at the gradient and the smoothness of f.
- **Use the exact Hessian**, not the quasi-Newton approximation, for standard errors.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
