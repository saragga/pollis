# Decision Guide

| Situation | Class and method |
|---|---|
| Smooth f, up to a few thousand variables | Gradient Required: **BFGS** |
| Smooth f, many variables | Gradient Required: **L-BFGS**, or Conjugate Gradient |
| Smooth f, small n, exact Hessian cheap | Hessian Required: **Newton**, or **Newton Trust Region** far from the minimum |
| Box bounds, smooth f | Gradient Required with bounds (Fminbox), or **IPNewton** |
| Non-smooth, noisy or black-box f, few variables | Gradient Free: **Nelder-Mead** |
| Several local minima suspected | **Multi-Start**, or Simulated Annealing or Particle Swarm |
| General constraints | Constrained Optimisation, Nonlinear Programming |

## Decision Flow

1. **Is f smooth?** If not, use Nelder-Mead; derivatives of a kinked f mislead.
2. **Can f be differentiated through?** Use :forward; :finite only when it cannot.
3. **How many variables?** BFGS up to a few thousand, L-BFGS above; Newton only when the Hessian is small and cheap.
4. **Bounds?** Set them; x0 must be strictly inside.
5. **Check convergence**: the flag, g_converged and the gradient norm.
6. **Check the minimum**: positive Hessian eigenvalues, and Multi-Start for other basins.

## Rules of Thumb

- **Start with BFGS** on a smooth problem; it is the best default.
- **Gradient Descent is a teaching method**: it is the slowest of the four on anything ill-conditioned.
- **Nelder-Mead slows down above about ten variables**.
- **Compare Algorithms** on your own f: the right method is the one that reaches the same minimum with the fewest calls.
- **Rescale before switching methods**: poor scaling hurts all of them.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
