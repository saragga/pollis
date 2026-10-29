# Decision Guide

| Situation | Method | Line Search | Why |
|---|---|---|---|
| Smooth problem, default choice | **Conjugate Gradient** | HagerZhang | Faster than gradient descent at the same cost |
| Teaching, or a baseline | **Gradient Descent** | HagerZhang or BackTracking | The simplest method; shows the effect of conditioning |
| Expensive function, cheap gradient | Either | **BackTracking** | Fewer function calls per iteration |
| Precise steps wanted | Either | **MoreThuente** or **StrongWolfe** | Classic Wolfe line searches |
| Small or medium problem, ill-conditioned | **BFGS** (Compare) | HagerZhang | Builds curvature information |
| Very many variables, ill-conditioned | **Conjugate Gradient**, or L-BFGS | HagerZhang | Little memory, better rate |
| Non-smooth or constrained | Not these methods | | Proximal, constrained or derivative-free methods |

## Decision Flow

1. **Is f smooth and unconstrained?** If not, go to another panel.
2. **Can the gradient be computed by automatic differentiation?** Use :forward; fall back to :finite only if it cannot.
3. **Start with Conjugate Gradient** and the default line search.
4. **Converging slowly?** Read the Conditioning; rescale the variables, or move to a quasi-Newton method.
5. **Several local minima?** Run from several x0, or use a global optimiser.

## Rules of Thumb
- **Conjugate gradient beats gradient descent** on nearly every problem.
- **Scale the variables** to similar magnitudes before blaming the method.
- **Check the convergence flag**, not just the final value.

## See Also
- [Overview](overview.md) · [Gradient Descent](gradient-descent.md) · [Conjugate Gradient](conjugate-gradient.md)
