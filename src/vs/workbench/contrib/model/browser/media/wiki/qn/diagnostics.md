# Diagnostics

## Convergence Trace
The **Convergence Trace** plots f(x_k) - f* and the gradient norm against the iteration, on a log scale. Quasi-Newton runs typically show a slow early phase, while the approximation learns the curvature, then a curve that **bends downward**: the error falls faster than any fixed ratio, the mark of superlinear convergence. A straight line (a constant ratio) means linear convergence, as from a poor approximation or a degenerate minimum; a plateau means the method is stuck.

## Contour + Path
For two-variable problems, the **Contour + Path** draws the iterates on the contours of f; with more variables, the others are held at the optimum. It shows whether the path follows the valley or zigzags across it, and whether the method found the minimum the start suggests.

## Convergence Check
The **Convergence Check** reports Optim's convergence flag, the iterations, the function and gradient calls, the final gradient norm, and the **ratios of successive errors** ||x_k+1 - x*|| / ||x_k - x*|| over the last steps. Ratios tending to zero are superlinear convergence; ratios steady near a constant are linear. Optim declares convergence by default when the largest gradient component falls below 1e-8, or after 1000 iterations without it, which is not convergence. A converged flag with a large gradient norm, or an unconverged run with a small one, both deserve a look at the tolerances.

## Gradient Check
The **Gradient Check** compares the automatic-differentiation gradient with a finite-difference one, at x0 and at the solution. The check uses central differences, accurate to about 1e-10 relative to the size of the gradient on a well-scaled f; differences of that order are normal (the forward differences the **Derivatives** option :finite uses are less accurate, about 1e-8); larger ones point to a non-smooth f or a mistake in a hand-coded gradient. At the solution both should be near zero.

## Failures and What They Mean
- **Line search failure**: the direction is not a descent direction, or f is not smooth, or the gradient is inaccurate. Check the gradient; try another line search.
- **Iteration limit reached**: a slow problem (badly scaled, flat) or a non-smooth one. Rescale, or use more iterations after looking at the trace.
- **NaN or Inf**: the iterates left the domain of f (a log of a negative number). Reparametrise (optimise log sigma, not sigma) rather than clipping.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Convergence flag | Converged on the gradient tolerance | Iteration limit reached |
| Final gradient norm | Near the tolerance | Far above it |
| Error ratios | Tending to zero | Steady near one |
| Gradient check | Differences near 1e-10 (relative) | Large differences |
| Trace | Bending downward | Straight line or plateau |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
